import Image from "next/image";
import Link from "next/link";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL!);
type Row = Record<string, unknown>;

export default async function AboutPage() {
  let settings: Record<string, string> = {};
  let certifications: Row[] = [];
  let skills: Row[] = [];

  try {
    const rows = await sql`SELECT key, value FROM settings`;
    rows.forEach((r: Row) => { settings[r.key as string] = r.value as string; });
  } catch (e) { console.error("Settings error:", e); }

  try {
    certifications = await sql`SELECT * FROM certifications ORDER BY display_order ASC, year DESC`;
  } catch (e) { console.error("Certifications error:", e); }

  try {
    skills = await sql`SELECT * FROM skills ORDER BY category, display_order`;
  } catch (e) { console.error("Skills error:", e); }

  const name        = settings.name        || "Emal Kamawal";
  const title       = settings.title       || "Data Scientist & ML Researcher";
  const bio         = settings.bio         || "Passionate about transforming raw data into actionable knowledge.";
  const university  = settings.university  || "Pak-Austria Fachhochschule (PAF-IAST)";
  const degree      = settings.degree      || "Bachelor of Science in Computer Science";
  const univYears   = settings.university_years || "2022 - 2026";
  const scholarship = settings.scholarship || "";
  const profileImg  = settings.profile_photo || "/profile.png";
  const github      = settings.github      || "https://github.com/emal03";
  const linkedin    = settings.linkedin    || "#";
  const email       = settings.email       || "emalkamawal01@gmail.com";
  const cvUrl       = settings.cv_url      || "/cv.pdf";

  const skillCategories = skills.reduce((acc: Record<string, Row[]>, skill: Row) => {
    const cat = (skill.category as string) || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <main id="main-content" className="min-h-screen" style={{ background: "var(--bg-primary)" }}>

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">

            {/* Photo */}
            <div className="relative flex-shrink-0">
              <div className="w-48 h-48 rounded-2xl overflow-hidden border-2"
                   style={{ borderColor: "var(--accent-blue)", boxShadow: "0 0 40px rgba(59,130,246,0.3)" }}>
                <Image src={profileImg} alt={name} width={192} height={192}
                       className="w-full h-full object-cover" priority unoptimized />
              </div>
              <div className="absolute -bottom-3 -right-3 px-3 py-1 rounded-full text-xs font-semibold"
                   style={{ background: "var(--accent-gradient)", color: "white" }}>
                {settings.availability || "Open to Work"}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              {scholarship && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-4"
                     style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", color: "var(--accent-blue)" }}>
                  🎓 {scholarship}
                </div>
              )}
              <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>About Me</h1>
              <h2 className="text-2xl font-semibold mb-4"
                  style={{ background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {title}
              </h2>
              <p className="text-lg leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>{bio}</p>
              <div className="flex items-center gap-3 p-4 rounded-xl mb-6"
                   style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                <span className="text-2xl">🎓</span>
                <div>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{degree}</p>
                  <p style={{ color: "var(--text-secondary)" }}>{university} • {univYears}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={cvUrl} download className="px-6 py-2.5 rounded-lg font-semibold"
                   style={{ background: "var(--accent-gradient)", color: "white" }}>Download CV</a>
                <Link href="/contact" className="px-6 py-2.5 rounded-lg font-semibold"
                      style={{ border: "1px solid var(--accent-blue)", color: "var(--accent-blue)" }}>Get in Touch</Link>
              </div>
              <div className="flex gap-4 mt-4">
                {github && <a href={github} target="_blank" rel="noopener noreferrer" className="text-sm hover:opacity-70" style={{ color: "var(--text-secondary)" }}>GitHub ↗</a>}
                {linkedin && linkedin !== "#" && <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-sm hover:opacity-70" style={{ color: "var(--text-secondary)" }}>LinkedIn ↗</a>}
                <a href={"mailto:" + email} className="text-sm hover:opacity-70" style={{ color: "var(--text-secondary)" }}>{email}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      {Object.keys(skillCategories).length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Skills & Expertise</h2>
            <p className="mb-10" style={{ color: "var(--text-secondary)" }}>Technologies and tools I work with</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(skillCategories).map(([category, categorySkills]) => (
                <div key={category} className="p-6 rounded-xl"
                     style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                  <h3 className="font-semibold mb-4" style={{ color: "var(--accent-blue)" }}>{category}</h3>
                  <div className="space-y-3">
                    {categorySkills.map((skill: Row) => (
                      <div key={String(skill.id)}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm" style={{ color: "var(--text-primary)" }}>{String(skill.name)}</span>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{String(skill.proficiency)}%</span>
                        </div>
                        <div className="w-full rounded-full h-1.5" style={{ background: "var(--border)" }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${skill.proficiency}%`, background: "var(--accent-gradient)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certifications */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Certifications</h2>
          <p className="mb-10" style={{ color: "var(--text-secondary)" }}>Professional certifications validating my expertise</p>
          {certifications.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No certifications added yet. Add them from the admin panel.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert: Row) => {
                const certTitle   = String(cert.title   ?? "");
                const certIssuer  = String(cert.issuer  ?? "");
                const certYear    = cert.year    ? String(cert.year)    : null;
                const certDesc    = cert.description ? String(cert.description) : null;
                const certUrl     = cert.credential_url ? String(cert.credential_url) : null;
                const certImg     = cert.image_url  ? String(cert.image_url)  : null;
                return (
                  <div key={String(cert.id)} className="p-6 rounded-xl flex flex-col gap-3 transition-all hover:scale-[1.02]"
                       style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
                    <div className="flex items-start gap-4">
                      {certImg ? (
                        <img src={certImg} alt={certTitle} className="w-12 h-12 rounded-lg object-contain" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                             style={{ background: "rgba(59,130,246,0.1)" }}>🏆</div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>{certTitle}</h3>
                        <p className="text-xs mt-1" style={{ color: "var(--accent-blue)" }}>{certIssuer}</p>
                        {certYear && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{certYear}</p>}
                      </div>
                    </div>
                    {certDesc && <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{certDesc}</p>}
                    {certUrl && certUrl !== "#" && (
                      <a href={certUrl} target="_blank" rel="noopener noreferrer"
                         className="text-xs font-medium mt-auto hover:opacity-70" style={{ color: "var(--accent-cyan)" }}>
                        View Credential →
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Want to know more?</h2>
          <p className="mb-8" style={{ color: "var(--text-secondary)" }}>Check out my projects or explore my publications.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/projects" className="px-8 py-3 rounded-lg font-semibold"
                  style={{ background: "var(--accent-gradient)", color: "white" }}>View Projects</Link>
            <Link href="/publications" className="px-8 py-3 rounded-lg font-semibold"
                  style={{ border: "1px solid var(--accent-blue)", color: "var(--accent-blue)" }}>Publications</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
