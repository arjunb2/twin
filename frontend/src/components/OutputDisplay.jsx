import { useState } from "react";

function Bar({ label, value }) {
  const pct = Math.round(value * 100);
  const color = value >= 0.75 ? "#4ade80" : value >= 0.55 ? "#facc15" : "#f87171";
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11, fontFamily: "monospace" }}>
        <span style={{ color: "#555" }}>{label}</span><span style={{ color }}>{pct}%</span>
      </div>
      <div style={{ background: "#1e1e1e", borderRadius: 2, height: 3 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function Scores({ c, attempt }) {
  return (
    <div style={{ marginTop: 20, padding: "14px 16px", background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 6 }}>
      <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "monospace", marginBottom: 12 }}>reflection scores {attempt > 1 ? `— attempt ${attempt}` : ""}</div>
      <Bar label="Style"       value={c.style} />
      <Bar label="Tone"        value={c.tone} />
      <Bar label="Clarity"     value={c.clarity} />
      <Bar label="Specificity" value={c.specificity} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "1px solid #1a1a1a" }}>
        <span style={{ fontSize: 11, color: "#444", fontFamily: "monospace" }}>composite</span>
        <span style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 500, color: c.composite >= 0.75 ? "#4ade80" : c.composite >= 0.55 ? "#facc15" : "#f87171" }}>{Math.round(c.composite * 100)}% {c.passed ? "✓ passed" : "⚠ revised"}</span>
      </div>
      {c.note && <div style={{ marginTop: 10, fontSize: 12, color: "#555", fontFamily: "monospace", lineHeight: 1.6, borderTop: "1px solid #1a1a1a", paddingTop: 10 }}>Editor note: {c.note}</div>}
    </div>
  );
}

export default function OutputDisplay({ result, onCopy }) {
  const [showAll, setShowAll] = useState(false);
  if (!result) return null;
  const final = result.attempts[result.attempts.length - 1];
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {[{ k: "domain", v: result.domain }, { k: "context", v: result.context }, { k: "attempts", v: result.total_attempts, color: result.total_attempts > 1 ? "#facc15" : "#4ade80" }].map(b => (
          <span key={b.k} style={{ padding: "3px 10px", border: `1px solid ${(b.color || "#4f9cf9")}44`, borderRadius: 4, fontSize: 11, color: b.color || "#4f9cf9", fontFamily: "monospace" }}>{b.k}: {b.v}</span>
        ))}
      </div>
      <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 6, padding: "24px 28px", position: "relative" }}>
        <pre style={{ fontFamily: "'Georgia', serif", fontSize: 15, lineHeight: 1.85, color: "#d4d0c8", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>{result.output}</pre>
        <button onClick={onCopy} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "1px solid #2a2a2a", borderRadius: 4, padding: "4px 10px", color: "#555", fontSize: 11, cursor: "pointer", fontFamily: "monospace" }}>copy</button>
      </div>
      <Scores c={final.critique} attempt={final.attempt} />
      {result.attempts.length > 1 && (
        <div style={{ marginTop: 12 }}>
          <button onClick={() => setShowAll(!showAll)} style={{ background: "none", border: "none", color: "#555", fontSize: 11, cursor: "pointer", fontFamily: "monospace", padding: 0 }}>{showAll ? "hide" : "show"} earlier attempts ({result.attempts.length - 1})</button>
          {showAll && result.attempts.slice(0, -1).map(a => (
            <div key={a.attempt} style={{ marginTop: 14, opacity: 0.55 }}>
              <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", marginBottom: 8 }}>Attempt {a.attempt}:</div>
              <pre style={{ fontFamily: "'Georgia', serif", fontSize: 13, lineHeight: 1.7, color: "#888", whiteSpace: "pre-wrap", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 4, padding: "14px 18px", margin: 0 }}>{a.draft}</pre>
              <Scores c={a.critique} attempt={a.attempt} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
