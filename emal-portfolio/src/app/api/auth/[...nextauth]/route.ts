import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';
import { sendEmail } from '@/lib/email';

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL!);

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip = (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0] || 'unknown';

        // Rate limit: block after 5 failed attempts in 15 minutes
        try {
          const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
          const rows = await sql`
            SELECT COUNT(*) AS count FROM login_attempts
            WHERE ip = ${ip} AND success = false AND attempted_at > ${cutoff}
          `;
          if (parseInt(String(rows[0].count)) >= 5) {
            throw new Error('TOO_MANY_ATTEMPTS');
          }
        } catch (e: unknown) {
          if (e instanceof Error && e.message === 'TOO_MANY_ATTEMPTS') throw e;
        }

        // Query admin from database
        try {
          const admins = await sql`
            SELECT * FROM admin_users WHERE email = ${credentials.email} LIMIT 1
          `;

          if (!admins.length) {
            await sql`INSERT INTO login_attempts (ip, success) VALUES (${ip}, false)`;
            return null;
          }

          const user = admins[0];
          const isValid = await bcrypt.compare(credentials.password, user.password_hash as string);

          if (!isValid) {
            await sql`INSERT INTO login_attempts (ip, success) VALUES (${ip}, false)`;
            return null;
          }

          // Successful login — record it
          await sql`INSERT INTO login_attempts (ip, success) VALUES (${ip}, true)`;

          // Send login notification email (non-blocking)
          const now = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Karachi',
            dateStyle: 'full',
            timeStyle: 'long',
          });
          const ua = (req?.headers?.['user-agent'] as string) || 'Unknown Browser';

          sendEmail(
            'emalkamawal01@gmail.com',
            '🔐 New Admin Login — Portfolio',
            `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;
                         background:#0a0f1e;color:#f1f5f9;padding:32px;border-radius:12px;">
              <h2 style="color:#3b82f6;">🔐 New Admin Login Detected</h2>
              <p>Someone just logged into your portfolio admin panel.</p>
              <div style="background:#111827;padding:16px;border-radius:8px;
                          border-left:4px solid #06b6d4;margin:20px 0;">
                <p><strong>🕐 Time:</strong> ${now}</p>
                <p><strong>🌐 IP Address:</strong> ${ip}</p>
                <p><strong>💻 Browser:</strong> ${ua}</p>
              </div>
              <p>If this was you, no action needed.</p>
              <p style="color:#ef4444;">⚠️ If this was NOT you,
                <a href="https://emal03-portfolio.vercel.app/admin/settings"
                   style="color:#3b82f6;">change your password immediately</a>.
              </p>
              <p style="color:#94a3b8;font-size:12px;margin-top:24px;">
                — Portfolio Security System
              </p>
            </div>`
          ).catch(console.error);

          return {
            id: String(user.id),
            email: user.email as string,
            name: 'Admin',
          };

        } catch (error: unknown) {
          if (error instanceof Error && error.message === 'TOO_MANY_ATTEMPTS') throw error;
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session?.user) (session.user as { id?: string }).id = token.id as string;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
