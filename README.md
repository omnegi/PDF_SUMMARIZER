#📄 AI PDF Summarizer#
A full-stack application that allows users to upload PDFs, automatically summarizes their content using a Large Language Model (Gemini via LangChain), and enables conversational follow-up querying. Built with FastAPI, React, and Google's Generative AI.

🚀 Features
🧠 Generate instant summaries for uploaded PDFs

💬 Ask follow-up questions in natural language

⚡ Chunk and embed content via LangChain + FAISS

🌍 Cross-origin enabled for smooth frontend-backend communication

📦 Lightweight and modular design

🛠️ Tech Stack
Frontend: React , Tailwind, Lucide Icons

Backend: FastAPI, LangChain, FAISS

LLM: Google Generative AI (Gemini 1.5)

Embeddings: models/embedding-001

PDF Parsing: PyPDFLoader

Storage: Local file system

📦 Installation
#Backend#
bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
Then run the backend:
bash
uvicorn main:app --reload

#Frontend#
bash
cd frontend
npm install
npm run dev
