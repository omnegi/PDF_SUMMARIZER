from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_community.embeddings import FastEmbedEmbeddings
from langchain_community.vectorstores import FAISS

from langchain_groq import ChatGroq
from langchain.chains import ConversationalRetrievalChain

# -------------------------
# Load Environment
# -------------------------


load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")

# -------------------------
# FastAPI
# -------------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://pdf-summarizer-8n35.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Globals
# -------------------------

conversation_history = []
qa_chain = None
vector_store = None

# -------------------------
# Request Model
# -------------------------

class ChatMessage(BaseModel):
    message: str

# -------------------------
# Upload Endpoint
# -------------------------

@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    global qa_chain, vector_store, conversation_history

    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF."
        )

    try:

        conversation_history = []

        os.makedirs("uploads", exist_ok=True)

        file_path = os.path.join("uploads", file.filename)

        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Load PDF
        loader = PyPDFLoader(file_path)
        docs = loader.load()

        # Split Text
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
        )

        splits = splitter.split_documents(docs)

        # FastEmbed Embeddings
        embeddings = FastEmbedEmbeddings(
            model_name="BAAI/bge-small-en-v1.5"
        )

        # Vector DB
        vector_store = FAISS.from_documents(
            splits,
            embeddings
        )

        retriever = vector_store.as_retriever(
            search_type="mmr",
            search_kwargs={"k":5}
        )

        # Groq LLM
        llm = ChatGroq(
            groq_api_key=groq_api_key,
            model="llama-3.3-70b-versatile",
            temperature=0
        )

        qa_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=retriever
        )

        summary_prompt = """
        Summarize the uploaded PDF in detail.

        Include:
        - Main topic
        - Important concepts
        - Key points
        - Technical terms
        - Conclusion
        """

        result = qa_chain.invoke(
            {
                "question": summary_prompt,
                "chat_history": []
            }
        )

        return {
            "summary": result["answer"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# -------------------------
# Chat Endpoint
# -------------------------

@app.post("/chat/")
async def chat(message: ChatMessage):

    global qa_chain, conversation_history

    if qa_chain is None:
        raise HTTPException(
            status_code=400,
            detail="Upload a PDF first."
        )

    try:

        result = qa_chain.invoke(
            {
                "question": message.message,
                "chat_history": conversation_history
            }
        )

        conversation_history.append(
            (
                message.message,
                result["answer"]
            )
        )

        return {
            "response": result["answer"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# -------------------------
# Root
# -------------------------

@app.get("/")
def root():
    return {
        "message": "PDF AI Backend Running 🚀"
    }
