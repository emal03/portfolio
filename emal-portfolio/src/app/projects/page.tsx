// src/app/projects/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiExternalLink, FiLock, FiGithub, FiArrowRight } from 'react-icons/fi';
import Card from '@/components/ui/Card';

interface Project {
    id: number;
    title: string;
    slug: string;
    description: string;
    github_url?: string;
    is_gated: boolean;
    is_featured: boolean;
    status: 'public' | 'gated' | 'private';
    tags: string[];
    tech_stack: string[];
    thumbnail_url?: string;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState('All');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('/api/projects');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setProjects(data);
            } catch (err) {
                console.error('Error fetching projects:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // Extract all unique tags for filtering
    const allTags = ['All', ...Array.from(new Set(projects.flatMap(p => p.tags || [])))];

    const filteredProjects = projects.filter(project => {
        const matchesTag = activeTag === 'All' || project.tags?.includes(activeTag);
        const matchesSearch = searchQuery === '' ||
            project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.tech_stack?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
            project.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTag && matchesSearch;
    });

    return (
        <div className="min-h-screen py-16 bg-bg-primary">
            <div className="container mx-auto px-6">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display text-gradient">Projects</h1>
                    <p className="text-text-secondary max-w-2xl mx-auto">
                        Explore my latest research, deep learning frameworks, and AI diagnostics projects.
                        Request access to review gated code repositories.
                    </p>
                </motion.div>

                {/* Filters */}
                <motion.div
                    className="mb-12 space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {/* Search */}
                    <div className="max-w-md mx-auto relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                            <FiSearch size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by title, technology, tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-bg-secondary border border-border-default text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue transition-colors"
                        />
                    </div>

                    {/* Tag Filters */}
                    {allTags.length > 1 && (
                        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                            {allTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => setActiveTag(tag)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                                        activeTag === tag
                                            ? 'bg-accent-blue text-white shadow-md'
                                            : 'bg-bg-secondary text-text-secondary border border-border-default hover:border-accent-blue hover:text-text-primary'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Loading skeleton */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-bg-card border border-border-light rounded-2xl p-6 space-y-4 animate-pulse">
                                <div className="aspect-video bg-border-default rounded-xl" />
                                <div className="h-6 bg-border-default rounded w-3/4" />
                                <div className="h-4 bg-border-default rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Grid */}
                {!loading && filteredProjects.length === 0 ? (
                    <div className="text-center py-16 text-text-secondary">
                        <p className="text-lg">No projects found matching your search.</p>
                    </div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                        }}
                    >
                        {filteredProjects.map((project) => (
                            <motion.div
                                key={project.id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0 }
                                }}
                                className="h-full"
                            >
                                <Card className="h-full overflow-hidden flex flex-col card-premium group" hover={false}>
                                    {/* Thumbnail Image */}
                                    <div className="aspect-video w-full overflow-hidden relative border-b border-border-light">
                                        <Image
                                            src={project.thumbnail_url || '/projects/thought-viz.png'}
                                            alt={project.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        {project.is_featured && (
                                            <span className="absolute top-3 left-3 px-2 py-1 bg-amber-500/90 text-white text-[10px] font-bold rounded">
                                                ⭐ Featured
                                            </span>
                                        )}
                                        <span className={`absolute top-3 right-3 badge ${project.status === 'public' ? 'badge-blue' : 'badge-amber'}`}>
                                            {project.status === 'public' ? 'Public' : project.status === 'gated' ? 'Gated' : 'Private'}
                                        </span>
                                    </div>

                                    {/* Card Details */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        {/* Tags & Tech badges */}
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {(project.tags || []).slice(0, 2).map(tag => (
                                                <span key={tag} className="badge badge-blue">
                                                    {tag}
                                                </span>
                                            ))}
                                            {(project.tech_stack || []).slice(0, 2).map(tech => (
                                                <span key={tech} className="badge badge-cyan">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>

                                        <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-accent-blue transition-colors">
                                            {project.title}
                                        </h3>
                                        
                                        <p className="text-text-secondary text-sm line-clamp-3 mb-6 flex-1">
                                            {project.description}
                                        </p>

                                        {/* Action buttons */}
                                        <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-border-light">
                                            {project.is_gated ? (
                                                <Link
                                                    href={`/projects/${project.slug}`}
                                                    className="px-3 py-2 text-center text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg hover:bg-amber-400/20 transition-all flex items-center justify-center gap-1.5"
                                                >
                                                    <FiLock size={12} />
                                                    Access Code
                                                </Link>
                                            ) : (
                                                project.github_url ? (
                                                    <a
                                                        href={project.github_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 text-center text-xs font-semibold text-text-primary bg-bg-secondary border border-border-default rounded-lg hover:bg-bg-card-hover transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        <FiGithub size={12} />
                                                        GitHub
                                                    </a>
                                                ) : (
                                                    <div className="px-3 py-2 text-center text-xs font-semibold text-text-muted bg-transparent border border-dashed border-border-default rounded-lg select-none">
                                                        No Code Repo
                                                    </div>
                                                )
                                            )}

                                            <Link
                                                href={`/projects/${project.slug}`}
                                                className="px-3 py-2 text-center text-xs font-semibold text-white bg-gradient-to-r from-accent-blue to-accent-cyan rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-1"
                                            >
                                                Details
                                                <FiArrowRight size={12} />
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
