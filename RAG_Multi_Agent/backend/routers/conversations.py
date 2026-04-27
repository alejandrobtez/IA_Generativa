import json
import logging
from fastapi import APIRouter, HTTPException
from typing import List
from langchain_openai import AzureChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_classic.chains import create_history_aware_retriever, create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.messages import HumanMessage, AIMessage

import os
import schemas
from storage import assistants_store, conversations_store, messages_store
from services.rag_service import get_retriever
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("rag")
router = APIRouter(prefix="/api/conversations", tags=["conversations"])
llm = AzureChatOpenAI(
    azure_deployment=os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT"),
    azure_endpoint=os.getenv("AZURE_OPENAI_CHAT_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_CHAT_KEY"),
    openai_api_version=os.getenv("AZURE_OPENAI_CHAT_API_VERSION"),
    temperature=0,
)

CONTEXTUALIZE_PROMPT = (
    "Given a chat history and the latest user question "
    "which might reference context in the chat history, "
    "formulate a standalone question which can be understood "
    "without the chat history. Do NOT answer the question, "
    "just reformulate it if needed and otherwise return it as is."
)

QA_INSTRUCTIONS = """
You are answering questions based ONLY on the provided context below.
If you cannot find the answer in the context, clearly state that you cannot answer based on the provided information. DO NOT invent information.
When referencing information from the context, always include citations using the document filename provided in the metadata.

Context:
{context}
"""


@router.post("/", response_model=schemas.Conversation)
def create_conversation(conv: schemas.ConversationCreate):
    if not assistants_store.get(conv.assistant_id):
        raise HTTPException(status_code=404, detail="Assistant not found")
    return conversations_store.insert({"assistant_id": conv.assistant_id, "title": conv.title or "New Chat"})


@router.get("/", response_model=List[schemas.Conversation])
def list_conversations(assistant_id: int = None):
    if assistant_id:
        return conversations_store.filter(assistant_id=assistant_id)
    return conversations_store.all()


@router.get("/{conversation_id}", response_model=schemas.ConversationWithMessages)
def get_conversation(conversation_id: int):
    conv = conversations_store.get(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    msgs = sorted(messages_store.filter(conversation_id=conversation_id), key=lambda m: m["created_at"])
    return {**conv, "messages": msgs}


@router.patch("/{conversation_id}", response_model=schemas.Conversation)
def patch_conversation(conversation_id: int, updates: dict):
    conv = conversations_store.get(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    updated = conversations_store.update(conversation_id, updates)
    return updated


@router.delete("/{conversation_id}")
def delete_conversation(conversation_id: int):
    if not conversations_store.get(conversation_id):
        raise HTTPException(status_code=404, detail="Conversation not found")
    for msg in messages_store.filter(conversation_id=conversation_id):
        messages_store.delete(msg["id"])
    conversations_store.delete(conversation_id)
    return {"message": "Deleted"}


@router.post("/{conversation_id}/messages", response_model=schemas.Message)
def post_message(conversation_id: int, message_req: schemas.MessageCreateRequest):
    conv = conversations_store.get(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    assistant = assistants_store.get(conv["assistant_id"])

    messages_store.insert({"conversation_id": conversation_id, "role": "user", "content": message_req.content, "citations": None})

    history = sorted(messages_store.filter(conversation_id=conversation_id), key=lambda m: m["created_at"])

    # Auto-title conversation on first message
    if len(history) == 1:
        raw = message_req.content.strip().replace("\n", " ")
        title = raw[:55] + ("…" if len(raw) > 55 else "")
        conversations_store.update(conversation_id, {"title": title})
    chat_history = []
    for m in history[:-1]:
        if m["role"] == "user":
            chat_history.append(HumanMessage(content=m["content"]))
        else:
            chat_history.append(AIMessage(content=m["content"]))

    retriever = get_retriever(assistant["id"])

    contextualize_q_prompt = ChatPromptTemplate.from_messages([
        ("system", CONTEXTUALIZE_PROMPT),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])
    history_aware_retriever = create_history_aware_retriever(llm, retriever, contextualize_q_prompt)

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", assistant["instructions"] + QA_INSTRUCTIONS),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])
    rag_chain = create_retrieval_chain(history_aware_retriever, create_stuff_documents_chain(llm, qa_prompt))

    try:
        response = rag_chain.invoke({"input": message_req.content, "chat_history": chat_history})
    except Exception as e:
        logger.error("RAG chain error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

    context_docs = response.get("context", [])
    citations = list(set(doc.metadata.get("filename") for doc in context_docs if doc.metadata.get("filename")))

    return messages_store.insert({
        "conversation_id": conversation_id,
        "role": "assistant",
        "content": response["answer"],
        "citations": json.dumps(citations),
    })
