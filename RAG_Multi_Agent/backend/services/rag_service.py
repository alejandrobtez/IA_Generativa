import os
from langchain_community.document_loaders import (
    PyMuPDFLoader,
    Docx2txtLoader,
    TextLoader,
    UnstructuredPowerPointLoader,
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import AzureOpenAIEmbeddings
from langchain_community.vectorstores import AzureSearch
from azure.search.documents.indexes import SearchIndexClient
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv

load_dotenv()

AZURE_SEARCH_ENDPOINT = os.getenv("AZURE_SEARCH_ENDPOINT")
AZURE_SEARCH_KEY = os.getenv("AZURE_SEARCH_KEY")
AZURE_SEARCH_INDEX_PREFIX = os.getenv("AZURE_SEARCH_INDEX_NAME", "asistente")

embeddings = AzureOpenAIEmbeddings(
    azure_deployment=os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT"),
    azure_endpoint=os.getenv("AZURE_OPENAI_EMBEDDING_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_EMBEDDING_KEY"),
    openai_api_version=os.getenv("AZURE_OPENAI_EMBEDDING_API_VERSION"),
)


def _get_vector_store(assistant_id: int) -> AzureSearch:
    """One Azure AI Search index per assistant — guarantees full isolation."""
    return AzureSearch(
        azure_search_endpoint=AZURE_SEARCH_ENDPOINT,
        azure_search_key=AZURE_SEARCH_KEY,
        index_name=f"{AZURE_SEARCH_INDEX_PREFIX}-{assistant_id}",
        embedding_function=embeddings.embed_query,
    )


def process_and_store_document(
    file_path: str, filename: str, assistant_id: int, document_id: int
):
    ext = os.path.splitext(filename)[1].lower()

    if ext == ".pdf":
        loader = PyMuPDFLoader(file_path)
    elif ext in [".docx", ".doc"]:
        loader = Docx2txtLoader(file_path)
    elif ext in [".txt", ".md"]:
        loader = TextLoader(file_path)
    elif ext in [".pptx", ".ppt"]:
        loader = UnstructuredPowerPointLoader(file_path)
    else:
        raise ValueError(f"Unsupported file extension: {ext}")

    documents = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )
    chunks = text_splitter.split_documents(documents)

    for chunk in chunks:
        chunk.metadata["document_id"] = document_id
        chunk.metadata["filename"] = filename

    vs = _get_vector_store(assistant_id)
    vs.add_documents(chunks)


def delete_document_from_store(document_id: int, assistant_id: int):
    """Delete all chunks for a document by searching metadata in Python."""
    vs = _get_vector_store(assistant_id)
    # Retrieve all docs (up to 1000) and filter by document_id in metadata
    results = vs.client.search(
        search_text="*",
        select=["id", "metadata"],
        top=1000,
    )
    ids_to_delete = []
    import json as _json
    for r in results:
        try:
            meta = _json.loads(r.get("metadata") or "{}")
            if meta.get("document_id") == document_id:
                ids_to_delete.append(r["id"])
        except Exception:
            pass
    if ids_to_delete:
        vs.client.delete_documents([{"id": i} for i in ids_to_delete])


def delete_assistant_from_store(assistant_id: int):
    """Delete the entire Azure AI Search index for this assistant."""
    idx_client = SearchIndexClient(
        endpoint=AZURE_SEARCH_ENDPOINT,
        credential=AzureKeyCredential(AZURE_SEARCH_KEY),
    )
    try:
        idx_client.delete_index(f"{AZURE_SEARCH_INDEX_PREFIX}-{assistant_id}")
    except Exception:
        pass


def get_retriever(assistant_id: int):
    vs = _get_vector_store(assistant_id)
    return vs.as_retriever(k=5)


def get_raw_chunks(assistant_id: int, top: int = 12) -> list[str]:
    """Fetch document text directly from Azure AI Search (no vector similarity needed).
    Used for instruction generation on newly indexed documents."""
    vs = _get_vector_store(assistant_id)
    try:
        results = vs.client.search(
            search_text="*",
            select=["content", "metadata"],
            top=top,
        )
        chunks = []
        for r in results:
            text = r.get("content", "").strip()
            if text:
                chunks.append(text[:600])
        return chunks
    except Exception:
        return []
