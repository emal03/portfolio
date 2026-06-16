// src/app/experience/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiBriefcase, FiCpu, FiBookOpen } from 'react-icons/fi';
import Card from '@/components/ui/Card';
import ReactMarkdown from 'react-markdown';

interface Experience {
    id: number;
    title: string;
    organization: string;
    location?: string;
    type: 'work' | 'internship' | 'research' | 'volunteer';
    start_date: string;
    end_date?: string;
    is_current: boolean;
    description?: string;
    skills: string[];
    logo_url?: string;
    display_order: number;
}

export default function ExperiencePage() {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Work', 'Internship', 'Research'];

    useEffect(() => {
        const fetchExperience = async () => {
            try {
                const res = await fetch('/api/experience');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setExperiences(data);
            } catch (err) {
                console.error('Error fetching experience:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchExperience();
    }, []);

    const filteredExperiences = experiences.filter(exp => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Work') return exp.type === 'work';
        if (activeFilter === 'Internship') return exp.type === 'internship';
        if (activeFilter === 'Research') return exp.type === 'research';
        return true;
    });

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'work':
                return 'badge-blue';
            case 'internship':
                return 'badge-purple';
            case 'research':
                return 'badge-emerald';
            case 'volunteer':
                return 'badge-cyan';
            default:
                return 'badge-blue';
        }
    };

    const formatDuration = (startDateStr: string, endDateStr: string | null | undefined, isCurrent: boolean) => {
        if (!startDateStr) return '';
        const start = new Date(startDateStr);
        const end = isCurrent || !endDateStr ? new Date() : new Date(endDateStr);

        const monthsNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const startFormatted = `${monthsNames[start.getUTCMonth()]} ${start.getUTCFullYear()}`;
        const endFormatted = isCurrent ? 'Present' : `${monthsNames[end.getUTCMonth()]} ${end.getUTCFullYear()}`;

        // Calculate months difference
        let totalMonths = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth()) + 1;
        if (totalMonths <= 0) totalMonths = 1;

        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;

        let durationPart = '';
        if (years > 0) {
            durationPart += `${years} yr${years > 1 ? 's' : ''}`;
        }
        if (months > 0) {
            if (durationPart) durationPart += ' ';
            durationPart += `${months} mo${months > 1 ? 's' : ''}`;
        }
        if (!durationPart) {
            durationPart = '1 mo';
        }

        return `${startFormatted} – ${endFormatted} (${durationPart})`;
    };

    const getYear = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).getUTCFullYear();
    };

    return (
        <div className="min-h-screen py-16 bg-bg-primary">
            <div className="container mx-auto px-6 max-w-5xl">
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display text-gradient">Experience</h1>
                    <p className="text-text-secondary max-w-2xl mx-auto">
                        My professional timeline highlighting industry experience, research fellowships, and engineering internships.
                    </p>
                </motion.div>

                {/* Filter Tabs */}
                <div className="flex justify-center gap-2 mb-16">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
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
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue" />
                    </div>
                ) : filteredExperiences.length === 0 ? (
                    <div className="text-center py-16 text-text-secondary">
                        <p className="text-lg">No experience entries found.</p>
                    </div>
                ) : (
                    /* Vertical Timeline Container */
                    <div className="relative max-w-4xl mx-auto">
                        {/* Central Vertical Line */}
                        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-gradient-to-b from-accent-blue via-accent-cyan to-accent-blue opacity-50 hidden md:block" />
                        <div className="absolute left-6 top-0 bottom-0 w-1 -translate-x-1/2 bg-gradient-to-b from-accent-blue via-accent-cyan to-accent-blue opacity-50 md:hidden" />

                        <div className="space-y-12">
                            {filteredExperiences.map((exp, index) => {
                                const isEven = index % 2 === 0;
                                const isLast = index === filteredExperiences.length - 1;
                                const yearLabel = getYear(exp.start_date);

                                return (
                                    <div key={exp.id} className="relative">
                                        {/* Year Label/Node on the center line */}
                                        <div className="absolute left-6 md:left-1/2 -translate-x-1/2 -top-8 z-20">
                                            <span className="px-3 py-1 bg-bg-secondary text-accent-blue border border-border-default rounded-full text-xs font-bold font-display shadow-md">
                                                {yearLabel}
                                            </span>
                                        </div>

                                        <div className={`flex flex-col md:flex-row items-stretch ${isEven ? 'md:flex-row-reverse' : ''} pt-4`}>
                                            {/* Left side spacer on desktop */}
                                            <div className="w-full md:w-1/2 hidden md:block" />

                                            {/* Timeline Node Icon/Dot */}
                                            <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-14 w-10 h-10 rounded-full bg-bg-card border-2 border-accent-blue z-20 flex items-center justify-center text-text-primary text-sm shadow-md">
                                                {exp.type === 'research' ? <FiBookOpen size={16} /> : <FiBriefcase size={16} />}
                                            </div>

                                            {/* Card Panel Container */}
                                            <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-8 relative">
                                                {/* Arrow Connector (points to line) */}
                                                <div className={`hidden md:block absolute top-[62px] w-0 h-0 border-y-8 border-y-transparent z-10 ${
                                                    isEven 
                                                        ? 'left-[24px] border-r-8 border-r-bg-card' 
                                                        : 'right-[24px] border-l-8 border-l-bg-card'
                                                }`} />
                                                <div className="md:hidden absolute top-[62px] left-[40px] w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-bg-card z-10" />

                                                {/* Card */}
                                                <Card className="bg-bg-card border-border-light card-premium p-6 relative flex flex-col" hover={true}>
                                                    {/* Card Header */}
                                                    <div className="flex gap-4 items-start mb-4">
                                                        {/* Logo / Initials */}
                                                        <div className="w-12 h-12 rounded-xl bg-bg-secondary border border-border-light flex items-center justify-center flex-shrink-0 text-accent-blue font-bold text-lg relative overflow-hidden">
                                                            {exp.logo_url ? (
                                                                <img src={exp.logo_url} alt={exp.organization} className="w-full h-full object-cover" />
                                                            ) : (
                                                                getInitials(exp.organization)
                                                            )}
                                                        </div>

                                                        <div className="space-y-0.5">
                                                            <h3 className="text-lg font-bold text-gradient leading-tight">
                                                                {exp.title}
                                                            </h3>
                                                            <p className="text-sm font-semibold text-text-primary">
                                                                {exp.organization}
                                                            </p>
                                                            {exp.location && (
                                                                <p className="text-xs text-text-muted flex items-center gap-1">
                                                                    <FiMapPin size={11} /> {exp.location}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Duration & Status Badge */}
                                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                                        <span className="text-xs text-text-secondary flex items-center gap-1">
                                                            <FiCalendar size={13} /> {formatDuration(exp.start_date, exp.end_date, exp.is_current)}
                                                        </span>

                                                        <span className={`badge ${getTypeBadgeColor(exp.type)} uppercase tracking-wider text-[9px] font-bold`}>
                                                            {exp.type}
                                                        </span>

                                                        {exp.is_current && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-success">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Description (Markdown) */}
                                                    {exp.description && (
                                                        <div className="text-sm text-text-secondary leading-relaxed mb-4 prose prose-invert max-w-none">
                                                            <ReactMarkdown>{exp.description}</ReactMarkdown>
                                                        </div>
                                                    )}

                                                    {/* Skills list */}
                                                    {exp.skills && exp.skills.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {exp.skills.map(skill => (
                                                                <span key={skill} className="badge badge-blue">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </Card>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
