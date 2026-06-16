// src/app/api/publications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/supabase';
import { getServerSession } from 'next-auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PUT update publication (Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const publicationId = parseInt(id);
        if (isNaN(publicationId)) {
            return NextResponse.json({ error: 'Invalid publication ID' }, { status: 400 });
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

        const result = await sql`
            UPDATE publications
            SET 
                title = ${title},
                authors = ${authors},
                journal_or_conference = ${journal_or_conference || ''},
                year = ${year ? parseInt(year) : null},
                doi = ${doi || ''},
                abstract = ${abstract || ''},
                pdf_url = ${pdf_url || ''},
                status = ${status || 'published'},
                citation_count = ${citation_count ? parseInt(citation_count) : 0},
                tags = ${tags || []}
            WHERE id = ${publicationId}
            RETURNING *
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Publication not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error: any) {
        console.error('Failed to update publication:', error);
        return NextResponse.json({ error: 'Failed to update publication: ' + error.message }, { status: 500 });
    }
}

// DELETE publication (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const publicationId = parseInt(id);
        if (isNaN(publicationId)) {
            return NextResponse.json({ error: 'Invalid publication ID' }, { status: 400 });
        }

        const result = await sql`
            DELETE FROM publications 
            WHERE id = ${publicationId}
            RETURNING id
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Publication not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Publication deleted successfully' });
    } catch (error: any) {
        console.error('Failed to delete publication:', error);
        return NextResponse.json({ error: 'Failed to delete publication: ' + error.message }, { status: 500 });
    }
}
