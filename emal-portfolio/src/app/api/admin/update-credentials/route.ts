import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';
import { sendEmail } from '@/lib/email';

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL!);

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { currentPassword, newEmail, newPassword } = await req.json();
    if (!currentPassword || !newEmail || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    const admins = await sql`SELECT * FROM admin_users WHERE id = 1`;
    if (!admins.length) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    const admin = admins[0];
    const valid = await bcrypt.compare(currentPassword, admin.password_hash as string);
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    const newHash = await bcrypt.hash(newPassword, 10);
    await sql`UPDATE admin_users SET email = ${newEmail}, password_hash = ${newHash}, session_version = COALESCE(session_version, 0) + 1 WHERE id = 1`;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'Unknown IP';
    const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi', dateStyle: 'full', timeStyle: 'long' });
    await sendEmail(newEmail, 'Security Alert — Admin Credentials Updated',
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#f1f5f9;padding:32px;border-radius:12px;">
        <h2 style="color:#3b82f6;">🔐 Security Alert</h2>
        <p>Your portfolio admin credentials were successfully updated.</p>
        <div style="background:#111827;padding:16px;border-radius:8px;border-left:4px solid #3b82f6;margin:20px 0;">
          <p><strong>Date & Time:</strong> ${now}</p>
          <p><strong>IP Address:</strong> ${ip}</p>
          <p><strong>New Email:</strong> ${newEmail}</p>
        </div>
        <p style="color:#ef4444;">⚠️ If this was NOT you, change your credentials immediately.</p>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">— Portfolio Security System</p>
      </div>`
    );
    return NextResponse.json({ message: 'Credentials updated. All old sessions invalidated.' });
  } catch (error) {
    console.error('Update credentials error:', error);
    return NextResponse.json({ error: 'Failed to update credentials' }, { status: 500 });
  }
}
