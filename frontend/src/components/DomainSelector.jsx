const DOMAINS  = [{ value: "auto", label: "Auto" }, { value: "tedx", label: "TEDx" }, { value: "horizon", label: "Horizon" }, { value: "newsletter", label: "Newsletter" }, { value: "social", label: "Social" }, { value: "assignment", label: "Assignment" }];
const CONTEXTS = [{ value: "auto", label: "Auto" }, { value: "formal", label: "Formal" }, { value: "casual", label: "Casual" }, { value: "technical", label: "Technical" }, { value: "persuasive", label: "Persuasive" }, { value: "academic", label: "Academic" }];

function ChipGroup({ label, options, selected, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555", marginBottom: 7, fontFamily: "monospace" }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map(opt => {
          const active = selected === opt.value;
          return <button key={opt.value} onClick={() => onChange(opt.value)} style={{ padding: "4px 12px", borderRadius: 4, fontFamily: "monospace", border: active ? "1px solid #4f9cf9" : "1px solid #2a2a2a", background: active ? "rgba(79,156,249,0.1)" : "transparent", color: active ? "#4f9cf9" : "#666", fontSize: 12, cursor: "pointer" }}>{opt.label}</button>;
        })}
      </div>
    </div>
  );
}

export default function DomainSelector({ domain, context, onDomainChange, onContextChange }) {
  return <div><ChipGroup label="Domain" options={DOMAINS} selected={domain} onChange={onDomainChange} /><ChipGroup label="Tone override" options={CONTEXTS} selected={context} onChange={onContextChange} /></div>;
}
