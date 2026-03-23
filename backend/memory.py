import json
from pathlib import Path
from typing import Optional
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

FAISS_INDEX_PATH = "data/faiss_index.bin"
METADATA_PATH    = "data/metadata.json"
EMBEDDING_DIM    = 384
_model           = None


def get_model():
    global _model
    if _model is None:
        print("[Memory] Loading local embedding model...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("[Memory] Model ready.")
    return _model


def embed(text: str) -> np.ndarray:
    return get_model().encode(text, normalize_embeddings=True).astype("float32")


def embed_batch(texts: list) -> np.ndarray:
    return get_model().encode(texts, normalize_embeddings=True, show_progress_bar=False).astype("float32")


def load_or_create_index():
    if Path(FAISS_INDEX_PATH).exists() and Path(METADATA_PATH).exists():
        index = faiss.read_index(FAISS_INDEX_PATH)
        with open(METADATA_PATH) as f:
            metadata = json.load(f)
        print(f"[Memory] Loaded — {index.ntotal} vectors.")
        return index, metadata
    index    = faiss.IndexFlatIP(EMBEDDING_DIM)
    metadata = []
    print("[Memory] New index created.")
    return index, metadata


def save_index(index, metadata: list):
    Path("data").mkdir(exist_ok=True)
    faiss.write_index(index, FAISS_INDEX_PATH)
    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)


def _chunk_text(text: str, size: int = 500, overlap: int = 80) -> list:
    chunks, start = [], 0
    while start < len(text):
        chunks.append(text[start:start + size])
        start += size - overlap
    return chunks


def ingest_writing_samples(samples_dir: str = "data/writing_samples"):
    index, metadata = load_or_create_index()
    files = list(Path(samples_dir).glob("*.txt"))
    if not files:
        print(f"[Memory] No .txt files found in {samples_dir}.")
        return
    texts, metas = [], []
    for fp in files:
        parts   = fp.stem.split("_", 1)
        domain  = parts[0] if parts[0] in ["tedx", "horizon", "newsletter", "social", "assignment"] else "general"
        content = fp.read_text(encoding="utf-8").strip()
        if not content:
            continue
        for i, chunk in enumerate(_chunk_text(content)):
            texts.append(chunk)
            metas.append({"domain": domain, "title": fp.stem, "chunk_id": i, "text": chunk})
    if not texts:
        return
    print(f"[Memory] Embedding {len(texts)} chunks...")
    index.add(embed_batch(texts))
    metadata.extend(metas)
    save_index(index, metadata)
    print(f"[Memory] Done — {len(files)} files, {len(texts)} chunks.")


def retrieve(query: str, domain: Optional[str] = None, k: int = 4) -> list:
    index, metadata = load_or_create_index()
    if index.ntotal == 0:
        return []
    qvec     = embed(query).reshape(1, -1)
    search_k = min(index.ntotal, k * 5 if domain else k)
    _, idxs  = index.search(qvec, search_k)
    results  = []
    for i in idxs[0]:
        if i < 0 or i >= len(metadata):
            continue
        if domain and metadata[i]["domain"] != domain:
            continue
        results.append(metadata[i]["text"])
        if len(results) >= k:
            break
    if len(results) < 2 and domain:
        results = [metadata[i]["text"] for i in idxs[0] if 0 <= i < len(metadata)][:k]
    return results
