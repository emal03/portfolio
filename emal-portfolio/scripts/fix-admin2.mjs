import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL);

async function fixAdmin() {
  // Generate fresh hash
  const hash = await bcrypt.hash('Emal@Portfolio2025!', 10);
  console.log('✅ Hash generated');

  // Update the correct admin (emalkamawal01@gmail.com)
  await sql`
    UPDATE admin_users 
    SET password_hash = ${hash},
        session_version = 1
    WHERE email = 'emalkamawal01@gmail.com'
  `;
  console.log('✅ Password updated for emalkamawal01@gmail.com');

  // Delete the old default admin
  await sql`
    DELETE FROM admin_users 
    WHERE email = 'admin@example.com'
  `;
  console.log('✅ Old admin@example.com deleted');

  // Verify final state
  const admins = await sql`SELECT id, email FROM admin_users`;
  console.log('✅ Final admin accounts:', admins);
  process.exit(0);
}

fixAdmin().catch(e => { console.error('❌ Error:', e); process.exit(1); });
