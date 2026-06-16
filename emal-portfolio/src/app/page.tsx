// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiGithub, FiLinkedin, FiMail, FiCode, FiExternalLink } from 'react-icons/fi';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';

export default function Home() {
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    bio: '',
    availability: '',
  });

  const [social, setSocial] = useState({
    github: '',
    linkedin: '',
    email: '',
  });

  const [stats, setStats] = useState({
    researchProjects: '',
    publications: '',
    openSourceProjects: '',
    yearsExperience: '',
  });

  const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const res = await fetch('/api/portfolio');
        if (!res.ok) return;
        const data = await res.json();

        if (data.settings) {
          setProfile({
            name: data.settings.name || '',
            title: data.settings.title || '',
            bio: data.settings.subtitle || data.settings.bio || '',
            availability: data.settings.availability || 'Available for Collaboration',
          });

          setSocial({
            github: data.settings.github || '',
            linkedin: data.settings.linkedin || '',
            email: data.settings.email || '',
          });

          setStats({
            researchProjects: data.settings.stats_projects || '10+',
            publications: data.settings.stats_publications || '3+',
            openSourceProjects: data.settings.stats_opensource || '5+',
            yearsExperience: data.settings.stats_experience || '2+',
          });
        }

        if (data.projects && data.projects.length > 0) {
          setFeaturedProjects(data.projects);
        }
      } catch (e) {
        console.error('Failed to fetch home page data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolioData();
  }, []);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const researchAreas = [
    {
      icon: '📊',
      title: 'Machine Learning & Data Science',
      description: 'Building predictive models and data pipelines that extract meaningful patterns from complex datasets.',
      color: 'blue',
      gradient: 'from-blue-500/20 to-blue-600/10',
    },
    {
      icon: '👁️',
      title: 'Computer Vision & Medical Imaging',
      description: 'Applying deep learning to analyze medical images, detect anomalies, and support clinical decisions.',
      color: 'purple',
      gradient: 'from-purple-500/20 to-purple-600/10',
    },
    {
      icon: '🧬',
      title: 'Bioinformatics & Research',
      description: 'Processing biological and clinical data to generate insights that bridge laboratory research and real-world applications.',
      color: 'emerald',
      gradient: 'from-emerald-500/20 to-emerald-600/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden hero-mesh">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid-fade opacity-50" />

        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px]" />

        <div className="container mx-auto px-6 py-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Badge */}
              {profile.availability && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-blue/10 border border-accent-blue/20"
                >
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-medium text-accent-blue">{profile.availability}</span>
                </motion.div>
              )}

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                {profile.title ? (
                  <>
                    {profile.title.includes('&') ? (
                      <>
                        {profile.title.split('&')[0]}& <span className="text-gradient">{profile.title.split('&')[1]}</span>
                      </>
                    ) : (
                      <span className="text-gradient">{profile.title}</span>
                    )}
                  </>
                ) : (
                  <>Data Scientist & <span className="text-gradient">ML Researcher</span></>
                )}
              </h1>

              <p className="text-lg md:text-xl text-text-secondary max-w-xl leading-relaxed">
                {profile.bio}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link href="/projects" className="btn-primary group">
                  View Projects
                  <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/contact" className="btn-secondary">
                  Let's Collaborate
                </Link>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4 pt-4">
                <span className="text-sm text-text-muted">Connect:</span>
                <div className="flex gap-3">
                  {social.github && (
                    <a
                      href={social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-text-secondary hover:text-accent-blue hover:bg-bg-secondary transition-all"
                      aria-label="GitHub"
                    >
                      <FiGithub size={20} />
                    </a>
                  )}
                  {social.linkedin && (
                    <a
                      href={social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-text-secondary hover:text-accent-blue hover:bg-bg-secondary transition-all"
                      aria-label="LinkedIn"
                    >
                      <FiLinkedin size={20} />
                    </a>
                  )}
                  {social.email && (
                    <a
                      href={`mailto:${social.email}`}
                      className="p-2 rounded-lg text-text-secondary hover:text-accent-blue hover:bg-bg-secondary transition-all"
                      aria-label="Email"
                    >
                      <FiMail size={20} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right - Hero Visual */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Decorative border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-accent-blue via-purple-500 to-accent-cyan p-[2px]">
                  <div className="w-full h-full rounded-3xl bg-bg-primary" />
                </div>

                {/* Image using Next.js Image component */}
                <div className="absolute inset-2 rounded-2xl overflow-hidden relative">
                  <Image
                    src="/profile.jpg"
                    alt="Emal Kamawal"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="object-cover"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-transparent to-transparent" />
                </div>

                {/* Floating Stats Card */}
                {stats.researchProjects && (
                  <motion.div
                    className="absolute -bottom-6 -left-6 p-4 rounded-xl bg-bg-card border border-border-light shadow-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-accent-blue/10 flex items-center justify-center text-accent-blue">
                        <FiCode size={24} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-text-primary">{stats.researchProjects}</p>
                        <p className="text-sm text-text-muted">Projects</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Floating Badge */}
                <motion.div
                  className="absolute -top-4 -right-4 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-success text-sm font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  🎓 Researcher
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Strip / Stats */}
      <section className="border-y border-border-default bg-bg-secondary">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-accent-blue">{stats.researchProjects || '10+'}</p>
              <p className="text-sm text-text-secondary mt-1 font-medium">Research Projects</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-accent-blue">{stats.publications || '3+'}</p>
              <p className="text-sm text-text-secondary mt-1 font-medium">Publications</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-accent-blue">{stats.openSourceProjects || '5+'}</p>
              <p className="text-sm text-text-secondary mt-1 font-medium">Open Source Projects</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-accent-blue">{stats.yearsExperience || '2+'}</p>
              <p className="text-sm text-text-secondary mt-1 font-medium">Years Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Research Focus */}
      <motion.section
        className="py-24 bg-bg-primary"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-6">
          <motion.div variants={staggerItem} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">Research Focus</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Bridging cutting-edge AI with real-world healthcare applications
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {researchAreas.map((area, index) => (
              <motion.div key={index} variants={staggerItem}>
                <Card className="h-full glass-panel" hover>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${area.gradient} flex items-center justify-center text-3xl mb-6`}>
                    {area.icon}
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">
                    {area.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {area.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <motion.section
          className="py-24 bg-bg-secondary"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
              <motion.div variants={staggerItem}>
                <h2 className="text-3xl md:text-4xl font-bold mb-3 font-display">Featured Research</h2>
                <p className="text-text-secondary">Highlights from my recent work</p>
              </motion.div>
              <motion.div variants={staggerItem}>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 text-accent-blue font-medium hover:gap-3 transition-all"
                >
                  View All Projects <FiArrowRight />
                </Link>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <motion.div key={project.slug} variants={staggerItem}>
                  <Link href={`/projects/${project.slug}`}>
                    <Card className="h-full overflow-hidden group cursor-pointer card-premium" hover>
                      {/* Image container using absolute positioning relative layout */}
                      <div className="aspect-video -mx-6 -mt-6 mb-6 overflow-hidden relative">
                        <Image
                          src={project.thumbnail_url || '/projects/thought-viz.png'}
                          alt={project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Visibility Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`badge ${project.status === 'public' ? 'badge-blue' : 'badge-amber'}`}>
                            {project.status === 'public' ? 'Public' : project.status === 'gated' ? 'Gated' : 'Private'}
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(project.tags || []).slice(0, 3).map((tag: string) => (
                          <span key={tag} className="badge badge-blue">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-accent-blue transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-text-secondary line-clamp-2 mb-4">
                        {project.description}
                      </p>

                      {/* Link */}
                      <span className="inline-flex items-center gap-1 text-accent-blue font-medium text-sm">
                        Learn More <FiExternalLink size={14} />
                      </span>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-bg-primary relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid-fade opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-blue/10 rounded-full blur-[150px]" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">
              Interested in Collaboration?
            </h2>
            <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
              Whether it's research collaboration, consulting on AI projects, or discussing new opportunities —
              I'd love to hear from you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn-primary">
                Get in Touch <FiArrowRight />
              </Link>
              <Link href="/services" className="btn-secondary">
                View Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
