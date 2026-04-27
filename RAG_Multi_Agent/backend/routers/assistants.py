import os
from fastapi import APIRouter, HTTPException, status
from typing import List
from langchain_openai import AzureChatOpenAI
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv

import schemas
from storage import assistants_store, documents_store, conversations_store, messages_store
from services.rag_service import delete_assistant_from_store, get_retriever, get_raw_chunks

load_dotenv()

router = APIRouter(prefix="/api/assistants", tags=["assistants"])


def _get_llm(temperature=0.0):
    return AzureChatOpenAI(
        azure_deployment=os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT"),
        azure_endpoint=os.getenv("AZURE_OPENAI_CHAT_ENDPOINT"),
        api_key=os.getenv("AZURE_OPENAI_CHAT_KEY"),
        openai_api_version=os.getenv("AZURE_OPENAI_CHAT_API_VERSION"),
        temperature=temperature,
    )


@router.post("/", response_model=schemas.Assistant)
def create_assistant(assistant: schemas.AssistantCreate):
    return assistants_store.insert(assistant.dict())


@router.get("/", response_model=List[schemas.Assistant])
def list_assistants():
    return assistants_store.all()


@router.get("/{assistant_id}", response_model=schemas.Assistant)
def get_assistant(assistant_id: int):
    a = assistants_store.get(assistant_id)
    if not a:
        raise HTTPException(status_code=404, detail="Asistente no encontrado")
    return a


@router.put("/{assistant_id}", response_model=schemas.Assistant)
def update_assistant(assistant_id: int, assistant: schemas.AssistantCreate):
    a = assistants_store.update(assistant_id, assistant.dict())
    if not a:
        raise HTTPException(status_code=404, detail="Asistente no encontrado")
    return a


@router.delete("/{assistant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assistant(assistant_id: int):
    if not assistants_store.get(assistant_id):
        raise HTTPException(status_code=404, detail="Asistente no encontrado")

    try:
        delete_assistant_from_store(assistant_id)
    except Exception:
        pass

    for doc in documents_store.filter(assistant_id=assistant_id):
        if os.path.exists(doc["filepath"]):
            os.remove(doc["filepath"])
        documents_store.delete(doc["id"])

    for conv in conversations_store.filter(assistant_id=assistant_id):
        for msg in messages_store.filter(conversation_id=conv["id"]):
            messages_store.delete(msg["id"])
        conversations_store.delete(conv["id"])

    assistants_store.delete(assistant_id)
    return None


@router.post("/{assistant_id}/generate-instructions")
def generate_instructions(assistant_id: int):
    a = assistants_store.get(assistant_id)
    if not a:
        raise HTTPException(status_code=404, detail="Asistente no encontrado")

    # Read uploaded files directly — no Azure Search dependency, works immediately after upload
    docs_meta = documents_store.filter(assistant_id=assistant_id)
    if not docs_meta:
        raise HTTPException(status_code=400, detail="No hay documentos. Sube al menos un archivo primero.")

    from langchain_community.document_loaders import (
        PyMuPDFLoader, Docx2txtLoader, TextLoader, UnstructuredPowerPointLoader,
    )

    raw_texts = []
    for doc_meta in docs_meta[:4]:
        filepath = doc_meta.get("filepath", "")
        filename = doc_meta.get("filename", "")
        ext = os.path.splitext(filename)[1].lower()
        if not os.path.exists(filepath):
            continue
        try:
            if ext == ".pdf":
                loader = PyMuPDFLoader(filepath)
            elif ext in [".docx", ".doc"]:
                loader = Docx2txtLoader(filepath)
            elif ext in [".txt", ".md"]:
                loader = TextLoader(filepath)
            elif ext in [".pptx", ".ppt"]:
                loader = UnstructuredPowerPointLoader(filepath)
            else:
                continue
            pages = loader.load()
            text = " ".join(p.page_content for p in pages[:5])[:2000].strip()
            if text:
                raw_texts.append(f"[{filename}]\n{text}")
        except Exception:
            continue

    if not raw_texts:
        raise HTTPException(status_code=500, detail="No se pudo leer el contenido de los documentos subidos.")

    context = "\n\n---\n\n".join(raw_texts)

    prompt = (
        f"El asistente se llama: \"{a['name']}\"\n\n"
        "Analiza los siguientes fragmentos de documentos y genera unas instrucciones de sistema "
        "profesionales y precisas para un asistente IA especializado en este contenido.\n\n"
        "Las instrucciones deben:\n"
        "1. Definir claramente el rol y especialidad del asistente\n"
        "2. Indicar la temática concreta y el tipo de preguntas que puede responder\n"
        "3. Establecer un tono profesional, claro y preciso\n"
        "4. Incluir la indicación de citar siempre el documento fuente al responder\n"
        "5. Indicar que debe declinar responder si la información no está en sus documentos\n"
        "6. Estar completamente en español\n"
        "7. Ser concisas: máximo 150 palabras\n\n"
        f"Fragmentos de documentos:\n{context}\n\n"
        "Genera SOLO las instrucciones de sistema, sin encabezados ni explicaciones adicionales:"
    )

    try:
        llm = _get_llm(temperature=0.3)
        response = llm.invoke([HumanMessage(content=prompt)])
        return {"instructions": response.content.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar instrucciones: {str(e)}")
