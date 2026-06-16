// src/components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiSun, FiMoon, FiDownload } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [name, setName] = useState('Emal Kamawal');
    const [title, setTitle] = useState('Data Scientist & ML Researcher');
    const [cvUrl, setCvUrl] = useState('/cv.pdf');
    const pathname = usePathname();
    const { resolvedTheme, setTheme } = useTheme();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/portfolio');
                if (!res.ok) return;
                const data = await res.json();
                if (data.settings) {
                    setName(data.settings.name || 'Emal Kamawal');
                    setTitle(data.settings.title || 'Data Scientist & ML Researcher');
                    setCvUrl(data.settings.cv_url || '/cv.pdf');
                }
            } catch (err) {
                console.error('Failed to load header settings', err);
            }
        };
        fetchSettings();
    }, []);

    // Hide Header on Admin Pages
    if (pathname && pathname.startsWith('/admin')) {
        return null;
    }

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About' },
        { href: '/projects', label: 'Projects' },
        { href: '/publications', label: 'Publications' },
        { href: '/experience', label: 'Experience' },
        { href: '/services', label: 'Services' },
        { href: '/blog', label: 'Blog' },
    ];

    const isActiveLink = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname?.startsWith(href);
    };

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="navbar-blur">
            <nav className="max-w-7xl mx-auto px-6 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo & Brand */}
                    <Link href="/" className="flex items-center gap-3 group">
                        {/* Modern Logo with Gradient Border */}
                        <div className="relative w-11 h-11 transition-all duration-500 group-hover:scale-105">
                            {/* Animated gradient ring */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent-blue via-purple-500 to-accent-cyan p-[2px] opacity-80 group-hover:opacity-100 transition-opacity">
                                <div className="w-full h-full rounded-xl bg-bg-secondary flex items-center justify-center">
                                    {/* Logo Text */}
                                    <span className="text-lg font-bold bg-gradient-to-br from-accent-blue to-purple-500 bg-clip-text text-transparent">
                                        EK
                                    </span>
                                </div>
                            </div>
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 rounded-xl bg-accent-blue opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                        </div>
                        {/* Brand Name with Modern Typography */}
                        <div className="flex flex-col">
                            <span className="text-lg font-bold tracking-tight text-text-primary group-hover:text-accent-blue transition-colors leading-tight">
                                {name}
                            </span>
                            <span className="text-[10px] font-medium text-text-muted uppercase tracking-widest">
                                {title}
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <ul className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`font-medium text-sm tracking-wide transition-all duration-300 relative group py-1 ${isActiveLink(link.href)
                                        ? 'text-accent-blue'
                                        : 'text-text-secondary hover:text-text-primary'
                                        }`}
                                >
                                    {link.label}
                                    <span
                                        className={`absolute bottom-0 left-0 h-[2px] bg-accent-blue transition-all duration-300 ${isActiveLink(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                                            }`}
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-lg bg-bg-secondary hover:bg-bg-card-hover text-text-secondary hover:text-text-primary transition-all duration-200"
                            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {resolvedTheme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
                        </button>

                        {/* CV Download Button - Desktop */}
                        <a
                            href={cvUrl}
                            download
                            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary border border-border-default hover:border-accent-blue rounded-lg transition-all duration-200"
                        >
                            <FiDownload size={16} />
                            CV
                        </a>

                        {/* CTA Button - Desktop */}
                        <div className="hidden lg:block">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link
                                    href="/contact"
                                    className="px-5 py-2.5 bg-gradient-to-r from-accent-blue to-accent-cyan text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                                >
                                    Let's Talk
                                </Link>
                            </motion.div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden p-2.5 rounded-lg bg-bg-secondary hover:bg-bg-card-hover text-text-primary transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle Menu"
                            aria-expanded={isMenuOpen}
                        >
                            {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="lg:hidden absolute top-full left-0 right-0 bg-bg-card border-b border-border-default shadow-xl"
                        >
                            <ul className="py-4 px-6 space-y-1">
                                {navLinks.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className={`block py-3 px-4 rounded-lg font-medium transition-all ${isActiveLink(link.href)
                                                ? 'bg-accent-blue/10 text-accent-blue'
                                                : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                                                }`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                                <li className="pt-4 flex gap-3">
                                    <a
                                        href={cvUrl}
                                        download
                                        className="flex-1 flex items-center justify-center gap-2 py-3 border border-border-default rounded-lg text-text-secondary font-medium hover:border-accent-blue transition-all"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <FiDownload size={16} />
                                        Download CV
                                    </a>
                                    <Link
                                        href="/contact"
                                        className="flex-1 py-3 bg-gradient-to-r from-accent-blue to-accent-cyan text-white rounded-lg text-center font-semibold transition-all"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Let's Talk
                                    </Link>
                                </li>
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
}
