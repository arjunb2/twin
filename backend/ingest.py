from dotenv import load_dotenv
load_dotenv()
from memory import ingest_writing_samples, load_or_create_index

print("\nDigital Twin — Ingesting writing samples")
print("=" * 45)
ingest_writing_samples("data/writing_samples")
index, metadata = load_or_create_index()
print(f"\nTotal vectors: {index.ntotal}")
counts = {}
for m in metadata:
    d = m.get("domain", "unknown")
    counts[d] = counts.get(d, 0) + 1
for domain, count in sorted(counts.items()):
    print(f"  {domain:<14} {count} chunks")
