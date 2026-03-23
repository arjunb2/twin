import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
load_dotenv()

from agent  import run as run_agent
from memory import ingest_writing_samples, load_or_create_index


@asynccontextmanager
async def lifespan(app: FastAPI):
    index, _ = load_or_create_index()
    if index.ntotal == 0:
        ingest_writing_samples("data/writing_samples")
    else:
        print(f"[Startup] Index ready — {index.ntotal} vectors.")
    yield

app = FastAPI(title="Digital Twin Agent", lifespan=lifespan)
app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"], allow_headers=["*"])


class GenerateRequest(BaseModel):
    input: str
    domain_override: str = None
    context_override: str = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/generate")
def generate(req: GenerateRequest):
    if not req.input.strip():
        raise HTTPException(status_code=400, detail="Input cannot be empty.")
    try:
        r = run_agent(req.input, req.domain_override, req.context_override)
        return {
            "domain": r.domain, "context": r.context, "output": r.output,
            "attempts": r.attempts,
            "steps": [{"name": s.name, "status": s.status, "detail": s.detail} for s in r.steps],
            "final_score": r.final_critique.composite if r.final_critique else 0.0,
            "total_attempts": len(r.attempts),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ingest")
def ingest():
    try:
        ingest_writing_samples("data/writing_samples")
        index, metadata = load_or_create_index()
        counts = {}
        for m in metadata:
            d = m.get("domain", "unknown")
            counts[d] = counts.get(d, 0) + 1
        return {"vectors": index.ntotal, "by_domain": counts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/status")
def status():
    index, metadata = load_or_create_index()
    counts = {}
    for m in metadata:
        d = m.get("domain", "unknown")
        counts[d] = counts.get(d, 0) + 1
    return {"total_vectors": index.ntotal, "by_domain": counts}
