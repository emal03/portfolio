import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';
import { sendEmail } from '@/lib/email';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL!);

async function handleUpdate(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newEmail, newPassword } = await req.json();

    if (!currentPassword) {
      return NextResponse.json({ success: false, error: 'Current password is required' }, { status: 400 });
    }

    if (!newEmail && !newPassword) {
      return NextResponse.json({ success: false, error: 'Provide a new email or password' }, { status: 400 });
    }

    if (newPassword && newPassword.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Get current admin
    const admins = await sql`SELECT * FROM admin_users WHERE email = ${session.user.email} LIMIT 1`;
    if (!admins.length) {
      return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });
    }
    const admin = admins[0];

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, admin.password_hash as string);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
    }

    const emailToSet   = newEmail    || (admin.email as string);
    const hashToSet    = newPassword ? await bcrypt.hash(newPassword, 10) : (admin.password_hash as string);
    const emailChanged = !!newEmail  && newEmail !== admin.email;
    const pwChanged    = !!newPassword;

    // Update
    await sql`
      UPDATE admin_users
      SET email         = ${emailToSet},
          password_hash = ${hashToSet},
          session_version = COALESCE(session_version, 0) + 1
      WHERE id = ${admin.id}
    `;

    // Security alert email
    const ip  = req.headers.get('x-forwarded-for')?.split(',')[0] || 'Unknown';
    const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi', dateStyle: 'full', timeStyle: 'long' });

    sendEmail(
      emailToSet,
      'Security Alert — Admin Credentials Updated',
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;
                   background:#0a0f1e;color:#f1f5f9;padding:32px;border-radius:12px;">
        <h2 style="color:#3b82f6;">🔐 Security Alert</h2>
        <p>Your portfolio admin credentials were updated.</p>
        <div style="background:#111827;padding:16px;border-radius:8px;
                    border-left:4px solid #3b82f6;margin:20px 0;">
          <p><strong>📅 Time:</strong> ${now}</p>
          <p><strong>🌐 IP:</strong> ${ip}</p>
          ${emailChanged ? `<p><strong>📧 New Email:</strong> ${emailToSet}</p>` : ''}
          ${pwChanged    ? `<p><strong>🔑 Password:</strong> Changed</p>` : ''}
        </div>
        <p style="color:#ef4444;">⚠️ If this was NOT you, secure your account immediately.</p>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">— Portfolio Security System</p>
      </div>`
    ).catch(console.error);

    return NextResponse.json({ success: true, emailChanged, passwordChanged: pwChanged });

  } catch (error) {
    console.error('Update credentials error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update credentials' }, { status: 500 });
  }
}

// Handle both PUT (from frontend) and POST
export const PUT  = handleUpdate;
export const POST = handleUpdate;
