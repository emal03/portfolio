"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Skill = { id: string; name: string; category: string; proficiency: number };

const CATEGORIES = [
  "Programming", "AI/ML", "Data Science", "Frameworks",
  "Bioinformatics", "Tools", "Research", "Other"
];

export default function AdminSkillsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", category: "Programming", proficiency: 80 });
  const [editForm, setEditForm] = useState({ name: "", category: "", proficiency: 80 });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  useEffect(() => { fetchSkills(); }, []);

  async function fetchSkills() {
    setLoading(true);
    const res = await fetch("/api/skills");
    const data = await res.json();
    setSkills(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function addSkill() {
    if (!form.name.trim()) { setMsg("Please enter a skill name"); return; }
    setSaving(true);
    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMsg("✅ Skill added!");
      setForm({ name: "", category: "Programming", proficiency: 80 });
      fetchSkills();
    } else {
      setMsg("❌ Failed to add skill");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  async function deleteSkill(id: string) {
    if (!confirm("Delete this skill?")) return;
    await fetch("/api/skills", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchSkills();
  }

  async function saveEdit(id: string) {
    setSaving(true);
    await fetch("/api/skills", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editForm }),
    });
    setEditId(null);
    fetchSkills();
    setSaving(false);
  }

  const grouped = skills.reduce((acc: Record<string, Skill[]>, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  if (loading) return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Skills</h1>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage your skills — they appear on the About page with progress bars.
          </p>
        </div>
        <button onClick={() => router.push("/admin/dashboard")}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
          ← Back
        </button>
      </div>

      {msg && (
        <div className="mb-4 p-3 rounded-lg text-sm"
             style={{ background: msg.includes("✅") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                      color: msg.includes("✅") ? "#10b981" : "#ef4444",
                      border: `1px solid ${msg.includes("✅") ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}` }}>
          {msg}
        </div>
      )}

      {/* Add New Skill */}
      <div className="p-6 rounded-2xl mb-8"
           style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Add New Skill</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Skill Name *</label>
            <input type="text" value={form.name} placeholder="e.g. Python"
                   onChange={e => setForm({ ...form, name: e.target.value })}
                   onKeyDown={e => e.key === "Enter" && addSkill()}
                   className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                   style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Category *</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              Proficiency: <strong style={{ color: "var(--accent-blue)" }}>{form.proficiency}%</strong>
            </label>
            <input type="range" min={1} max={100} value={form.proficiency}
                   onChange={e => setForm({ ...form, proficiency: Number(e.target.value) })}
                   className="w-full accent-blue-500" />
          </div>
        </div>
        {/* Proficiency preview bar */}
        <div className="w-full h-2 rounded-full mb-4" style={{ background: "var(--border)" }}>
          <div className="h-2 rounded-full transition-all"
               style={{ width: `${form.proficiency}%`, background: "var(--accent-gradient)" }} />
        </div>
        <button onClick={addSkill} disabled={saving}
                className="px-6 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
                style={{ background: "var(--accent-gradient)", color: "white" }}>
          {saving ? "Adding..." : "+ Add Skill"}
        </button>
      </div>

      {/* Skills List grouped by category */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
          No skills yet. Add your first skill above!
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, categorySkills]) => (
            <div key={category} className="p-6 rounded-2xl"
                 style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider"
                  style={{ color: "var(--accent-blue)" }}>{category}</h3>
              <div className="space-y-3">
                {categorySkills.map((skill: Skill) => (
                  <div key={skill.id}>
                    {editId === skill.id ? (
                      <div className="p-3 rounded-lg" style={{ background: "var(--bg-secondary)" }}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                          <input type="text" value={editForm.name}
                                 onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                 className="px-3 py-1.5 rounded-lg text-sm outline-none"
                                 style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                          <select value={editForm.category}
                                  onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                  className="px-3 py-1.5 rounded-lg text-sm outline-none"
                                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <div>
                            <input type="range" min={1} max={100} value={editForm.proficiency}
                                   onChange={e => setEditForm({ ...editForm, proficiency: Number(e.target.value) })}
                                   className="w-full accent-blue-500" />
                            <span className="text-xs" style={{ color: "var(--accent-blue)" }}>{editForm.proficiency}%</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(skill.id)}
                                  className="px-4 py-1 rounded-lg text-xs font-semibold"
                                  style={{ background: "var(--accent-gradient)", color: "white" }}>Save</button>
                          <button onClick={() => setEditId(null)}
                                  className="px-4 py-1 rounded-lg text-xs"
                                  style={{ background: "var(--border)", color: "var(--text-secondary)" }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 group">
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{skill.name}</span>
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{skill.proficiency}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                            <div className="h-1.5 rounded-full"
                                 style={{ width: `${skill.proficiency}%`, background: "var(--accent-gradient)" }} />
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditId(skill.id); setEditForm({ name: skill.name, category: skill.category, proficiency: skill.proficiency }); }}
                                  className="px-3 py-1 rounded text-xs"
                                  style={{ background: "rgba(59,130,246,0.1)", color: "var(--accent-blue)" }}>Edit</button>
                          <button onClick={() => deleteSkill(skill.id)}
                                  className="px-3 py-1 rounded text-xs"
                                  style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
