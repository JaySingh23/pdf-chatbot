from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
import uuid
from pathlib import Path
import pymupdf  # PyMuPDF
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.huggingface import HuggingFaceInferenceAPI
import openai
from openai import OpenAI
import logging


# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

openai.api_key = os.getenv('xxx')
access_token = 'xxx'

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File storage path
UPLOAD_DIR = "uploads"
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

# Pydantic models
class UploadResponse(BaseModel):
    id: str

class AskQuestionRequest(BaseModel):
    document_id: str
    question: str
    conversation_history: List[dict] = []

class AskQuestionResponse(BaseModel):
    answer: str

@app.post("/upload/", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")
    
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    
    # Extract text from PDF and save it
    document_text = extract_text_from_pdf(file_path)
    save_extracted_text(file_id, document_text)
    
    return UploadResponse(id=file_id)

@app.post("/ask/", response_model=AskQuestionResponse)
async def ask_question(request: AskQuestionRequest):
    document_text = load_extracted_text(request.document_id)
    
    if document_text is None:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    answer = get_answer_from_text(request.document_id, request.question, request.conversation_history)
    
    return AskQuestionResponse(answer=answer)

def extract_text_from_pdf(file_path: str) -> str:
    doc = pymupdf.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def save_extracted_text(document_id: str, text: str):
    text_path = os.path.join(UPLOAD_DIR, f"{document_id}.txt")
    with open(text_path, "w", encoding="utf-8") as file:
        file.write(text)

def load_extracted_text(document_id: str) -> str:
    text_path = os.path.join(UPLOAD_DIR, f"{document_id}.txt")
    if not os.path.exists(text_path):
        return None
    with open(text_path, "r", encoding="utf-8") as file:
        return file.read()

def get_answer_from_text(document_id: str, question: str, conversation_history: List[dict]) -> str:
    try:
        embed_model = HuggingFaceEmbedding(
            model_name="BAAI/bge-small-en-v1.5"
        )
        llm = HuggingFaceInferenceAPI(model_name = "mistralai/Mistral-7B-Instruct-v0.3", token=access_token)
        logger.info(llm)
        
        reader = SimpleDirectoryReader(input_files=[os.path.join(UPLOAD_DIR, f"{document_id}.txt")])
        documents = reader.load_data()

        # Combine conversation history with the new question
        combined_text = question

        # Create the index
        logger.info('Creating index')

        index = VectorStoreIndex.from_documents(
            documents, 
            embed_model = embed_model, llm= llm
        )
        
        logger.info('Index created')
        # Query the index with the combined text for a concise answer
        query_engine = index.as_query_engine(llm = llm)
        response = query_engine.query(combined_text)
        
        logger.info(f"Full response: {response}")

        response_str = str(response)

        return response_str
            
    except Exception as e:
        # Handle any other exceptions from LlamaIndex
        print(f"Error getting answer: {e}")
        return "Sorry, I encountered an error while processing your question."