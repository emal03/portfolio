"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

type Cert = { id: string; title: string; issuer: string; year: number; credential_url: string; image_url: string; description: string; };

export default function AdminCertificationsPage() {
  const router = useRouter();
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCerts(); }, []);

  async function fetchCerts() {
    setLoading(true);
    const res = await fetch("/api/admin/certifications");
    const data = await res.json();
    setCerts(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function deleteCert(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await fetch("/api/admin/certifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchCerts();
  }

  if (loading) return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Certifications</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {certs.length} certification{certs.length !== 1 ? "s" : ""} — shown on About page
          </p>
        </div>
        <Link href="/admin/certifications/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: "var(--accent-gradient)", color: "white" }}>
          <FiPlus /> Add Certification
        </Link>
      </div>

      {certs.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
          <p className="text-lg mb-2" style={{ color: "var(--text-muted)" }}>No certifications yet</p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Add your first certification to show it on the About page</p>
          <Link href="/admin/certifications/new"
                className="px-6 py-2.5 rounded-lg font-semibold text-sm"
                style={{ background: "var(--accent-gradient)", color: "white" }}>
            + Add First Certification
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {certs.map((cert: Cert) => (
            <div key={cert.id} className="flex items-center gap-4 p-4 rounded-xl"
                 style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
              {cert.image_url ? (
                <img src={cert.image_url} alt={cert.title}
                     className="w-12 h-12 rounded-lg object-contain flex-shrink-0"
                     style={{ background: "var(--bg-secondary)" }} />
              ) : (
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                     style={{ background: "rgba(59,130,246,0.1)" }}>🏆</div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>{cert.title}</h3>
                <p className="text-sm" style={{ color: "var(--accent-blue)" }}>{cert.issuer}</p>
                {cert.year && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{cert.year}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {cert.credential_url && (
                  <a href={cert.credential_url} target="_blank" rel="noopener noreferrer"
                     className="px-3 py-1 rounded text-xs"
                     style={{ background: "rgba(59,130,246,0.1)", color: "var(--accent-blue)" }}>
                    View
                  </a>
                )}
                <Link href={`/admin/certifications/${cert.id}/edit`}
                      className="p-2 rounded-lg transition-opacity hover:opacity-70"
                      style={{ background: "rgba(59,130,246,0.1)", color: "var(--accent-blue)" }}>
                  <FiEdit2 size={14} />
                </Link>
                <button onClick={() => deleteCert(cert.id, cert.title)}
                        className="p-2 rounded-lg transition-opacity hover:opacity-70"
                        style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
