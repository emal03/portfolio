// src/app/about/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    FiDownload,
    FiArrowRight,
    FiBookOpen,
    FiCpu,
    FiEye,
    FiShield,
    FiActivity,
    FiTarget
} from 'react-icons/fi';
import Card from '@/components/ui/Card';

interface Certification {
    id: string;
    title: string;
    issuer: string;
    date_issued: string;
    credential_url?: string;
    image_url?: string;
}

export default function AboutPage() {
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(true);

    const [profile, setProfile] = useState({
        name: '',
        title: '',
        bio: '',
        profile_photo: '/profile.jpg',
        cv_url: '/cv.pdf',
        scholarship: '',
    });

    const [aboutContent, setAboutContent] = useState({
        headline: '',
        introduction: '',
        education: [] as { degree: string; institution: string; year: string }[],
    });

    useEffect(() => {
        const fetchPortfolioData = async () => {
            try {
                const res = await fetch('/api/portfolio');
                if (!res.ok) return;
                const data = await res.json();

                if (data.certifications && data.certifications.length > 0) {
                    setCertifications(data.certifications.map((c: any) => ({
                        id: c.id,
                        title: c.title,
                        issuer: c.issuer,
                        date_issued: c.year ? String(c.year) : '',
                        credential_url: c.credential_url || '',
                        image_url: c.image_url || '',
                    })));
                }

                if (data.settings) {
                    setProfile({
                        name: data.settings.name || '',
                        title: data.settings.title || '',
                        bio: data.settings.bio || '',
                        profile_photo: '/profile.jpg',
                        cv_url: data.settings.cv_url || '/cv.pdf',
                        scholarship: data.settings.scholarship || '',
                    });

                    setAboutContent({
                        headline: data.settings.title || '',
                        introduction: data.settings.bio || '',
                        education: data.settings.university ? [
                            {
                                degree: data.settings.degree || 'Bachelor of Science in Computer Science',
                                institution: data.settings.university || 'Pak-Austria Fachhochschule (PAF-IAST)',
                                year: data.settings.university_years || '2022 - 2026'
                            }
                        ] : [],
                    });
                }
            } catch (e) {
                console.error('Error fetching about page data:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolioData();
    }, []);

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5 }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const staggerItem = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    const researchInterests = [
        { icon: <FiTarget />, label: 'Machine Learning', color: 'blue' },
        { icon: <FiActivity />, label: 'Data Science', color: 'purple' },
        { icon: <FiEye />, label: 'Computer Vision', color: 'cyan' },
        { icon: <FiBookOpen />, label: 'Medical Data Analysis', color: 'emerald' },
        { icon: <FiCpu />, label: 'Bioinformatics', color: 'amber' },
        { icon: <FiShield />, label: 'Deep Learning', color: 'rose' },
    ];

    const futureDirections = [
        {
            title: 'Clinical AI Deployment',
            description: 'Working towards building AI systems that can be safely and ethically deployed in clinical settings for real-world patient impact.',
        },
        {
            title: 'Neural Signal Decoding',
            description: 'Advancing brain-computer interface research to help patients with motor disabilities communicate and control devices.',
        },
        {
            title: 'Privacy-First Healthcare AI',
            description: 'Developing federated learning solutions that enable multi-institutional collaboration without compromising patient privacy.',
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
        <div className="min-h-screen bg-bg-primary">
            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-grid-fade opacity-40" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-[400px_1fr] gap-12 lg:gap-16 items-start">
                        {/* Profile Image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="relative mx-auto lg:mx-0"
                        >
                            <div className="relative w-80 lg:w-full aspect-[3/4] rounded-2xl overflow-hidden">
                                {/* Gradient Border */}
                                <div className="absolute inset-0 bg-gradient-to-br from-accent-blue via-purple-500 to-accent-cyan rounded-2xl" />
                                <div className="absolute inset-[3px] rounded-2xl overflow-hidden bg-bg-primary relative">
                                    <Image
                                        src={profile.profile_photo || '/profile.jpg'}
                                        alt={profile.name || 'Emal Kamawal'}
                                        fill
                                        sizes="(max-width: 1024px) 320px, 400px"
                                        className="object-cover"
                                    />
                                </div>
                            </div>

                            {/* Floating Card */}
                            {profile.scholarship && (
                                <motion.div
                                    className="absolute -bottom-6 -right-6 p-4 rounded-xl bg-bg-card border border-border-light shadow-xl"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-success">
                                            🎓
                                        </div>
                                        <div>
                                            <p className="font-semibold text-text-primary text-sm">HEC Scholar</p>
                                            <p className="text-[10px] text-text-muted">{profile.scholarship}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Content */}
                        <motion.div
                            className="space-y-8"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
                                    About Me
                                </h1>
                                <h2 className="text-xl md:text-2xl text-accent-blue font-semibold mb-6">
                                    {aboutContent.headline}
                                </h2>
                            </div>

                            <div className="space-y-4 text-text-secondary leading-relaxed">
                                <p className="text-lg">
                                    {aboutContent.introduction}
                                </p>
                            </div>

                            {/* Education Badge */}
                            {aboutContent.education.length > 0 && (
                                <div className="space-y-3">
                                    {aboutContent.education.map((edu, index) => (
                                        <div key={index} className="p-4 rounded-xl bg-bg-secondary border border-border-default">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-accent-blue/10 flex items-center justify-center text-accent-blue flex-shrink-0">
                                                    🎓
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-text-primary">{edu.degree}</p>
                                                    <p className="text-sm text-text-secondary">{edu.institution} • {edu.year}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-4 pt-4">
                                <a
                                    href={profile.cv_url}
                                    download
                                    className="btn-primary"
                                >
                                    <FiDownload />
                                    Download CV
                                </a>
                                <Link href="/contact" className="btn-secondary">
                                    Get in Touch
                                    <FiArrowRight />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Research Interests */}
            <motion.section
                className="py-20 bg-bg-secondary"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={staggerContainer}
            >
                <div className="container mx-auto px-6">
                    <motion.div variants={staggerItem} className="text-center mb-12">
                        <h2 className="text-3xl font-bold font-display mb-4">Research Interests</h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            Areas where I focus my research and development efforts
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        {researchInterests.map((interest, index) => (
                            <motion.div key={index} variants={staggerItem}>
                                <div className="p-4 rounded-xl bg-bg-card border border-border-light hover:border-accent-blue transition-all flex items-center gap-3">
                                    <span className="text-accent-blue text-xl">{interest.icon}</span>
                                    <span className="font-medium text-text-primary text-sm">{interest.label}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Certifications */}
            {certifications.length > 0 && (
                <motion.section
                    className="py-20 bg-gradient-to-b from-bg-secondary to-bg-primary"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                >
                    <div className="container mx-auto px-6">
                        <motion.div variants={staggerItem} className="text-center mb-12">
                            <h2 className="text-3xl font-bold font-display mb-4">Certifications</h2>
                            <p className="text-text-secondary max-w-2xl mx-auto">
                                Professional certifications and credentials validating my expertise
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {certifications.map((cert, index) => {
                                const colors = [
                                    'from-orange-500/10 to-yellow-500/10 border-orange-500/20',
                                    'from-blue-500/10 to-purple-500/10 border-blue-500/20',
                                    'from-emerald-500/10 to-cyan-500/10 border-emerald-500/20',
                                ];
                                const colorClass = colors[index % colors.length];

                                return (
                                    <motion.div key={cert.id} variants={staggerItem}>
                                        <div className={`p-6 rounded-2xl border bg-gradient-to-br ${colorClass} hover:shadow-lg transition-all group h-full flex flex-col`}>
                                            <div className="w-14 h-14 rounded-xl bg-bg-card flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm relative">
                                                {cert.image_url ? (
                                                    <div className="relative w-10 h-10">
                                                        <Image
                                                            src={cert.image_url}
                                                            alt={cert.title}
                                                            fill
                                                            sizes="40px"
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-2xl">🏆</span>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-text-primary mb-1 text-lg">{cert.title}</h3>
                                            <p className="text-sm text-text-secondary mb-2">{cert.issuer}</p>
                                            <p className="text-xs text-text-muted mb-4">{cert.date_issued}</p>
                                            {cert.credential_url && (
                                                <a
                                                    href={cert.credential_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-accent-blue hover:underline"
                                                >
                                                    View Credential <FiArrowRight className="text-xs" />
                                                </a>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.section>
            )}

            {/* Future Directions */}
            <motion.section
                className="py-20 bg-bg-primary"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={staggerContainer}
            >
                <div className="container mx-auto px-6">
                    <motion.div variants={staggerItem} className="text-center mb-12">
                        <h2 className="text-3xl font-bold font-display mb-4">Future Directions</h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            Where I'm heading with my research and career
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {futureDirections.map((direction, index) => (
                            <motion.div key={index} variants={staggerItem}>
                                <Card className="h-full glass-panel">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue/20 to-purple-500/20 flex items-center justify-center text-2xl mb-4">
                                        {index === 0 ? '🏥' : index === 1 ? '🧠' : '🔐'}
                                    </div>
                                    <h3 className="text-lg font-bold text-text-primary mb-2">
                                        {direction.title}
                                    </h3>
                                    <p className="text-text-secondary text-sm leading-relaxed">
                                        {direction.description}
                                    </p>
                                </Card>
                              </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* CTA Section */}
            <section className="py-20 bg-bg-secondary border-t border-border-default">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-2xl md:text-3xl font-bold font-display mb-4">
                            Want to know more about my work?
                        </h2>
                        <p className="text-text-secondary mb-8">
                            Check out my projects to see my research in action, or explore my publications for academic work.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/projects" className="btn-primary">
                                View Projects <FiArrowRight />
                            </Link>
                            <Link href="/publications" className="btn-secondary">
                                Publications
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
