# Twin — Digital Twin Agent

> A personal AI writing agent that learns from your own content and writes like you.

Built on a **RAG (Retrieval Augmented Generation)** pipeline — your past writing is stored in a local FAISS vector database, retrieved on every request, and used to match your exact voice before generating anything. The output goes through a self-critique loop that scores and revises it before delivering.

---

## What It Does

- Detects the **domain** (TEDx, Horizon, Newsletter, Social, Assignment) and **tone** (formal, casual, technical, persuasive, academic) from your request
- Retrieves the most relevant samples from your past writing using semantic search
- Generates content grounded in your actual voice — not a generic AI response
- Scores the output on style, tone, clarity, and specificity
- Automatically revises if the score is below threshold

---

## Domains Supported

| Domain | Content Types |
|---|---|
| TEDxCUSAT | Speaker intros, event copy, theme content |
| Team Horizon CUSAT | Sponsorship emails, competition reports, TRL docs |
| Horizon Times | Space newsletter writing |
| Social Media | Instagram captions, WhatsApp updates |
| Academic | KTU-pattern assignment answers |

---

## Tech Stack

| Layer | Tool |
|---|---|
| Backend | Python, FastAPI |
| Frontend | React, Vite |
| Vector Store | FAISS (local) |
| Embeddings | Sentence Transformers (all-MiniLM-L6-v2) |
| LLM | LLaMA 3.1 via Groq API |
| Environment | python-dotenv |

---

## Project Structure

```
twin/
├── backend/
│   ├── main.py              # FastAPI endpoints
│   ├── agent.py             # Core agent loop
│   ├── classifier.py        # Domain + context detection
│   ├── memory.py            # FAISS vector store + retrieval
│   ├── prompts.py           # Prompt templates for all domains
│   ├── reflection.py        # Critique and scoring loop
│   ├── ingest.py            # Standalone ingestion script
│   ├── requirements.txt
│   └── data/
│       └── writing_samples/ # Your .txt writing samples
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── hooks/useAgent.js
    │   └── components/
    │       ├── DomainSelector.jsx
    │       ├── AgentSteps.jsx
    │       └── OutputDisplay.jsx
    ├── index.html
    └── package.json
```

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/arjunb2/twin.git
cd twin
```

### 2. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file:

```
GROQ_API_KEY=your-groq-key-here
```

Get your free Groq API key at [console.groq.com](https://console.groq.com)

### 3. Add your writing samples

Drop your `.txt` files into `backend/data/writing_samples/` using the domain prefix:

```
tedx_title.txt
horizon_title.txt
newsletter_title.txt
social_title.txt
assignment_title.txt
```

Then run:

```bash
python3 ingest.py
```

### 4. Start the backend

```bash
uvicorn main:app --reload --port 8000
```

### 5. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Open **http://localhost:3000**

---

## How It Works

```
User input
    ↓
Classifier — detects domain + context
    ↓
Planner — selects template + vocabulary
    ↓
FAISS — retrieves relevant past writing
    ↓
Prompt Builder — assembles system prompt + samples + task
    ↓
LLaMA 3.1 via Groq — generates draft
    ↓
Critic — scores style, tone, clarity, specificity
    ↓
Score < 0.70 → revise and retry (max 2x)
Score ≥ 0.70 → deliver output
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/generate` | Run the full agent |
| POST | `/ingest` | Reload writing samples |
| GET | `/status` | Check vector count |
| GET | `/health` | Health check |

---

## Adding More Writing Samples

The more you feed it, the better it matches your voice.

1. Add `.txt` files to `backend/data/writing_samples/`
2. Run `python3 ingest.py` or click **re-ingest** in the UI

---

## Built By

Arjun B — personal productivity tool for content creation across TEDxCUSAT, Team Horizon CUSAT, and academic work.
