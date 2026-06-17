"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FiArrowRight, FiGithub, FiLinkedin, FiMail, FiCode } from "react-icons/fi";
import { motion } from "framer-motion";

type Area = { icon: string; title: string; description: string };
type Project = { id: string; title: string; slug: string; description: string; thumbnail_url: string; status: string; tags: string[]; tech_stack: string[] };

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Home() {
  const [data, setData] = useState({
    name: "", title: "", bio: "", availability: "",
    github: "", linkedin: "", email: "",
    profilePhoto: "/profile.png",
    badge: "🎓 Fresh Graduate",
    cta1: "View Projects", cta2: "Lets Collaborate",
    stats: { projects: "5+", publications: "6", opensource: "4+", experience: "2+" },
    areas: [] as Area[],
    featuredProjects: [] as Project[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portfolio")
      .then(r => r.json())
      .then(d => {
        const s = d.settings || {};
        let areas: Area[] = [];
        try { areas = JSON.parse(s.homepage_areas || "[]"); } catch { areas = []; }
        setData({
          name:          s.name          || "Emal Kamawal",
          title:         s.title         || "Data Scientist and ML Researcher",
          bio:           s.bio           || s.subtitle || "",
          availability:  s.availability  || "Open to Jobs and Master Programs",
          github:        s.github        || "",
          linkedin:      s.linkedin      || "",
          email:         s.email         || "",
          profilePhoto:  s.profile_photo || "/profile.png",
          badge:         s.homepage_badge || "🎓 Fresh Graduate",
          cta1:          s.homepage_cta1  || "View Projects",
          cta2:          s.homepage_cta2  || "Lets Collaborate",
          stats: {
            projects:    s.stats_projects    || "5+",
            publications:s.stats_publications || "6",
            opensource:  s.stats_opensource  || "4+",
            experience:  s.stats_experience  || "2+",
          },
          areas,
          featuredProjects: d.projects || [],
        });
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "var(--accent-blue)" }} />
    </div>
  );

  return (
    <div className="flex flex-col" style={{ background: "var(--bg-primary)" }}>

      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-[100px]"
             style={{ background: "rgba(59,130,246,0.15)" }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-[120px]"
             style={{ background: "rgba(6,182,212,0.1)" }} />

        <div className="container mx-auto px-6 py-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left Content */}
            <motion.div className="space-y-8"
                        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}>

              {data.availability && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#10b981" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--accent-blue)" }}>
                    {data.availability}
                  </span>
                </motion.div>
              )}

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
                  style={{ color: "var(--text-primary)" }}>
                {data.title.includes("&") ? (
                  <>
                    {data.title.split("&")[0]}&{" "}
                    <span style={{ background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      {data.title.split("&")[1]}
                    </span>
                  </>
                ) : (
                  <span style={{ background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {data.title}
                  </span>
                )}
              </h1>

              <p className="text-lg md:text-xl max-w-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {data.bio}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/projects"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold"
                      style={{ background: "var(--accent-gradient)", color: "white" }}>
                  {data.cta1} <FiArrowRight />
                </Link>
                <Link href="/contact"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold"
                      style={{ border: "1px solid var(--accent-blue)", color: "var(--accent-blue)" }}>
                  {data.cta2}
                </Link>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>Connect:</span>
                <div className="flex gap-3">
                  {data.github && (
                    <a href={data.github} target="_blank" rel="noopener noreferrer"
                       className="p-2 rounded-lg transition-all hover:scale-110"
                       style={{ color: "var(--text-secondary)" }} aria-label="GitHub">
                      <FiGithub size={20} />
                    </a>
                  )}
                  {data.linkedin && (
                    <a href={data.linkedin} target="_blank" rel="noopener noreferrer"
                       className="p-2 rounded-lg transition-all hover:scale-110"
                       style={{ color: "var(--text-secondary)" }} aria-label="LinkedIn">
                      <FiLinkedin size={20} />
                    </a>
                  )}
                  {data.email && (
                    <a href={"mailto:" + data.email}
                       className="p-2 rounded-lg transition-all hover:scale-110"
                       style={{ color: "var(--text-secondary)" }} aria-label="Email">
                      <FiMail size={20} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right — Profile Photo */}
            <motion.div className="relative"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}>
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 rounded-3xl p-[2px]"
                     style={{ background: "var(--accent-gradient)" }}>
                  <div className="w-full h-full rounded-3xl" style={{ background: "var(--bg-primary)" }} />
                </div>
                <div className="absolute inset-2 rounded-2xl overflow-hidden">
                  <img src={data.profilePhoto} alt={data.name}
                       className="w-full h-full object-cover" />
                  <div className="absolute inset-0"
                       style={{ background: "linear-gradient(to top, rgba(10,15,30,0.7) 0%, transparent 60%)" }} />
                </div>

                {data.stats.projects && (
                  <motion.div className="absolute -bottom-6 -left-6 p-4 rounded-xl shadow-xl"
                              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6 }}
                              style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                           style={{ background: "rgba(59,130,246,0.1)", color: "var(--accent-blue)" }}>
                        <FiCode size={24} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                          {data.stats.projects}
                        </p>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Projects</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.div className="absolute -top-4 -right-4 px-4 py-2 rounded-full text-sm font-medium"
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 }}
                            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}>
                  {data.badge}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: data.stats.projects,     label: "Research Projects" },
              { value: data.stats.publications,  label: "Publications" },
              { value: data.stats.opensource,    label: "Open Source" },
              { value: data.stats.experience,    label: "Years Experience" },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-bold"
                   style={{ background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {stat.value}
                </p>
                <p className="text-sm font-medium mt-1" style={{ color: "var(--text-secondary)" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESEARCH AREAS */}
      {data.areas.length > 0 && (
        <motion.section className="py-24" style={{ background: "var(--bg-primary)" }}
                        initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <div className="container mx-auto px-6">
            <motion.div variants={item} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                Research Focus
              </h2>
              <p style={{ color: "var(--text-secondary)" }}>
                Areas where I focus my research and development work
              </p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-8">
              {data.areas.map((area: Area, i: number) => (
                <motion.div key={i} variants={item}
                            className="p-8 rounded-2xl transition-all hover:scale-[1.02]"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)",
                                     boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
                  <div className="text-4xl mb-6">{area.icon}</div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                    {area.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {area.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* FEATURED PROJECTS */}
      {data.featuredProjects.length > 0 && (
        <motion.section className="py-24" style={{ background: "var(--bg-secondary)" }}
                        initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
              <motion.div variants={item}>
                <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                  Featured Projects
                </h2>
                <p style={{ color: "var(--text-secondary)" }}>Highlights from my recent work</p>
              </motion.div>
              <motion.div variants={item}>
                <Link href="/projects" className="inline-flex items-center gap-2 font-medium hover:gap-3 transition-all"
                      style={{ color: "var(--accent-blue)" }}>
                  View All <FiArrowRight />
                </Link>
              </motion.div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.featuredProjects.map((project: Project) => (
                <motion.div key={project.slug} variants={item}>
                  <Link href={"/projects/" + project.slug}>
                    <div className="rounded-2xl overflow-hidden transition-all hover:scale-[1.02] hover:-translate-y-1"
                         style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                      <div className="aspect-video relative overflow-hidden">
                        <img src={project.thumbnail_url || "/projects/thought-viz.png"}
                             alt={project.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold"
                             style={{ background: project.status === "public" ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)",
                                      color: project.status === "public" ? "#10b981" : "#f59e0b" }}>
                          {project.status === "public" ? "Public" : project.status === "gated" ? "Request Access" : "Private"}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold mb-2 text-lg" style={{ color: "var(--text-primary)" }}>
                          {project.title}
                        </h3>
                        <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(project.tags || []).slice(0, 3).map((tag: string) => (
                            <span key={tag} className="px-2 py-1 rounded-full text-xs"
                                  style={{ background: "rgba(59,130,246,0.1)", color: "var(--accent-blue)" }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* CTA */}
      <section className="py-24 text-center" style={{ background: "var(--bg-primary)" }}>
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Looking for Collaboration or Opportunities?
          </h2>
          <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
            I am open to research collaborations, job opportunities, and master degree programs starting September 2026.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/contact" className="px-8 py-3 rounded-lg font-semibold"
                  style={{ background: "var(--accent-gradient)", color: "white" }}>
              Get in Touch
            </Link>
            <Link href="/about" className="px-8 py-3 rounded-lg font-semibold"
                  style={{ border: "1px solid var(--accent-blue)", color: "var(--accent-blue)" }}>
              Learn More About Me
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
