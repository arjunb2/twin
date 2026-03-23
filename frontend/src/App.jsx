import { useState, useEffect } from "react";
import { useAgent } from "./hooks/useAgent";
import DomainSelector from "./components/DomainSelector";
import AgentSteps from "./components/AgentSteps";
import OutputDisplay from "./components/OutputDisplay";

const PLACEHOLDERS = [
  "Write a speaker intro for our TEDxCUSAT GENESIS event...",
  "Draft a sponsorship email for Team Horizon to a tech company...",
  "Write the next Horizon Times newsletter section on ISRO...",
  "Create an Instagram caption for our rover test today...",
  "Explain the OSI model for a KTU 4-mark answer...",
];

export default function App() {
  const [input,   setInput]   = useState("");
  const [domain,  setDomain]  = useState("auto");
  const [context, setContext] = useState("auto");
  const [copied,  setCopied]  = useState(false);
  const [phIdx,   setPhIdx]   = useState(0);
  const [status,  setStatus]  = useState(null);
  const { generate, fetchStatus, triggerIngest, loading, result, error, steps } = useAgent();

  useEffect(() => {
    fetchStatus().then(setStatus);
    const id = setInterval(() => setPhIdx(i => (i + 1) % PLACEHOLDERS.length), 3500);
    return () => clearInterval(id);
  }, []);

  const handleGenerate = () => generate({ input, domainOverride: domain, contextOverride: context });

  const handleCopy = () => {
    if (!result?.output) return;
    navigator.clipboard.writeText(result.output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const handleIngest = async () => { await triggerIngest(); fetchStatus().then(setStatus); };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#ccc", fontFamily: "monospace", display: "grid", gridTemplateRows: "48px 1fr" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14, letterSpacing: "0.08em", color: "#ddd" }}>twin<span style={{ color: "#4f9cf9" }}>.</span></span>
          <span style={{ fontSize: 11, color: "#333", border: "1px solid #1e1e1e", borderRadius: 3, padding: "2px 7px" }}>v1.0</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {status && <span style={{ fontSize: 11, color: "#3a3a3a" }}>{status.total_vectors} vectors in memory</span>}
          <button onClick={handleIngest} style={{ background: "none", border: "1px solid #222", borderRadius: 3, padding: "4px 12px", color: "#444", fontSize: 11, cursor: "pointer" }}>re-ingest</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", height: "calc(100vh - 48px)", overflow: "hidden" }}>
        <div style={{ borderRight: "1px solid #1a1a1a", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ fontSize: 10, color: "#3a3a3a", letterSpacing: "0.1em", textTransform: "uppercase", padding: "14px 20px 10px", borderBottom: "1px solid #1a1a1a" }}>your request</div>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleGenerate(); }}
            placeholder={PLACEHOLDERS[phIdx]}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#ccc", fontFamily: "monospace", fontSize: 13, lineHeight: 1.75, padding: "18px 20px", resize: "none" }} />
          <div style={{ padding: "14px 20px", borderTop: "1px solid #1a1a1a", background: "#0a0a0a" }}>
            <DomainSelector domain={domain} context={context} onDomainChange={setDomain} onContextChange={setContext} />
            <button onClick={handleGenerate} disabled={loading || !input.trim()}
              style={{ width: "100%", padding: 10, border: "1px solid #4f9cf9", borderRadius: 4, background: "rgba(79,156,249,0.08)", color: loading ? "#4f9cf955" : "#4f9cf9", fontFamily: "monospace", fontSize: 12, letterSpacing: "0.06em", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "generating…" : "→ generate  (⌘ + enter)"}
            </button>
          </div>
        </div>

        <div style={{ overflow: "auto", padding: "28px 36px" }}>
          {error && <div style={{ padding: "14px 16px", background: "#1a0808", border: "1px solid #5a1a1a", borderRadius: 6, color: "#f87171", fontSize: 13, marginBottom: 20, fontFamily: "monospace" }}>Error: {error}</div>}
          <AgentSteps steps={steps} loading={loading} />
          {copied && <div style={{ position: "fixed", bottom: 24, right: 24, background: "#111", border: "1px solid #2a2a2a", borderRadius: 4, padding: "8px 16px", fontSize: 12, color: "#4ade80", fontFamily: "monospace" }}>copied</div>}
          {result ? <OutputDisplay result={result} onCopy={handleCopy} />
            : !loading && !error && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60%", opacity: 0.2, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>◈</div>
                <div style={{ fontSize: 12, lineHeight: 1.9, color: "#666" }}>type your request on the left<br />your twin will match your style and domain</div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
