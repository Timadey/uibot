from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import cohere
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import numpy as np
import pandas as pd

import os

load_dotenv()
COHERE_API_KEY  = os.getenv("COHERE_API_KEY")
APP_URL = os.getenv("APP_URL")
REACT_APP_URL = os.getenv("REACT_APP_URL")

co = cohere.Client(COHERE_API_KEY)

app = FastAPI()

# Allow CORS for frontend
origins = [
    "http://localhost:3000",
    APP_URL,
    REACT_APP_URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = SentenceTransformer("all-MiniLM-L6-v2")
df = pd.read_pickle("ui-site-embeddings.pkl")

class Query(BaseModel):
    query: str

    def get_embedding(self):
        return model.encode(self.query).tolist()

@app.post("/chat")
async def chat(query: Query):
    response = process_query(query)
    return {"response": response}


def process_query(query: Query):
    question_embedding = query.get_embedding()

    def get_distance(page_embedding):
      return np.dot(page_embedding, question_embedding) 

    distance_series = df['embeddings'].apply(get_distance)
    top_five = distance_series.sort_values(ascending=False).head(5)

    text_series = df.loc[top_five.index, 'text']
    context = "\n\n".join(text_series)

    system_prompt = (
    "You are an AI assistant for the University of Ibadan. "
    "You provide helpful, professional, and accurate responses to students, faculty, "
    "and staff regarding university-related inquiries. "
    "Always maintain a polite and informative tone.\n\n"
    )

    response = co.chat(
        message=system_prompt + query.query,  #
        documents=[{"text": context}],  # Inject retrieved docs
        model="command-r",
        # chat_history=chat_memory,  # Pass chat memory
       
    )

    # chat_memory.append({"role": "user", "message": user_query})
    # chat_memory.append({"role": "assistant", "message": response.text})

    return response.text