// src/app/api/admin/projects/[id]/media/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, sql } from '@/lib/supabase';
import { getServerSession } from 'next-auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const caption = (formData.get('caption') as string) || '';
        const displayOrder = parseInt((formData.get('display_order') as string) || '0');

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage (bucket 'portfolio')
        // Generate a unique filename using timestamp and sanitized original name
        const timestamp = Date.now();
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `projects/${projectId}/${timestamp}_${sanitizedFilename}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('portfolio')
            .upload(storagePath, buffer, {
                contentType: file.type,
                duplex: 'half'
            } as any);

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return NextResponse.json({ error: 'Storage upload failed: ' + uploadError.message }, { status: 500 });
        }

        // Generate a 10-year signed URL for the image or video
        const tenYearsInSeconds = 60 * 60 * 24 * 365 * 10;
        const { data: signedData, error: signedError } = await supabase.storage
            .from('portfolio')
            .createSignedUrl(storagePath, tenYearsInSeconds);

        if (signedError || !signedData?.signedUrl) {
            console.error('Failed to generate signed URL:', signedError);
            return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
        }

        // Determine media type (image or video)
        const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

        // Insert media metadata into Neon database
        const mediaResult = await sql`
            INSERT INTO project_media (project_id, url, type, caption, display_order)
            VALUES (${projectId}, ${signedData.signedUrl}, ${mediaType}, ${caption}, ${displayOrder})
            RETURNING *
        `;

        return NextResponse.json({
            success: true,
            data: mediaResult[0]
        }, { status: 201 });
    } catch (error: any) {
        console.error('Media upload error:', error);
        return NextResponse.json({ error: 'Failed to upload media: ' + error.message }, { status: 500 });
    }
}
