import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL);
async function run() {
  await sql`ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS session_version INTEGER DEFAULT 1`;
  await sql`CREATE TABLE IF NOT EXISTS login_attempts (id SERIAL PRIMARY KEY, ip TEXT, success BOOLEAN DEFAULT false, attempted_at TIMESTAMPTZ DEFAULT NOW())`;
  console.log('✅ Security tables ready!');
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
