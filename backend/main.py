from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from typing import Optional

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI

from langchain.chains import ConversationalRetrievalChain

from langchain_community.vectorstores import FAISS





app = FastAPI()

os.environ["GOOGLE_API_KEY"]="AIzaSyBat0dU7usJbCNNfGqlXrj4v7WGU7vWuG0"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "PDF Summarizer API is running", "status": "healthy"}

@app.get("/summary-options")
async def get_summary_options():
    """Get available summary length options"""
    return {
        "options": {
            "short": {
                "name": "Short Summary",
                "description": "100-150 words, only key points",
                "estimated_words": "100-150"
            },
            "medium": {
                "name": "Medium Summary", 
                "description": "200-300 words, balanced detail",
                "estimated_words": "200-300"
            },
            "long": {
                "name": "Detailed Summary",
                "description": "400-600 words, comprehensive coverage", 
                "estimated_words": "400-600"
            },
            "custom": {
                "name": "Custom Length",
                "description": "Specify exact word count or sentences",
                "options": {
                    "word_count": "Specify number of words (e.g., 250)",
                    "sentences": "Specify number of sentences (e.g., 5)"
                }
            }
        }
    }


conversation_history = []
qa_chain = None
vector_store = None

class ChatMessage(BaseModel):
    message: str

class SummaryConfig(BaseModel):
    length: str = "medium"  # short, medium, long, custom
    word_count: Optional[int] = None  # for custom length
    sentences: Optional[int] = None   # for custom length
    
def get_summary_prompt(config: SummaryConfig) -> str:
    """Generate summary prompt based on user configuration"""
    
    base_prompt = (
        "You are an expert summarizer. Analyze the uploaded PDF thoroughly and produce a well-structured summary.\n\n"
        "Your summary must include:\n"
        "1. An **overview** of the document's purpose and scope.\n"
        "2. **Key points** covering major sections and important information.\n"
        "3. **Main arguments, facts, data, and conclusions**.\n"
        "4. Important **technical terms and definitions** (if any).\n"
    )
    
    if config.length == "short":
        length_instruction = (
            "\n**LENGTH REQUIREMENT: SHORT SUMMARY**\n"
            "- Keep the summary to 100-150 words maximum\n"
            "- Focus only on the most critical points\n"
            "- Use 3-5 bullet points for key takeaways\n"
            "- Be concise and direct\n"
        )
    elif config.length == "medium":
        length_instruction = (
            "\n**LENGTH REQUIREMENT: MEDIUM SUMMARY**\n"
            "- Keep the summary to 200-300 words\n"
            "- Include main sections and important details\n"
            "- Use 5-8 bullet points for comprehensive coverage\n"
            "- Balance detail with brevity\n"
        )
    elif config.length == "long":
        length_instruction = (
            "\n**LENGTH REQUIREMENT: DETAILED SUMMARY**\n"
            "- Provide a comprehensive summary of 400-600 words\n"
            "- Include detailed section-wise breakdown\n"
            "- Cover all major headings and subheadings\n"
            "- Use 8-12 bullet points with sub-points where needed\n"
            "- Include examples and specific details\n"
        )
    elif config.length == "custom":
        if config.word_count:
            length_instruction = (
                f"\n**LENGTH REQUIREMENT: CUSTOM WORD COUNT**\n"
                f"- Keep the summary to approximately {config.word_count} words\n"
                "- Adjust the level of detail to match the word count\n"
                "- Ensure all important information is covered within the limit\n"
            )
        elif config.sentences:
            length_instruction = (
                f"\n**LENGTH REQUIREMENT: CUSTOM SENTENCE COUNT**\n"
                f"- Provide exactly {config.sentences} sentences\n"
                "- Make each sentence informative and comprehensive\n"
                "- Cover the most important aspects in the given sentences\n"
            )
        else:
            length_instruction = (
                "\n**LENGTH REQUIREMENT: MEDIUM SUMMARY (DEFAULT)**\n"
                "- Keep the summary to 200-300 words\n"
                "- Include main sections and important details\n"
            )
    
    formatting_instruction = (
        "\nMake sure the output is:\n"
        "- Accurate (no hallucinations)\n"
        "- Well formatted with headings and bullet points\n"
        "- Easy to read and understand\n"
    )
    
    return base_prompt + length_instruction + formatting_instruction

@app.post("/upload/")
async def upload_pdf(
    file: UploadFile = File(...),
    length: str = Form("medium"),
    word_count: Optional[int] = Form(None),
    sentences: Optional[int] = Form(None)
):
    global qa_chain, vector_store

    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    try:
        # Create summary configuration
        config = SummaryConfig(
            length=length,
            word_count=word_count,
            sentences=sentences
        )
        
        os.makedirs("uploads", exist_ok=True)
        file_path = os.path.join("uploads", file.filename)
    
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
            
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000000,
            chunk_overlap=200
        )
        splits = text_splitter.split_documents(documents)
           
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        
        vectorstore = FAISS.from_documents(splits, embeddings)
        
        retriever = vectorstore.as_retriever(search_type="mmr", search_kwargs={"k": 5})
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")
                     
        qa_chain = ConversationalRetrievalChain.from_llm(llm, retriever=retriever)
        
        # Generate custom summary prompt based on user preferences
        summary_prompt = get_summary_prompt(config)
        
        summary_response = qa_chain.invoke({"question": summary_prompt, "chat_history": []})
        
        return {
            "summary": summary_response["answer"],
            "config": {
                "length": config.length,
                "word_count": config.word_count,
                "sentences": config.sentences
            },
            "pages": len(documents)
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/")
async def chat(message: ChatMessage):
    global qa_chain, conversation_history
    
    if not qa_chain:
        raise HTTPException(status_code=400, detail="Please upload a PDF first")
    
    try:
     
        response = qa_chain.invoke({"question": message.message, "chat_history": conversation_history})
        
      
        conversation_history.append((message.message, response["answer"]))
        
        return {"response": response["answer"]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

