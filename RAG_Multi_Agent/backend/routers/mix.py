import logging
from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from langchain_openai import AzureChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
import os
from storage import assistants_store
from services.rag_service import get_retriever
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("mix")
router = APIRouter(prefix="/api/mix", tags=["mix"])

llm = AzureChatOpenAI(
    azure_deployment=os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT"),
    azure_endpoint=os.getenv("AZURE_OPENAI_CHAT_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_CHAT_KEY"),
    openai_api_version=os.getenv("AZURE_OPENAI_CHAT_API_VERSION"),
    temperature=0,
)


class MixMessage(BaseModel):
    role: str
    content: str


class MixChatRequest(BaseModel):
    assistant_ids: List[int]
    message: str
    history: List[MixMessage] = []


@router.post("/chat")
def mix_chat(req: MixChatRequest):
    if not req.assistant_ids:
        raise HTTPException(status_code=400, detail="Se requiere al menos un asistente")

    assistants = []
    for aid in req.assistant_ids:
        a = assistants_store.get(aid)
        if not a:
            raise HTTPException(status_code=404, detail=f"Asistente {aid} no encontrado")
        assistants.append(a)

    # Query each assistant's own vector index independently, tag each doc with its source
    all_docs = []
    for a in assistants:
        try:
            retriever = get_retriever(a["id"])
            docs = retriever.invoke(req.message)
            for doc in docs:
                # Tag with assistant name so the LLM knows origin of each chunk
                doc.metadata["_assistant_name"] = a["name"]
            all_docs.extend(docs)
            logger.info("Assistant '%s' contributed %d chunks", a["name"], len(docs))
        except Exception as e:
            logger.warning("Retriever error for assistant '%s': %s", a["name"], e)

    if not all_docs:
        return {
            "answer": "No se encontró información relevante en los documentos de los asistentes seleccionados para responder a tu pregunta.",
            "citations": [],
        }

    # Build context clearly labeled by assistant and document
    context_parts = []
    for doc in all_docs:
        assistant_name = doc.metadata.get("_assistant_name", "desconocido")
        filename = doc.metadata.get("filename", "desconocido")
        context_parts.append(
            f"[Asistente: {assistant_name} | Documento: {filename}]\n{doc.page_content}"
        )
    context_text = "\n\n---\n\n".join(context_parts)

    chat_history = []
    for m in req.history:
        if m.role == "user":
            chat_history.append(HumanMessage(content=m.content))
        else:
            chat_history.append(AIMessage(content=m.content))

    names = " + ".join(a["name"] for a in assistants)
    system = (
        f"Eres un asistente de Chat Global que combina el conocimiento de los siguientes asistentes: {names}.\n"
        "Dispones de fragmentos de documentos provenientes de TODOS los asistentes seleccionados, "
        "claramente etiquetados con su asistente y documento de origen.\n"
        "Responde ÚNICAMENTE basándote en el contexto proporcionado. "
        "Si la información no está en el contexto, indícalo claramente. NO inventes información.\n"
        "Cuando uses información, cita el asistente y el documento fuente.\n\n"
        f"Contexto combinado de {len(all_docs)} fragmentos:\n\n{context_text}"
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])

    chain = prompt | llm

    try:
        response = chain.invoke({"input": req.message, "chat_history": chat_history})
        answer = response.content
    except Exception as e:
        logger.error("Error en Chat Global: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

    citations = list(set(
        doc.metadata.get("filename") for doc in all_docs if doc.metadata.get("filename")
    ))

    return {"answer": answer, "citations": citations}
