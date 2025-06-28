from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI

from langchain.chains import ConversationalRetrievalChain

from langchain_community.vectorstores import FAISS





app = FastAPI()

os.environ["GOOGLE_API_KEY"]="AIzaSyCWKfOPhEz8K1UtmtbkPAau5EwZVajp7C0"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)








conversation_history = []
qa_chain = None
vector_store = None

class ChatMessage(BaseModel):
    message: str

@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    global qa_chain, vector_store

    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    try:
     
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
           
           
        summary_prompt = (
        "Summarize the uploaded PDF in detail. "
        "Include all major sections, important points, and technical terms if present."
        )
        summary_response = qa_chain.invoke({"question": summary_prompt, "chat_history": []})
            
        
            
        return {"summary": summary_response["answer"]}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/")
async def chat(message: ChatMessage):
    global qa_chain, conversation_history
    
    if not qa_chain:
        raise HTTPException(status_code=400, detail="Please upload a PDF first")
    
    try:
     
        response = qa_chain({"question": message.message, "chat_history": conversation_history})
        
      
        conversation_history.append((message.message, response["answer"]))
        
        return {"response": response["answer"]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

