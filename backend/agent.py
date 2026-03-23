import os
from dataclasses import dataclass, field
from groq import Groq

from classifier import classify, get_domain_vocabulary
from memory     import retrieve
from prompts    import build_system_prompt, build_user_prompt
from reflection import critique, inject_revision_note

_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"
MAX_RETRIES    = 2
PASS_THRESHOLD = 0.70

@dataclass
class AgentStep:
    name: str
    status: str = "pending"
    detail: str = ""

@dataclass
class AgentResult:
    domain: str
    context: str
    output: str
    attempts: list = field(default_factory=list)
    steps: list = field(default_factory=list)
    final_critique: object = None

def run(user_input: str, domain_override: str = None, context_override: str = None) -> AgentResult:
    steps = [AgentStep("classify"), AgentStep("plan"), AgentStep("retrieve"), AgentStep("generate"), AgentStep("critique"), AgentStep("deliver")]
    result = AgentResult(domain="", context="", output="", steps=steps)
    steps[0].status = "running"
    domain, context = classify(user_input)
    if domain_override  and domain_override  != "auto": domain  = domain_override
    if context_override and context_override != "auto": context = context_override
    result.domain, result.context = domain, context
    steps[0].status = "done"
    steps[0].detail = f"Domain: {domain} | Context: {context}"
    steps[1].status = "running"
    vocabulary    = get_domain_vocabulary(domain)
    system_prompt = build_system_prompt(domain)
    steps[1].status = "done"
    steps[1].detail = f"Template: {domain} | Vocab hints: {len(vocabulary)}"
    steps[2].status = "running"
    examples = retrieve(user_input, domain=domain, k=4)
    steps[2].status = "done"
    steps[2].detail = f"Retrieved {len(examples)} samples"
    steps[3].status = "running"
    user_prompt = build_user_prompt(domain, context, user_input, examples, vocabulary)
    draft, critique_result = "", None
    for attempt_num in range(MAX_RETRIES + 1):
        response = _client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            max_tokens=1200
        )
        draft = response.choices[0].message.content.strip()
        steps[3].status = "done"
        steps[4].status = "running"
        critique_result = critique(draft, domain, context, threshold=PASS_THRESHOLD)
        result.attempts.append({"attempt": attempt_num + 1, "draft": draft, "critique": {"style": critique_result.style, "tone": critique_result.tone, "clarity": critique_result.clarity, "specificity": critique_result.specificity, "composite": critique_result.composite, "note": critique_result.note, "passed": critique_result.passed}})
        steps[4].status = "done"
        steps[4].detail = f"Attempt {attempt_num+1} | Score: {critique_result.composite:.2f} | {'Passed' if critique_result.passed else 'Retrying'}"
        if critique_result.passed or attempt_num == MAX_RETRIES:
            break
        user_prompt = inject_revision_note(user_prompt, critique_result.note)
        steps[3].status = "running"
    steps[5].status = "done"
    steps[5].detail = f"Final score: {critique_result.composite:.2f}"
    result.output, result.final_critique = draft, critique_result
    return result
