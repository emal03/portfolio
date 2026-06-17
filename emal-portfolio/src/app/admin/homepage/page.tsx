"use client";
import { useState, useEffect } from "react";
import { FiSave, FiPlus, FiTrash2 } from "react-icons/fi";

type Area = { icon: string; title: string; description: string };

export default function AdminHomepagePage() {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    title: "", bio: "", availability: "",
    badge: "", cta1: "", cta2: "",
    stats_projects: "", stats_publications: "", stats_opensource: "", stats_experience: "",
  });
  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    fetch("/api/portfolio").then(r => r.json()).then(d => {
      const s = d.settings || {};
      setForm({
        title: s.title || "", bio: s.bio || "", availability: s.availability || "",
        badge: s.homepage_badge || "", cta1: s.homepage_cta1 || "", cta2: s.homepage_cta2 || "",
        stats_projects: s.stats_projects || "", stats_publications: s.stats_publications || "",
        stats_opensource: s.stats_opensource || "", stats_experience: s.stats_experience || "",
      });
      try { setAreas(JSON.parse(s.homepage_areas || "[]")); } catch { setAreas([]); }
    });
  }, []);

  const addArea = () => setAreas([...areas, { icon: "🔬", title: "", description: "" }]);
  const removeArea = (i: number) => setAreas(areas.filter((_, idx) => idx !== i));
  const updateArea = (i: number, field: keyof Area, value: string) => {
    const updated = [...areas];
    updated[i] = { ...updated[i], [field]: value };
    setAreas(updated);
  };

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const updates = [
        ["title",              form.title],
        ["bio",                form.bio],
        ["availability",       form.availability],
        ["homepage_badge",     form.badge],
        ["homepage_cta1",      form.cta1],
        ["homepage_cta2",      form.cta2],
        ["stats_projects",     form.stats_projects],
        ["stats_publications", form.stats_publications],
        ["stats_opensource",   form.stats_opensource],
        ["stats_experience",   form.stats_experience],
        ["homepage_areas",     JSON.stringify(areas)],
      ];
      for (const [key, value] of updates) {
        await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: { [key]: value } }),
        });
      }
      setMsg("✅ Homepage updated!");
    } catch {
      setMsg("❌ Failed to save");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg text-sm outline-none";
  const inputStyle = { background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" };
  const labelStyle = { color: "var(--text-secondary)" };
  const cardStyle = { background: "var(--bg-card)", border: "1px solid var(--border-light)" };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Edit Homepage</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            All changes appear on the homepage instantly after saving.
          </p>
        </div>
        <button onClick={save} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50"
                style={{ background: "var(--accent-gradient)", color: "white" }}>
          <FiSave size={16} /> {saving ? "Saving..." : "Save All"}
        </button>
      </div>

      {msg && (
        <div className="mb-6 p-3 rounded-lg text-sm"
             style={{ background: msg.includes("✅") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                      color: msg.includes("✅") ? "#10b981" : "#ef4444",
                      border: `1px solid ${msg.includes("✅") ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}` }}>
          {msg}
        </div>
      )}

      <div className="space-y-6">

        {/* Hero Content */}
        <div className="p-6 rounded-2xl space-y-4" style={cardStyle}>
          <h2 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>Hero Section</h2>
          <div>
            <label className="block text-sm mb-1" style={labelStyle}>Headline Title</label>
            <input className={inputClass} style={inputStyle} value={form.title}
                   placeholder="Data Scientist and ML Researcher"
                   onChange={e => setForm({ ...form, title: e.target.value })} />
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Use & to split the title. The second part will have gradient color.
            </p>
          </div>
          <div>
            <label className="block text-sm mb-1" style={labelStyle}>Bio / Subtitle</label>
            <textarea className={inputClass} style={inputStyle} value={form.bio} rows={3}
                      placeholder="Short description shown below the title..."
                      onChange={e => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1" style={labelStyle}>Availability Badge</label>
              <input className={inputClass} style={inputStyle} value={form.availability}
                     placeholder="Open to Jobs and Master Programs"
                     onChange={e => setForm({ ...form, availability: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1" style={labelStyle}>Floating Badge Text</label>
              <input className={inputClass} style={inputStyle} value={form.badge}
                     placeholder="🎓 Fresh Graduate"
                     onChange={e => setForm({ ...form, badge: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1" style={labelStyle}>Button 1 Text</label>
              <input className={inputClass} style={inputStyle} value={form.cta1}
                     placeholder="View Projects"
                     onChange={e => setForm({ ...form, cta1: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 rounded-2xl space-y-4" style={cardStyle}>
          <h2 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>Stats Bar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: "stats_projects", label: "Research Projects" },
              { key: "stats_publications", label: "Publications" },
              { key: "stats_opensource", label: "Open Source" },
              { key: "stats_experience", label: "Years Experience" },
            ].map(stat => (
              <div key={stat.key}>
                <label className="block text-sm mb-1" style={labelStyle}>{stat.label}</label>
                <input className={inputClass} style={inputStyle}
                       value={form[stat.key as keyof typeof form]}
                       placeholder="e.g. 6"
                       onChange={e => setForm({ ...form, [stat.key]: e.target.value })} />
              </div>
            ))}
          </div>
        </div>

        {/* Research Areas */}
        <div className="p-6 rounded-2xl space-y-4" style={cardStyle}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
              Research Focus Areas
            </h2>
            <button onClick={addArea}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm"
                    style={{ background: "rgba(59,130,246,0.1)", color: "var(--accent-blue)" }}>
              <FiPlus size={14} /> Add Area
            </button>
          </div>
          <div className="space-y-4">
            {areas.map((area: Area, i: number) => (
              <div key={i} className="p-4 rounded-xl relative" style={{ background: "var(--bg-secondary)" }}>
                <button onClick={() => removeArea(i)}
                        className="absolute top-3 right-3 p-1 rounded"
                        style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                  <FiTrash2 size={12} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={labelStyle}>Icon (emoji)</label>
                    <input className={inputClass} style={inputStyle} value={area.icon}
                           placeholder="📊" onChange={e => updateArea(i, "icon", e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs mb-1" style={labelStyle}>Title</label>
                    <input className={inputClass} style={inputStyle} value={area.title}
                           placeholder="Machine Learning & Data Science"
                           onChange={e => updateArea(i, "title", e.target.value)} />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs mb-1" style={labelStyle}>Description</label>
                    <textarea className={inputClass} style={inputStyle} value={area.description}
                              placeholder="Brief description..." rows={2}
                              onChange={e => updateArea(i, "description", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            {areas.length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>
                No research areas yet. Click Add Area to add one.
              </p>
            )}
          </div>
        </div>

      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={save} disabled={saving}
                className="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold disabled:opacity-50"
                style={{ background: "var(--accent-gradient)", color: "white" }}>
          <FiSave size={16} /> {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}
