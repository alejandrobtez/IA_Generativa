import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import assistants, documents, conversations, mix

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)

app = FastAPI(title="Multi-Assistant RAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)

app.include_router(assistants.router)
app.include_router(documents.router)
app.include_router(conversations.router)
app.include_router(mix.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Multi-Assistant RAG API"}
