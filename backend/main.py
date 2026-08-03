from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

import os

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain
from langchain_community.vectorstores import FAISS
from langchain_core.embeddings import Embeddings
from langchain_groq import ChatGroq

from sentence_transformers import SentenceTransformer

# -----------------------------
# Load Environment Variables
# -----------------------------
load_dotenv()

# -----------------------------
# FastAPI App
# -----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Custom SentenceTransformer Embeddings
# -----------------------------
class SentenceTransformerEmbeddings(Embeddings):
    def __init__(self, model_name="all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)

    def embed_documents(self, texts):
        embeddings = self.model.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True,
        )
        return embeddings.tolist()

    def embed_query(self, text):
        embedding = self.model.encode(
            text,
            convert_to_numpy=True,
            normalize_embeddings=True,
        )
        return embedding.tolist()

# -----------------------------
# Global Variables
# -----------------------------
conversation_history = []
qa_chain = None
vector_store = None

# -----------------------------
# Request Model
# -----------------------------
class ChatMessage(BaseModel):
    message: str

# -----------------------------
# Upload PDF
# -----------------------------
@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    global qa_chain, vector_store, conversation_history

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    try:
        conversation_history = []

        os.makedirs("uploads", exist_ok=True)

        file_path = os.path.join("uploads", file.filename)

        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Load PDF
        loader = PyPDFLoader(file_path)
        documents = loader.load()

        # Split PDF
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
        )

        splits = splitter.split_documents(documents)

        # Sentence Transformer Embeddings
        embeddings = SentenceTransformerEmbeddings(
            model_name="all-MiniLM-L6-v2"
        )

        # Create Vector Store
        vector_store = FAISS.from_documents(
            splits,
            embeddings,
        )

        retriever = vector_store.as_retriever(
            search_type="mmr",
            search_kwargs={"k": 5},
        )

        # Groq LLM
        llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0,
        )

        # Conversational RAG
        qa_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=retriever,
        )

        # Summary
        summary_prompt = """
        Summarize this PDF in detail.

        Include:
        - Main topic
        - Important concepts
        - Key points
        - Technical terms
        - Final conclusion
        """

        summary = qa_chain.invoke(
            {
                "question": summary_prompt,
                "chat_history": [],
            }
        )

        return {
            "summary": summary["answer"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# Chat
# -----------------------------
@app.post("/chat/")
async def chat(message: ChatMessage):
    global qa_chain, conversation_history

    if qa_chain is None:
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF first.",
        )

    try:
        response = qa_chain.invoke(
            {
                "question": message.message,
                "chat_history": conversation_history,
            }
        )

        conversation_history.append(
            (
                message.message,
                response["answer"],
            )
        )

        return {
            "response": response["answer"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# Health Check
# -----------------------------
@app.get("/")
def root():
    return {
        "status": "running",
        "message": "PDF AI Backend using Groq + Sentence Transformers"
    }
