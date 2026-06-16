// src/app/publications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiExternalLink, FiFileText, FiChevronDown, FiChevronUp, FiBookOpen } from 'react-icons/fi';
import Card from '@/components/ui/Card';

interface Publication {
    id: number;
    title: string;
    authors: string;
    journal_or_conference?: string;
    year: number;
    doi?: string;
    abstract?: string;
    pdf_url?: string;
    status: 'published' | 'under_review' | 'submitted';
    citation_count: number;
    tags: string[];
}

export default function PublicationsPage() {
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Published', 'Under Review', 'Submitted'];

    useEffect(() => {
        const fetchPublications = async () => {
            try {
                const res = await fetch('/api/publications');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setPublications(data);
            } catch (err) {
                console.error('Error fetching publications:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPublications();
    }, []);

    const toggleExpand = (id: number) => {
        if (expandedIds.includes(id)) {
            setExpandedIds(expandedIds.filter(x => x !== id));
        } else {
            setExpandedIds([...expandedIds, id]);
        }
    };

    const filteredPublications = publications.filter(pub => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Published') return pub.status === 'published';
        if (activeFilter === 'Under Review') return pub.status === 'under_review';
        if (activeFilter === 'Submitted') return pub.status === 'submitted';
        return true;
    });

    // Group publications by year descending
    const publicationsByYear: Record<number, Publication[]> = {};
    filteredPublications.forEach(pub => {
        const year = pub.year || 2026;
        if (!publicationsByYear[year]) {
            publicationsByYear[year] = [];
        }
        publicationsByYear[year].push(pub);
    });

    const sortedYears = Object.keys(publicationsByYear)
        .map(Number)
        .sort((a, b) => b - a);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'under_review':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 border border-yellow-500/20 text-warning">
                        Under Review
                    </span>
                );
            case 'published':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-success">
                        Published
                    </span>
                );
            case 'submitted':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 border border-blue-500/20 text-accent-blue">
                        Submitted
                    </span>
                );
            default:
                return null;
        }
    };

    const highlightAuthor = (authorsStr: string) => {
        const parts = authorsStr.split(',');
        return parts.map((part, idx) => {
            const trimmed = part.trim();
            const isEmal = trimmed.toLowerCase().includes('emal kamawal') || trimmed.toLowerCase().includes('emal');
            return (
                <span key={idx}>
                    {isEmal ? (
                        <span className="font-bold text-text-primary underline decoration-accent-blue decoration-2">{trimmed}</span>
                    ) : (
                        <span>{trimmed}</span>
                    )}
                    {idx < parts.length - 1 ? ', ' : ''}
                </span>
            );
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <div className="min-h-screen py-16 bg-bg-primary">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display text-gradient">Publications</h1>
                    <p className="text-text-secondary max-w-2xl mx-auto">
                        Academic papers, journals, and book chapters. Highlighting publications in biomedical informatics, computer vision, and machine learning.
                    </p>
                </motion.div>

                {/* Filter Tabs */}
                <div className="flex justify-center gap-2 mb-12">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => {
                                setActiveFilter(filter);
                                setExpandedIds([]); // collapse when switching tabs
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                activeFilter === filter
                                    ? 'bg-accent-blue text-white shadow-md'
                                    : 'bg-bg-secondary text-text-secondary border border-border-default hover:border-accent-blue hover:text-text-primary'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-8 animate-pulse">
                        {[1, 2].map((i) => (
                            <div key={i} className="space-y-3 p-6 bg-bg-card border border-border-light rounded-2xl">
                                <div className="h-6 bg-border-default rounded w-3/4" />
                                <div className="h-4 bg-border-default rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : sortedYears.length === 0 ? (
                    <div className="text-center py-16 text-text-secondary">
                        <p className="text-lg">No publications found.</p>
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-12"
                    >
                        {sortedYears.map((year) => (
                            <div key={year} className="space-y-6">
                                {/* Year Header with Gradient Line */}
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-bold text-accent-blue font-display">{year}</h2>
                                    <div className="flex-1 h-[1px] bg-gradient-to-r from-accent-blue/40 to-transparent" />
                                </div>

                                <div className="space-y-6">
                                    {publicationsByYear[year].map((pub) => {
                                        const isExpanded = expandedIds.includes(pub.id);
                                        return (
                                            <motion.div key={pub.id} variants={itemVariants}>
                                                <Card className="p-6 bg-bg-card border-border-light card-premium flex flex-col gap-4">
                                                    {/* Header: Title and Status */}
                                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                        <div className="space-y-1">
                                                            <h3 className="text-lg font-bold text-text-primary leading-snug">
                                                                {pub.title}
                                                            </h3>
                                                            <div className="text-sm text-text-secondary">
                                                                {highlightAuthor(pub.authors)}
                                                            </div>
                                                            {pub.journal_or_conference && (
                                                                <div className="text-sm text-text-muted italic">
                                                                    {pub.journal_or_conference}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            {getStatusBadge(pub.status)}
                                                        </div>
                                                    </div>

                                                    {/* Tags list */}
                                                    {pub.tags && pub.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {pub.tags.map(tag => (
                                                                <span key={tag} className="badge badge-blue">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Collapsible Abstract */}
                                                    {pub.abstract && (
                                                        <div className="border-t border-border-light/50 pt-3">
                                                            <button
                                                                onClick={() => toggleExpand(pub.id)}
                                                                className="flex items-center gap-1.5 text-xs font-semibold text-accent-blue hover:text-accent-cyan transition-colors"
                                                            >
                                                                <FiBookOpen size={13} />
                                                                {isExpanded ? 'Hide Abstract' : 'View Abstract'}
                                                                {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                                            </button>

                                                            <AnimatePresence initial={false}>
                                                                {isExpanded && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.2 }}
                                                                        className="overflow-hidden"
                                                                    >
                                                                        <p className="mt-3 text-sm text-text-secondary leading-relaxed pl-4 border-l-2 border-accent-blue/30 bg-bg-secondary/40 p-3 rounded-r-lg">
                                                                            {pub.abstract}
                                                                        </p>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    )}

                                                    {/* Bottom Panel: Actions and Citations */}
                                                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border-light/50 mt-2">
                                                        <div className="flex items-center gap-3">
                                                            {pub.doi && (
                                                                <a
                                                                    href={`https://doi.org/${pub.doi}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="px-3 py-1.5 text-xs font-semibold text-text-secondary bg-bg-secondary border border-border-default rounded hover:bg-bg-card-hover hover:text-text-primary transition-all flex items-center gap-1.5"
                                                                >
                                                                    <FiExternalLink size={12} />
                                                                    DOI
                                                                </a>
                                                            )}
                                                            {pub.pdf_url && (
                                                                <a
                                                                    href={pub.pdf_url}
                                                                    download
                                                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-accent-blue to-accent-cyan rounded hover:opacity-90 transition-all flex items-center gap-1.5"
                                                                >
                                                                    <FiFileText size={12} />
                                                                    Download PDF
                                                                </a>
                                                            )}
                                                        </div>

                                                        {pub.citation_count > 0 && (
                                                            <div className="text-xs font-bold text-text-muted bg-bg-secondary px-3 py-1.5 rounded-full border border-border-default">
                                                                Cited by {pub.citation_count}
                                                            </div>
                                                        )}
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
