"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiSave, FiUpload, FiX } from "react-icons/fi";

export default function EditCertificationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "", issuer: "", description: "",
    image_url: "", credential_url: "", year: new Date().getFullYear(),
  });

  useEffect(() => {
    async function loadCert() {
      try {
        const res = await fetch("/api/admin/certifications");
        const data = await res.json();
        const cert = Array.isArray(data) ? data.find((c: {id: string}) => c.id === id) : null;
        if (cert) {
          setForm({
            title: cert.title || "",
            issuer: cert.issuer || "",
            description: cert.description || "",
            image_url: cert.image_url || "",
            credential_url: cert.credential_url || "",
            year: cert.year || new Date().getFullYear(),
          });
          if (cert.image_url) setImagePreview(cert.image_url);
        } else {
          setError("Certification not found");
        }
      } catch {
        setError("Failed to load certification");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadCert();
  }, [id]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return form.image_url || null;
    const uploadData = new FormData();
    uploadData.append("file", imageFile);
    const res = await fetch("/api/upload", { method: "POST", body: uploadData });
    const data = await res.json();
    return data.success ? data.url : (imagePreview || form.image_url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.issuer.trim()) {
      setError("Title and Issuer are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const image_url = await uploadImage();
      const res = await fetch("/api/admin/certifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...form, image_url }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin/certifications");
      } else {
        setError(data.error || "Failed to update certification");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/admin/certifications"
            className="inline-flex items-center gap-2 mb-8 text-sm hover:opacity-70"
            style={{ color: "var(--text-secondary)" }}>
        <FiArrowLeft /> Back to Certifications
      </Link>
      <h1 className="text-3xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>
        Edit Certification
      </h1>

      {error && (
        <div className="mb-6 p-4 rounded-lg text-sm"
             style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444",
                      border: "1px solid rgba(239,68,68,0.3)" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Image Upload */}
        <div className="p-6 rounded-xl"
             style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
          <label className="block text-sm font-medium mb-4"
                 style={{ color: "var(--text-primary)" }}>Certificate Image</label>

          {imagePreview ? (
            <div className="relative w-24 h-24 mb-4">
              <img src={imagePreview} alt="Preview"
                   className="w-24 h-24 rounded-lg object-contain"
                   style={{ background: "var(--bg-secondary)" }} />
              <button type="button"
                      onClick={() => { setImagePreview(null); setImageFile(null); setForm({...form, image_url: ""}); }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: "#ef4444", color: "white" }}>
                <FiX size={12} />
              </button>
            </div>
          ) : (
            <div onClick={() => fileInputRef.current?.click()}
                 className="w-full h-24 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:opacity-70 transition"
                 style={{ border: "2px dashed var(--border)", color: "var(--text-muted)" }}>
              <FiUpload size={20} />
              <span className="text-sm">Click to upload image</span>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*"
                 className="hidden" onChange={handleImageSelect} />
          <p className="text-xs mt-3 mb-2" style={{ color: "var(--text-muted)" }}>
            Or enter an image URL:
          </p>
          <input type="url" value={form.image_url}
                 placeholder="https://example.com/cert-image.png"
                 onChange={e => setForm({ ...form, image_url: e.target.value })}
                 className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                 style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)",
                          color: "var(--text-primary)" }} />
        </div>

        {/* Details */}
        <div className="p-6 rounded-xl space-y-4"
             style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Certificate Details
          </h2>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              Title *
            </label>
            <input type="text" required value={form.title}
                   placeholder="e.g. Introduction to Computer Vision"
                   onChange={e => setForm({ ...form, title: e.target.value })}
                   className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                   style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)",
                            color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              Issuer *
            </label>
            <input type="text" required value={form.issuer}
                   placeholder="e.g. IBM, Coursera, Google"
                   onChange={e => setForm({ ...form, issuer: e.target.value })}
                   className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                   style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)",
                            color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              Year
            </label>
            <input type="number" value={form.year} min={2000} max={2030}
                   onChange={e => setForm({ ...form, year: Number(e.target.value) })}
                   className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                   style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)",
                            color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              Description
            </label>
            <textarea value={form.description}
                      placeholder="Brief description or credential ID..."
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)",
                               color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              Credential URL
              <span className="ml-1" style={{ color: "var(--text-muted)" }}>
                (Coursera/LinkedIn verification link)
              </span>
            </label>
            <input type="url" value={form.credential_url}
                   placeholder="https://www.coursera.org/account/accomplishments/records/..."
                   onChange={e => setForm({ ...form, credential_url: e.target.value })}
                   className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                   style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)",
                            color: "var(--text-primary)" }} />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50"
                  style={{ background: "var(--accent-gradient)", color: "white" }}>
            <FiSave size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link href="/admin/certifications"
                className="px-6 py-2.5 rounded-lg text-sm font-semibold"
                style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
