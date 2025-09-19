import os
import traceback
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.chains import ConversationalRetrievalChain
from langchain_community.vectorstores import FAISS

app = FastAPI()


os.environ["GOOGLE_API_KEY"] = "AIzaSyDUadmyLHdvYtlDE3f0kug7V-gRqs0x7gc"

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
            f.write(await file.read())

       
        loader = PyPDFLoader(file_path)
        documents = loader.load()

      
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        splits = text_splitter.split_documents(documents)

       
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        vector_store = FAISS.from_documents(splits, embeddings)

        
        retriever = vector_store.as_retriever(search_type="mmr", search_kwargs={"k": 5})
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")
        qa_chain = ConversationalRetrievalChain.from_llm(llm, retriever=retriever)

       
        summary_prompt = (
            "Summarize the uploaded PDF in detail. "
            "Include all major sections, important points, and technical terms if present."
        )
        summary_response = llm.invoke(summary_prompt)

        return {"summary": summary_response.content}

    except Exception as e:
        error_message = f"❌ ERROR in /upload/: {str(e)}"
        print(error_message)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_message)

@app.post("/chat/")
async def chat(message: ChatMessage):
    global qa_chain, conversation_history

    if not qa_chain:
        raise HTTPException(status_code=400, detail="Please upload a PDF first")

    try:
        response = qa_chain.invoke({
            "question": message.message,
            "chat_history": conversation_history
        })

        conversation_history.append((message.message, response["answer"]))

        return {"response": response["answer"]}

    except Exception as e:
        error_message = f"❌ ERROR in /chat/: {str(e)}"
        print(error_message)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_message)
