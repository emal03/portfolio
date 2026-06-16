// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/supabase';
import { getServerSession } from 'next-auth';

// GET all projects
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const featured = searchParams.get('featured');

        let projects;
        if (featured === 'true') {
            projects = await sql`
                SELECT * FROM projects 
                WHERE is_featured = true 
                ORDER BY created_at DESC
            `;
        } else {
            projects = await sql`
                SELECT * FROM projects 
                ORDER BY created_at DESC
            `;
        }

        return NextResponse.json(projects);
    } catch (error: any) {
        console.error('Failed to get projects:', error);
        return NextResponse.json({ error: 'Failed to get projects: ' + error.message }, { status: 500 });
    }
}

// POST create project (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            slug,
            description,
            detailed_description,
            github_url,
            is_gated,
            is_featured,
            status,
            tags,
            tech_stack,
            media,
            thumbnail_url,
            demo_url
        } = body;

        if (!title || !slug) {
            return NextResponse.json({ error: 'Title and Slug are required' }, { status: 400 });
        }

        const result = await sql`
            INSERT INTO projects (
                title, slug, description, detailed_description, github_url, 
                is_gated, is_featured, status, tags, tech_stack, media, 
                thumbnail_url, demo_url
            )
            VALUES (
                ${title}, ${slug}, ${description || ''}, ${detailed_description || ''}, ${github_url || ''}, 
                ${is_gated || false}, ${is_featured || false}, ${status || 'public'}, 
                ${tags || []}, ${tech_stack || []}, ${JSON.stringify(media || [])}::jsonb, 
                ${thumbnail_url || ''}, ${demo_url || ''}
            )
            RETURNING *
        `;

        return NextResponse.json(result[0], { status: 201 });
    } catch (error: any) {
        console.error('Failed to create project:', error);
        return NextResponse.json({ error: 'Failed to create project: ' + error.message }, { status: 500 });
    }
}
