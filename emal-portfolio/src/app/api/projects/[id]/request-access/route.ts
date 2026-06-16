// src/app/api/projects/[id]/request-access/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/supabase';
import nodemailer from 'nodemailer';

interface RouteParams {
    params: Promise<{ id: string }>;
}

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
    },
});

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const projectId = parseInt(id);
        if (isNaN(projectId)) {
            return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
        }

        const body = await request.json();
        const { name, email, institution, purpose } = body;

        if (!name || !email || !purpose) {
            return NextResponse.json({ error: 'Name, Email, and Purpose are required' }, { status: 400 });
        }

        // Fetch project to verify it exists and is gated
        const projectResult = await sql`SELECT * FROM projects WHERE id = ${projectId}`;
        const project = projectResult[0];

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Save to code_requests table
        const insertResult = await sql`
            INSERT INTO code_requests (
                project_id, requester_name, requester_email, requester_institution, purpose, status
            )
            VALUES (
                ${projectId}, ${name}, ${email}, ${institution || ''}, ${purpose}, 'pending'
            )
            RETURNING *
        `;

        // Send notification email to admin if SMTP is configured
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
                await transporter.sendMail({
                    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                    to: adminEmail,
                    subject: `🔒 Gated Code Access Request: ${project.title}`,
                    html: `
                        <h2>New Code Access Request</h2>
                        <p><strong>Project:</strong> ${project.title}</p>
                        <p><strong>Requester Name:</strong> ${name}</p>
                        <p><strong>Requester Email:</strong> ${email}</p>
                        <p><strong>Institution/Organization:</strong> ${institution || 'Not specified'}</p>
                        <p><strong>Purpose/Reason:</strong></p>
                        <p style="white-space: pre-wrap; background-color: #f5f5f5; padding: 10px; border-radius: 5px;">${purpose}</p>
                        <hr />
                        <p>To approve or reject this request, please log into your admin dashboard at <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/access-requests">Admin Access Requests</a>.</p>
                    `,
                });
                console.log('✅ Access request notification email sent to admin');
            } catch (emailErr: any) {
                console.error('⚠️ Failed to send access request notification email:', emailErr.message);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Access request submitted successfully',
            data: insertResult[0]
        }, { status: 201 });
    } catch (error: any) {
        console.error('Request access error:', error);
        return NextResponse.json({ error: 'Failed to request access: ' + error.message }, { status: 500 });
    }
}
