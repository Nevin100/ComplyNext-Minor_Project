"""
ComplyNext - Embedding pipeline and vector store (RAG foundation).

Design decision: using sentence-transformers (a free, local embedding
model) instead of OpenAI/Cohere APIs mentioned in the original proposal.
This avoids needing paid API keys during development - the retrieval
logic here is identical regardless of which embedding provider is used,
so swapping to OpenAI/Cohere later is a small, isolated change.
"""

import chromadb
from sentence_transformers import SentenceTransformer

from src.db.database import SessionLocal
from src.db.models import Circular

# all-MiniLM-L6-v2 is a small (80MB), fast embedding model - a common
# default choice for RAG prototypes because it balances speed and
# semantic accuracy well without needing a GPU.
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

# ChromaDB will persist vectors to disk in this folder, so embeddings
# survive between runs (no need to re-embed every time the app starts).
CHROMA_PERSIST_DIR = "./chroma_data"
COLLECTION_NAME = "rbi_circulars"

def get_chroma_collection():
    """
    Returns a persistent ChromaDB collection - creates it if it doesn't
    exist yet. A "collection" in ChromaDB is like a table in SQL, but
    for vectors instead of rows.
    """
    client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
    return client.get_or_create_collection(name=COLLECTION_NAME)

def build_vector_store():
    """
    Reads every chunk from the `circulars` SQL table, embeds it, and
    stores the resulting vectors in ChromaDB along with metadata
    (source name, url, chunk index) so retrieval results can be traced
    back to their exact origin - this traceability is what will power
    the "citation" feature in the explainability layer later.
    """
    print(f"Loading embedding model '{EMBEDDING_MODEL_NAME}'... (first run downloads it, may take a minute)")
    model = SentenceTransformer(EMBEDDING_MODEL_NAME)

    db = SessionLocal()
    chunks = db.query(Circular).all()
    db.close()

    if not chunks:
        print("No chunks found in the database. Run the scraper first.")
        return

    print(f"Embedding {len(chunks)} chunks...")

    # ChromaDB needs: a unique id, the raw text, the vector, and metadata
    # for each item - we build these four parallel lists.
    ids = [f"{c.source_name}_{c.chunk_index}" for c in chunks]
    documents = [c.chunk_text for c in chunks]
    metadatas = [
        {"source_name": c.source_name, "source_url": c.source_url, "chunk_index": c.chunk_index}
        for c in chunks
    ]

    # encode() runs all chunks through the embedding model at once (batched),
    # which is much faster than embedding one chunk at a time in a loop.
    embeddings = model.encode(documents, show_progress_bar=True).tolist()

    collection = get_chroma_collection()

    # Clear any previous embeddings before re-adding, so re-running this
    # doesn't create duplicate vectors for the same chunks.
    existing_ids = collection.get()["ids"]
    if existing_ids:
        collection.delete(ids=existing_ids)

    collection.add(ids=ids, documents=documents, embeddings=embeddings, metadatas=metadatas)
    print(f"Stored {len(ids)} embeddings in ChromaDB collection '{COLLECTION_NAME}'.")

def semantic_search(query: str, top_k: int = 3):
    """
    Takes a natural-language question, embeds it with the SAME model
    used for storage, and asks ChromaDB for the most semantically
    similar chunks - this is the core "retrieval" step of RAG.
    """
    model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    query_embedding = model.encode([query]).tolist()

    collection = get_chroma_collection()
    results = collection.query(query_embeddings=query_embedding, n_results=top_k)

    return results

if __name__ == "__main__":
    build_vector_store()

    print("\n--- Test query ---")
    test_query = "What is the classification for a cash credit account that stays over its limit?"
    results = semantic_search(test_query, top_k=2)

    for i, (doc, meta) in enumerate(zip(results["documents"][0], results["metadatas"][0])):
        print(f"\nResult {i+1} (from {meta['source_name']}, chunk {meta['chunk_index']}):")
        print(doc[:300], "...")