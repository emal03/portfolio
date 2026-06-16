// src/app/projects/[slug]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiGithub, FiLock, FiGlobe, FiPlay, FiCheckCircle } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import Card from '@/components/ui/Card';

interface MediaItem {
    id: number;
    url: string;
    type: 'image' | 'video';
    caption?: string;
}

interface Project {
    id: number;
    title: string;
    slug: string;
    description: string;
    detailed_description: string;
    github_url?: string;
    is_gated: boolean;
    is_featured: boolean;
    status: 'public' | 'gated' | 'private';
    tags: string[];
    tech_stack: string[];
    thumbnail_url?: string;
    demo_url?: string;
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
    const { slug } = use(params);
    const router = useRouter();

    const [project, setProject] = useState<Project | null>(null);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    // Media Gallery State
    const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

    // Form State for Gated Projects
    const [form, setForm] = useState({
        name: '',
        email: '',
        institution: '',
        purpose: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);
    const [requestError, setRequestError] = useState('');

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                // Fetch the current project
                const projectRes = await fetch(`/api/projects/${slug}`);
                if (!projectRes.ok) {
                    setLoading(false);
                    return;
                }
                const projectData = await projectRes.json();
                setProject(projectData);

                // Fetch media from DB
                if (projectData.id) {
                    const mediaRes = await fetch(`/api/admin/projects/${projectData.id}/media`);
                    if (mediaRes.ok) {
                        const mediaData = await mediaRes.json();
                        setMediaItems(mediaData || []);
                        if (mediaData.length > 0) {
                            setActiveMedia(mediaData[0]);
                        } else if (projectData.thumbnail_url) {
                            // Use thumbnail as default media item
                            const defaultItem: MediaItem = {
                                id: 0,
                                url: projectData.thumbnail_url,
                                type: 'image',
                                caption: 'Project Thumbnail'
                            };
                            setMediaItems([defaultItem]);
                            setActiveMedia(defaultItem);
                        }
                    }
                }

                // Fetch all projects to find related ones sharing the same tags
                const allRes = await fetch('/api/projects');
                if (allRes.ok) {
                    const allData = await allRes.json();
                    const filtered = allData
                        .filter((p: Project) => p.slug !== slug && p.tags?.some(t => projectData.tags?.includes(t)))
                        .slice(0, 3);
                    setRelatedProjects(filtered);
                }
            } catch (err) {
                console.error('Error loading project detail:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [slug]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleRequestAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project) return;
        setSubmitting(true);
        setRequestError('');
        try {
            const res = await fetch(`/api/projects/${project.id}/request-access`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (res.ok) {
                setRequestSuccess(true);
                // Clear draft
                setForm({ name: '', email: '', institution: '', purpose: '' });
            } else {
                setRequestError(data.error || 'Failed to submit request');
            }
        } catch (err: any) {
            setRequestError('Network error, please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-bg-primary">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary text-text-primary">
                <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
                <Link href="/projects" className="btn-secondary">
                    Back to Projects
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-16 bg-bg-primary">
            <div className="container mx-auto px-6 max-w-6xl">
                {/* Back Button */}
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-blue mb-8 transition-colors"
                >
                    <FiArrowLeft /> Back to Projects
                </Link>

                {/* Hero Header */}
                <div className="mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold font-display text-gradient mb-4">
                        {project.title}
                    </h1>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {project.tags?.map(tag => (
                            <span key={tag} className="badge badge-blue">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column (Content, Description, Media) */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Media Gallery */}
                        {mediaItems.length > 0 && activeMedia && (
                            <div className="space-y-4">
                                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-bg-secondary border border-border-light relative flex items-center justify-center">
                                    {activeMedia.type === 'video' ? (
                                        <video
                                            src={activeMedia.url}
                                            controls
                                            className="w-full h-full object-contain"
                                            poster={project.thumbnail_url}
                                        />
                                    ) : (
                                        <Image
                                            src={activeMedia.url}
                                            alt={activeMedia.caption || project.title}
                                            fill
                                            priority
                                            sizes="(max-width: 1024px) 100vw, 800px"
                                            className="object-contain"
                                        />
                                    )}
                                </div>

                                {/* Thumbnail Selector Carousel */}
                                {mediaItems.length > 1 && (
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border-default">
                                        {mediaItems.map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveMedia(item)}
                                                className={`relative w-28 aspect-video rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                                                    activeMedia.id === item.id ? 'border-accent-blue' : 'border-border-light'
                                                }`}
                                            >
                                                <Image
                                                    src={item.type === 'video' ? (project.thumbnail_url || '/placeholder.png') : item.url}
                                                    alt={item.caption || 'Thumbnail'}
                                                    fill
                                                    sizes="110px"
                                                    className="object-cover"
                                                />
                                                {item.type === 'video' && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                                                        <FiPlay size={16} />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {activeMedia.caption && (
                                    <p className="text-sm text-text-secondary italic text-center">
                                        {activeMedia.caption}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Detailed Description */}
                        <div className="glass-panel p-8 space-y-6">
                            <h2 className="text-2xl font-bold font-display text-text-primary">Project Overview</h2>
                            <article className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-4">
                                <ReactMarkdown>{project.detailed_description || project.description}</ReactMarkdown>
                            </article>
                        </div>
                    </div>

                    {/* Right Column (Info, GitHub/Access, Related Projects) */}
                    <div className="space-y-8">
                        {/* Demo/Links Info Box */}
                        <Card className="bg-bg-secondary border-border-light p-6 space-y-6">
                            {project.demo_url && (
                                <a
                                    href={project.demo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    <FiGlobe /> Live Demonstration
                                </a>
                            )}

                            <div>
                                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Technologies Used</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {project.tech_stack?.map(tech => (
                                        <span key={tech} className="badge badge-cyan">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* GitHub & Access Section */}
                        {project.status !== 'private' && (
                            <Card className="bg-bg-secondary border-border-light p-6 space-y-4">
                                {project.status === 'public' ? (
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-text-primary flex items-center gap-2">
                                            <FiGithub /> Repository Code
                                        </h3>
                                        <p className="text-sm text-text-secondary">
                                            This project has open-source files available for research and analysis.
                                        </p>
                                        {project.github_url && (
                                            <a
                                                href={project.github_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-secondary w-full flex items-center justify-center gap-2"
                                            >
                                                <FiGithub /> View on GitHub
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-text-primary flex items-center gap-2">
                                            <FiLock className="text-amber-400" /> Gated Repository
                                        </h3>
                                        <p className="text-sm text-text-secondary">
                                            The source code is currently restricted. You can request access for academic review.
                                        </p>

                                        {requestSuccess ? (
                                            <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-success flex items-start gap-3">
                                                <FiCheckCircle className="mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="font-semibold text-sm">Request Submitted</p>
                                                    <p className="text-xs opacity-90 mt-1">We will review your submission and notify you via email.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleRequestAccess} className="space-y-3 pt-2">
                                                <div>
                                                    <label className="block text-[11px] font-bold uppercase text-text-muted mb-1">Your Name</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        required
                                                        value={form.name}
                                                        onChange={handleFormChange}
                                                        className="w-full px-3 py-2 rounded bg-bg-primary border border-border-default text-text-primary text-sm focus:outline-none focus:border-accent-blue"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold uppercase text-text-muted mb-1">Your Email</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        required
                                                        value={form.email}
                                                        onChange={handleFormChange}
                                                        className="w-full px-3 py-2 rounded bg-bg-primary border border-border-default text-text-primary text-sm focus:outline-none focus:border-accent-blue"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold uppercase text-text-muted mb-1">Institution/Organization</label>
                                                    <input
                                                        type="text"
                                                        name="institution"
                                                        value={form.institution}
                                                        onChange={handleFormChange}
                                                        className="w-full px-3 py-2 rounded bg-bg-primary border border-border-default text-text-primary text-sm focus:outline-none focus:border-accent-blue"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold uppercase text-text-muted mb-1">Purpose of Access</label>
                                                    <textarea
                                                        name="purpose"
                                                        required
                                                        rows={3}
                                                        value={form.purpose}
                                                        onChange={handleFormChange}
                                                        className="w-full px-3 py-2 rounded bg-bg-primary border border-border-default text-text-primary text-sm focus:outline-none focus:border-accent-blue resize-none"
                                                    />
                                                </div>
                                                {requestError && (
                                                    <p className="text-xs text-danger">{requestError}</p>
                                                )}
                                                <button
                                                    type="submit"
                                                    disabled={submitting}
                                                    className="btn-primary w-full py-2.5 text-sm"
                                                >
                                                    {submitting ? 'Submitting...' : 'Request Access'}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Related Projects */}
                        {relatedProjects.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-text-primary font-display">Related Research</h3>
                                <div className="space-y-4">
                                    {relatedProjects.map(rel => (
                                        <Link href={`/projects/${rel.slug}`} key={rel.id} className="block">
                                            <Card className="p-4 bg-bg-secondary border-border-light hover:border-accent-blue transition-all group">
                                                <p className="text-xs text-accent-blue mb-1">
                                                    {rel.tags?.[0]}
                                                </p>
                                                <h4 className="font-bold text-text-primary text-sm group-hover:text-accent-blue transition-colors">
                                                    {rel.title}
                                                </h4>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
