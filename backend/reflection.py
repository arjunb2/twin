import os, re
from dataclasses import dataclass
from groq import Groq
from prompts import build_critique_prompt

_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"

@dataclass
class CritiqueResult:
    style: float
    tone: float
    clarity: float
    specificity: float
    note: str
    composite: float
    passed: bool

def critique(draft: str, domain: str, context: str, threshold: float = 0.70) -> CritiqueResult:
    response = _client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": build_critique_prompt(draft, domain, context)}],
        max_tokens=200
    )
    return _parse(response.choices[0].message.content.strip(), threshold)

def _parse(raw: str, threshold: float) -> CritiqueResult:
    def get(key):
        m = re.search(rf"{key}:\s*([\d.]+)", raw, re.IGNORECASE)
        return min(max(float(m.group(1)), 0.0), 1.0) if m else 0.65
    s, t, cl, sp = get("STYLE"), get("TONE"), get("CLARITY"), get("SPECIFICITY")
    composite = (s + t + cl + sp) / 4
    note_m = re.search(r"NOTE:\s*(.+)", raw, re.IGNORECASE)
    note = note_m.group(1).strip() if note_m else ""
    return CritiqueResult(style=s, tone=t, clarity=cl, specificity=sp, note=note, composite=composite, passed=composite >= threshold)

def inject_revision_note(prompt: str, note: str) -> str:
    return f"{prompt}\n\nEDITOR NOTE: {note}\nRevise with this in mind. Return only the revised content."
