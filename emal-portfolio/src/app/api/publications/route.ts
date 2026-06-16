// src/app/api/publications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/supabase';
import { getServerSession } from 'next-auth';

// GET all publications
export async function GET() {
    try {
        const publications = await sql`
            SELECT * FROM publications 
            ORDER BY year DESC, created_at DESC
        `;
        return NextResponse.json(publications);
    } catch (error: any) {
        console.error('Failed to get publications:', error);
        return NextResponse.json({ error: 'Failed to get publications: ' + error.message }, { status: 500 });
    }
}

// POST create publication (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            authors,
            journal_or_conference,
            year,
            doi,
            abstract,
            pdf_url,
            status,
            citation_count,
            tags
        } = body;

        if (!title || !authors) {
            return NextResponse.json({ error: 'Title and Authors are required' }, { status: 400 });
        }

        const result = await sql`
            INSERT INTO publications (
                title, authors, journal_or_conference, year, doi, abstract, 
                pdf_url, status, citation_count, tags
            )
            VALUES (
                ${title}, ${authors}, ${journal_or_conference || ''}, ${year ? parseInt(year) : null}, 
                ${doi || ''}, ${abstract || ''}, ${pdf_url || ''}, ${status || 'published'}, 
                ${citation_count ? parseInt(citation_count) : 0}, ${tags || []}
            )
            RETURNING *
        `;

        return NextResponse.json(result[0], { status: 201 });
    } catch (error: any) {
        console.error('Failed to create publication:', error);
        return NextResponse.json({ error: 'Failed to create publication: ' + error.message }, { status: 500 });
    }
}
