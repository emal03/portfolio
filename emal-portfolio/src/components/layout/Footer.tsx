// src/components/layout/Footer.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiGithub, FiLinkedin, FiMail, FiArrowUpRight } from 'react-icons/fi';

export default function Footer() {
    const pathname = usePathname();
    const currentYear = new Date().getFullYear();

    const [name, setName] = useState('Emal Kamawal');
    const [title, setTitle] = useState('Data Scientist & ML Researcher');
    const [email, setEmail] = useState('emalkamawal01@gmail.com');
    const [github, setGithub] = useState('https://github.com/emal03');
    const [linkedin, setLinkedin] = useState('https://www.linkedin.com/in/emal-kamawal-804340251/');
    const [bio, setBio] = useState('Data Scientist & ML Researcher specializing in Machine Learning, Computer Vision, and Medical Data Analysis.');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/portfolio');
                if (!res.ok) return;
                const data = await res.json();
                if (data.settings) {
                    setName(data.settings.name || 'Emal Kamawal');
                    setTitle(data.settings.title || 'Data Scientist & ML Researcher');
                    setEmail(data.settings.email || 'emalkamawal01@gmail.com');
                    setGithub(data.settings.github || 'https://github.com/emal03');
                    setLinkedin(data.settings.linkedin || 'https://www.linkedin.com/in/emal-kamawal-804340251/');
                    setBio(data.settings.subtitle || data.settings.bio || 'Data Scientist & ML Researcher specializing in Machine Learning, Computer Vision, and Medical Data Analysis.');
                }
            } catch (err) {
                console.error('Failed to load footer settings', err);
            }
        };
        fetchSettings();
    }, []);

    if (pathname && pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <footer className="bg-bg-secondary border-t border-border-default mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
                    {/* About */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-3 mb-4 group">
                            {/* Modern Logo with Gradient Border - matching header */}
                            <div className="relative w-11 h-11 transition-all duration-500 group-hover:scale-105">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent-blue via-purple-500 to-accent-cyan p-[2px] opacity-80 group-hover:opacity-100 transition-opacity">
                                    <div className="w-full h-full rounded-xl bg-bg-primary flex items-center justify-center">
                                        <span className="text-lg font-bold bg-gradient-to-br from-accent-blue to-purple-500 bg-clip-text text-transparent">
                                            EK
                                        </span>
                                    </div>
                                </div>
                                <div className="absolute inset-0 rounded-xl bg-accent-blue opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-text-primary group-hover:text-accent-blue transition-colors">
                                    {name}
                                </span>
                                <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                                    {title}
                                </span>
                            </div>
                        </Link>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            {bio}
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-3 mt-6">
                            {github && (
                                <a
                                    href={github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-lg bg-bg-primary border border-border-default text-text-secondary hover:text-accent-blue hover:border-accent-blue transition-all"
                                    aria-label="GitHub"
                                >
                                    <FiGithub size={18} />
                                </a>
                            )}
                            {linkedin && (
                                <a
                                    href={linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-lg bg-bg-primary border border-border-default text-text-secondary hover:text-accent-blue hover:border-accent-blue transition-all"
                                    aria-label="LinkedIn"
                                >
                                    <FiLinkedin size={18} />
                                </a>
                            )}
                            {email && (
                                <a
                                    href={`mailto:${email}`}
                                    className="p-2.5 rounded-lg bg-bg-primary border border-border-default text-text-secondary hover:text-accent-blue hover:border-accent-blue transition-all"
                                    aria-label="Email"
                                >
                                    <FiMail size={18} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-text-primary mb-4">Quick Links</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/projects" className="text-text-secondary hover:text-accent-blue transition-colors inline-flex items-center gap-1">
                                    Projects <FiArrowUpRight size={12} />
                                </Link>
                            </li>
                            <li>
                                <Link href="/publications" className="text-text-secondary hover:text-accent-blue transition-colors inline-flex items-center gap-1">
                                    Publications <FiArrowUpRight size={12} />
                                </Link>
                            </li>
                            <li>
                                <Link href="/experience" className="text-text-secondary hover:text-accent-blue transition-colors inline-flex items-center gap-1">
                                    Experience <FiArrowUpRight size={12} />
                                </Link>
                            </li>
                            <li>
                                <Link href="/services" className="text-text-secondary hover:text-accent-blue transition-colors inline-flex items-center gap-1">
                                    Services <FiArrowUpRight size={12} />
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-text-secondary hover:text-accent-blue transition-colors inline-flex items-center gap-1">
                                    Contact <FiArrowUpRight size={12} />
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Research Focus */}
                    <div>
                        <h4 className="font-semibold text-text-primary mb-4">Research Focus</h4>
                        <ul className="space-y-3 text-sm text-text-secondary">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-blue"></span>
                                Machine Learning & Data Science
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                Computer Vision & Medical Imaging
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan"></span>
                                Bioinformatics & Research
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Medical Data Analysis
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                Deep Learning
                            </li>
                        </ul>
                    </div>

                    {/* Contact CTA */}
                    <div>
                        <h4 className="font-semibold text-text-primary mb-4">Let's Collaborate</h4>
                        <p className="text-sm text-text-secondary mb-4">
                            Interested in research collaboration, consulting, or just want to connect?
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-blue to-accent-cyan text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                            Get in Touch
                            <FiArrowUpRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-border-default mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-muted">
                    <p>&copy; {currentYear} {name}. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span>Built with ❤️ for AI Research</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
