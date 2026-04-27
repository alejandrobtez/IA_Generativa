import os
import shutil
from fastapi import APIRouter, HTTPException, UploadFile, File, status
from typing import List

import schemas
from storage import assistants_store, documents_store
from services.rag_service import process_and_store_document, delete_document_from_store

router = APIRouter(prefix="/api/assistants/{assistant_id}/documents", tags=["documents"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=schemas.Document)
def upload_document(assistant_id: int, file: UploadFile = File(...)):
    if not assistants_store.get(assistant_id):
        raise HTTPException(status_code=404, detail="Assistant not found")

    file_path = os.path.join(UPLOAD_DIR, f"{assistant_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    doc = documents_store.insert({
        "assistant_id": assistant_id,
        "filename": file.filename,
        "filepath": file_path,
    })

    try:
        process_and_store_document(file_path, file.filename, assistant_id, doc["id"])
    except Exception as e:
        documents_store.delete(doc["id"])
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Error processing document: {str(e)}")

    return doc


@router.get("/", response_model=List[schemas.Document])
def list_documents(assistant_id: int):
    return documents_store.filter(assistant_id=assistant_id)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(assistant_id: int, document_id: int):
    doc = documents_store.get(document_id)
    if not doc or doc["assistant_id"] != assistant_id:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        delete_document_from_store(document_id, assistant_id)
    except Exception:
        pass

    if os.path.exists(doc["filepath"]):
        os.remove(doc["filepath"])

    documents_store.delete(document_id)
    return None
