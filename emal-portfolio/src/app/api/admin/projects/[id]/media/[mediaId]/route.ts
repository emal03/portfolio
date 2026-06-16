// src/app/api/admin/projects/[id]/media/[mediaId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql, supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';

interface RouteParams {
    params: Promise<{ id: string; mediaId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, mediaId } = await params;
        const projectId = parseInt(id);
        const parsedMediaId = parseInt(mediaId);

        if (isNaN(projectId) || isNaN(parsedMediaId)) {
            return NextResponse.json({ error: 'Invalid project ID or media ID' }, { status: 400 });
        }

        // Fetch media item to get URL (to delete from storage)
        const mediaResult = await sql`
            SELECT url FROM project_media 
            WHERE id = ${parsedMediaId} AND project_id = ${projectId}
        `;
        
        if (mediaResult.length === 0) {
            return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
        }

        const mediaItem = mediaResult[0];

        // Attempt to delete from Supabase storage (parse filename from signed URL)
        try {
            // Signed URL format: https://...supabase.co/storage/v1/object/sign/portfolio/projects/1/12345_file.png?...
            // We can parse the path after 'portfolio/'
            const urlObj = new URL(mediaItem.url);
            const pathParts = urlObj.pathname.split('/portfolio/');
            if (pathParts.length > 1) {
                const storagePath = decodeURIComponent(pathParts[1]);
                await supabase.storage.from('portfolio').remove([storagePath]);
                console.log(`🗑️ Deleted from Supabase Storage: portfolio/${storagePath}`);
            }
        } catch (storageErr: any) {
            console.warn('⚠️ Could not delete file from Supabase storage:', storageErr.message);
        }

        // Delete from Neon database
        await sql`
            DELETE FROM project_media 
            WHERE id = ${parsedMediaId}
        `;

        return NextResponse.json({ success: true, message: 'Media item deleted successfully' });
    } catch (error: any) {
        console.error('Failed to delete media:', error);
        return NextResponse.json({ error: 'Failed to delete media: ' + error.message }, { status: 500 });
    }
}
