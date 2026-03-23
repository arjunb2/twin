DOMAIN_SIGNALS = {
    "tedx":       ["ted", "tedx", "talk", "speech", "keynote", "stage", "speaker", "intro", "storytelling", "opening story", "genesis", "speaker reel"],
    "horizon":    ["rover", "horizon", "team horizon", "trl", "sponsorship", "sponsor", "proposal", "technical report", "mission", "subsystem", "chassis", "autonomous", "irc", "erc", "urc", "competition", "engineering", "prototype", "cusat", "mars"],
    "newsletter": ["newsletter", "weekly", "monthly", "digest", "roundup", "subscribers", "edition", "broadcast", "update", "horizon times", "space highlights"],
    "social":     ["instagram", "whatsapp", "caption", "post", "reel", "story", "tweet", "linkedin", "social media", "hashtag", "ig", "caption for"],
    "assignment": ["assignment", "ktu", "exam", "answer", "question", "marks", "module", "subject", "university", "college", "academic", "explain", "define", "differentiate", "compare", "elaborate", "homework", "notes"],
}

CONTEXT_SIGNALS = {
    "formal":     ["proposal", "report", "professional", "executive", "formal", "official", "board", "organization", "dear", "regards", "honoured"],
    "casual":     ["caption", "post", "quick", "short", "fun", "casual", "chill", "simple", "whatsapp", "instagram", "ig"],
    "technical":  ["trl", "system", "architecture", "subsystem", "implementation", "testing", "documentation", "sensor", "algorithm", "rover", "cryogenic", "propulsion"],
    "persuasive": ["sponsor", "sponsorship", "pitch", "convince", "benefit", "value", "partnership", "funding", "support", "opportunity", "honored"],
    "academic":   ["assignment", "ktu", "exam", "university", "explain", "define", "marks", "answer", "module", "differentiate", "academic"],
}

DOMAIN_DEFAULT_CONTEXT = {
    "tedx": "persuasive", "horizon": "formal",
    "newsletter": "formal", "social": "casual", "assignment": "academic",
}


def classify(user_input: str):
    lower = user_input.lower()
    domain_scores  = {k: sum(1 for kw in v if kw in lower) for k, v in DOMAIN_SIGNALS.items()}
    context_scores = {k: sum(1 for kw in v if kw in lower) for k, v in CONTEXT_SIGNALS.items()}
    domain  = max(domain_scores,  key=domain_scores.get)
    context = max(context_scores, key=context_scores.get)
    if domain_scores[domain]   == 0: domain  = "social"
    if context_scores[context] == 0: context = DOMAIN_DEFAULT_CONTEXT.get(domain, "casual")
    return domain, context


def get_domain_vocabulary(domain: str) -> list:
    vocab = {
        "tedx":       ["the moment I realized", "this is not just about", "the genesis of", "the courage to share", "before the camera rolled", "captures feeling not just scenes"],
        "horizon":    ["Team Horizon CUSAT", "IRC 2026", "ERC", "Mars rover", "global rank", "only team from South India", "student robotics", "space exploration"],
        "newsletter": ["Horizon Times", "space highlights", "quick orbit update", "space fact of the issue", "marks a major step", "strengthens India"],
        "social":     ["short punchy sentences", "no corporate jargon", "one clear idea per post", "warm and human tone"],
        "assignment": ["definition with example", "step-by-step explanation", "KTU pattern", "structured answer"],
    }
    return vocab.get(domain, [])
