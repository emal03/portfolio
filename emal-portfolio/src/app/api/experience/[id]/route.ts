// src/app/api/experience/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/supabase';
import { getServerSession } from 'next-auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PUT update experience (Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const experienceId = parseInt(id);
        if (isNaN(experienceId)) {
            return NextResponse.json({ error: 'Invalid experience ID' }, { status: 400 });
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

        const result = await sql`
            UPDATE experience
            SET 
                title = ${title},
                organization = ${organization},
                location = ${location || ''},
                type = ${type || 'work'},
                start_date = ${start_date},
                end_date = ${is_current ? null : (end_date || null)},
                is_current = ${is_current || false},
                description = ${description || ''},
                skills = ${skills || []},
                logo_url = ${logo_url || ''},
                display_order = ${display_order || 0}
            WHERE id = ${experienceId}
            RETURNING *
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Experience entry not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error: any) {
        console.error('Failed to update experience:', error);
        return NextResponse.json({ error: 'Failed to update experience: ' + error.message }, { status: 500 });
    }
}

// DELETE experience (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const experienceId = parseInt(id);
        if (isNaN(experienceId)) {
            return NextResponse.json({ error: 'Invalid experience ID' }, { status: 400 });
        }

        const result = await sql`
            DELETE FROM experience 
            WHERE id = ${experienceId}
            RETURNING id
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Experience entry not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Experience entry deleted successfully' });
    } catch (error: any) {
        console.error('Failed to delete experience:', error);
        return NextResponse.json({ error: 'Failed to delete experience: ' + error.message }, { status: 500 });
    }
}
