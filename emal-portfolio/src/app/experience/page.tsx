export const dynamic = "force-dynamic";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL!);
type Row = Record<string, unknown>;

function formatDuration(start: string, end: string | null, isCurrent: boolean): string {
  const s = new Date(start);
  const e = isCurrent ? new Date() : (end ? new Date(end) : new Date());
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  const parts: string[] = [];
  if (yrs > 0) parts.push(`${yrs} yr${yrs > 1 ? "s" : ""}`);
  if (mos > 0) parts.push(`${mos} mo${mos > 1 ? "s" : ""}`);
  return parts.join(" ") || "< 1 mo";
}

function formatDate(dateStr: string | null, isCurrent: boolean): string {
  if (isCurrent) return "Present";
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const typeColors: Record<string, string> = {
  work: "rgba(59,130,246,0.15)",
  internship: "rgba(16,185,129,0.15)",
  research: "rgba(139,92,246,0.15)",
  volunteer: "rgba(245,158,11,0.15)",
};
const typeText: Record<string, string> = {
  work: "#3b82f6",
  internship: "#10b981",
  research: "#8b5cf6",
  volunteer: "#f59e0b",
};
const typeLabel: Record<string, string> = {
  work: "Full-time",
  internship: "Internship",
  research: "Research",
  volunteer: "Volunteer",
};

export default async function ExperiencePage() {
  let experience: Row[] = [];
  try {
    experience = await sql`SELECT * FROM experience ORDER BY start_date DESC`;
  } catch (e) {
    console.error("Experience error:", e);
  }

  return (
    <main id="main-content" className="min-h-screen py-20 px-6" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Experience</h1>
          <p style={{ color: "var(--text-secondary)" }}>My professional journey in research, development, and data science</p>
        </div>

        {experience.length === 0 ? (
          <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
            <p className="text-lg">No experience added yet.</p>
            <p className="text-sm mt-2">Add your experience from the admin panel.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 hidden md:block"
                 style={{ background: "linear-gradient(to bottom, var(--accent-blue), var(--accent-cyan), transparent)" }} />
            <div className="space-y-8">
              {experience.map((exp: Row) => {
                const isCurrent  = Boolean(exp.is_current);
                const type       = String(exp.type      ?? "work");
                const expTitle   = String(exp.title     ?? "");
                const expOrg     = String(exp.organization ?? "");
                const expLoc     = exp.location    ? String(exp.location)    : null;
                const expDesc    = exp.description  ? String(exp.description) : null;
                const expLogo    = exp.logo_url     ? String(exp.logo_url)    : null;
                const startDate  = String(exp.start_date ?? "");
                const endDate    = exp.end_date     ? String(exp.end_date)    : null;
                const skills     = Array.isArray(exp.skills) ? (exp.skills as string[]) : [];
                const bgColor    = typeColors[type]  ?? typeColors.work;
                const txtColor   = typeText[type]    ?? typeText.work;
                const label      = typeLabel[type]   ?? type;
                const initial    = expOrg.charAt(0).toUpperCase();

                return (
                  <div key={String(exp.id)} className="relative flex gap-6 md:gap-8">

                    {/* Timeline dot */}
                    <div className="hidden md:flex flex-col items-center flex-shrink-0 w-16">
                      <div className="relative z-10 w-4 h-4 rounded-full mt-1.5"
                           style={{
                             background: isCurrent ? "#10b981" : "var(--accent-blue)",
                             boxShadow: isCurrent ? "0 0 12px rgba(16,185,129,0.6)" : "0 0 8px rgba(59,130,246,0.4)",
                           }}>
                        {isCurrent && (
                          <span className="absolute inset-0 rounded-full animate-ping"
                                style={{ background: "rgba(16,185,129,0.4)" }} />
                        )}
                      </div>
                    </div>

                    {/* Card */}
                    <div className="flex-1 p-6 rounded-2xl transition-all hover:scale-[1.01]"
                         style={{
                           background: "var(--bg-card)",
                           border: "1px solid var(--border-light)",
                           boxShadow: isCurrent ? "0 4px 24px rgba(59,130,246,0.08)" : "none",
                         }}>

                      <div className="flex items-start gap-4">
                        {expLogo ? (
                          <img src={expLogo} alt={expOrg}
                               className="w-12 h-12 rounded-xl object-contain flex-shrink-0"
                               style={{ background: "rgba(255,255,255,0.05)", padding: "4px" }} />
                        ) : (
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                               style={{ background: bgColor, color: txtColor }}>
                            {initial}
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{expTitle}</h3>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                    style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
                                ● Current
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                            <span className="font-semibold" style={{ color: "var(--accent-blue)" }}>{expOrg}</span>
                            <span style={{ color: "var(--text-muted)" }}>•</span>
                            <span className="px-2 py-0.5 rounded text-xs"
                                  style={{ background: bgColor, color: txtColor }}>
                              {label}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                            <span>{formatDate(startDate, false)} – {formatDate(endDate, isCurrent)}</span>
                            <span>·</span>
                            <span>{formatDuration(startDate, endDate, isCurrent)}</span>
                            {expLoc && (
                              <>
                                <span>·</span>
                                <span>📍 {expLoc}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {expDesc && (
                        <div className="mt-4 text-sm leading-relaxed whitespace-pre-line"
                             style={{ color: "var(--text-secondary)" }}>
                          {expDesc}
                        </div>
                      )}

                      {skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {skills.map((skill: string) => (
                            <span key={skill} className="px-2.5 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    background: "rgba(59,130,246,0.08)",
                                    color: "var(--accent-blue)",
                                    border: "1px solid rgba(59,130,246,0.2)",
                                  }}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
