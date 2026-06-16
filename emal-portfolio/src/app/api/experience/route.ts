// src/app/api/experience/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/supabase';
import { getServerSession } from 'next-auth';

// GET all experience entries (newest start_date first)
export async function GET() {
    try {
        const experience = await sql`
            SELECT * FROM experience 
            ORDER BY start_date DESC, display_order ASC
        `;
        return NextResponse.json(experience);
    } catch (error: any) {
        console.error('Failed to get experience:', error);
        return NextResponse.json({ error: 'Failed to get experience: ' + error.message }, { status: 500 });
    }
}

// POST create experience entry (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            organization,
            location,
            type,
            start_date,
            end_date,
            is_current,
            description,
            skills,
            logo_url,
            display_order
        } = body;

        if (!title || !organization || !start_date) {
            return NextResponse.json({ error: 'Title, Organization, and Start Date are required' }, { status: 400 });
        }

        const result = await sql`
            INSERT INTO experience (
                title, organization, location, type, start_date, end_date, 
                is_current, description, skills, logo_url, display_order
            )
            VALUES (
                ${title}, ${organization}, ${location || ''}, ${type || 'work'}, 
                ${start_date}, ${is_current ? null : (end_date || null)}, ${is_current || false}, 
                ${description || ''}, ${skills || []}, ${logo_url || ''}, ${display_order || 0}
            )
            RETURNING *
        `;

        return NextResponse.json(result[0], { status: 201 });
    } catch (error: any) {
        console.error('Failed to create experience:', error);
        return NextResponse.json({ error: 'Failed to create experience: ' + error.message }, { status: 500 });
    }
}
