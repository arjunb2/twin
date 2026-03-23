import { useState, useCallback } from "react";
const API = "http://localhost:8000";

export function useAgent() {
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);
  const [steps,   setSteps]   = useState([]);

  const generate = useCallback(async ({ input, domainOverride, contextOverride }) => {
    if (!input?.trim()) return;
    setLoading(true); setError(null); setResult(null);
    setSteps([
      { name: "classify",  status: "running", detail: "Detecting domain and context…" },
      { name: "plan",      status: "pending", detail: "" },
      { name: "retrieve",  status: "pending", detail: "" },
      { name: "generate",  status: "pending", detail: "" },
      { name: "critique",  status: "pending", detail: "" },
      { name: "deliver",   status: "pending", detail: "" },
    ]);
    try {
      const res = await fetch(`${API}/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, domain_override: domainOverride || null, context_override: contextOverride || null }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Server error"); }
      const data = await res.json();
      setResult(data); setSteps(data.steps);
    } catch (err) { setError(err.message); setSteps([]); }
    finally { setLoading(false); }
  }, []);

  const fetchStatus   = useCallback(async () => { try { return await (await fetch(`${API}/status`)).json(); } catch { return null; } }, []);
  const triggerIngest = useCallback(async () => { try { return await (await fetch(`${API}/ingest`, { method: "POST" })).json(); } catch { return null; } }, []);

  return { generate, fetchStatus, triggerIngest, loading, result, error, steps };
}
