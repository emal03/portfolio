// src/app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/supabase';
import { getServerSession } from 'next-auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET single project by ID or Slug
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        let project;

        // If ID is numeric, query by ID, else by slug
        if (/^\d+$/.test(id)) {
            const result = await sql`SELECT * FROM projects WHERE id = ${parseInt(id)}`;
            project = result[0];
        } else {
            const result = await sql`SELECT * FROM projects WHERE slug = ${id}`;
            project = result[0];
        }

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Fetch associated project media
        const media = await sql`
            SELECT * FROM project_media 
            WHERE project_id = ${project.id} 
            ORDER BY display_order ASC
        `;
        project.media = media || [];

        return NextResponse.json(project);
    } catch (error: any) {
        console.error('Failed to get project:', error);
        return NextResponse.json({ error: 'Failed to get project: ' + error.message }, { status: 500 });
    }
}

// PUT update project (Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
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

        const projectId = parseInt(id);
        if (isNaN(projectId)) {
            return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
        }

        const result = await sql`
            UPDATE projects
            SET 
                title = ${title},
                slug = ${slug},
                description = ${description || ''},
                detailed_description = ${detailed_description || ''},
                github_url = ${github_url || ''},
                is_gated = ${is_gated || false},
                is_featured = ${is_featured || false},
                status = ${status || 'public'},
                tags = ${tags || []},
                tech_stack = ${tech_stack || []},
                media = ${JSON.stringify(media || [])}::jsonb,
                thumbnail_url = ${thumbnail_url || ''},
                demo_url = ${demo_url || ''},
                updated_at = NOW()
            WHERE id = ${projectId}
            RETURNING *
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error: any) {
        console.error('Failed to update project:', error);
        return NextResponse.json({ error: 'Failed to update project: ' + error.message }, { status: 500 });
    }
}

// DELETE project (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const projectId = parseInt(id);
        if (isNaN(projectId)) {
            return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
        }

        const result = await sql`
            DELETE FROM projects 
            WHERE id = ${projectId}
            RETURNING id
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Project deleted successfully' });
    } catch (error: any) {
        console.error('Failed to delete project:', error);
        return NextResponse.json({ error: 'Failed to delete project: ' + error.message }, { status: 500 });
    }
}
