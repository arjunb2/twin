const LABELS = { classify: "Classify input", plan: "Build plan", retrieve: "Retrieve examples", generate: "Generate draft", critique: "Evaluate quality", deliver: "Finalize output" };

export default function AgentSteps({ steps, loading }) {
  if (!loading && (!steps || !steps.length)) return null;
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 6, padding: "14px 16px", marginBottom: 20 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 12 }}>agent pipeline</div>
      {steps.map(s => (
        <div key={s.name} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8, opacity: s.status === "pending" ? 0.3 : 1, transition: "opacity 0.3s" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 3, display: "inline-block", background: s.status === "done" ? "#4ade80" : s.status === "running" ? "transparent" : "#333", border: s.status === "running" ? "2px solid #facc15" : "none", borderTopColor: s.status === "running" ? "transparent" : undefined, animation: s.status === "running" ? "spin 0.7s linear infinite" : "none" }} />
          <span style={{ fontSize: 12, fontFamily: "monospace", color: s.status === "done" ? "#bbb" : s.status === "running" ? "#facc15" : "#444" }}>
            {LABELS[s.name] || s.name}
            {s.detail && s.status === "done" && <span style={{ color: "#444", marginLeft: 8 }}>— {s.detail}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}
