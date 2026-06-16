import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL);

async function fixAdmin() {
  // Check current admin
  console.log('📋 Checking admin_users table...');
  const admins = await sql`SELECT id, email FROM admin_users`;
  console.log('Current admins:', admins);

  // Hash the password fresh
  const hash = await bcrypt.hash('Emal@Portfolio2025!', 10);
  console.log('✅ New hash generated');

  // Update or insert admin
  if (admins.length > 0) {
    await sql`
      UPDATE admin_users 
      SET email = 'emalkamawal01@gmail.com',
          password_hash = ${hash}
      WHERE id = ${admins[0].id}
    `;
    console.log('✅ Admin updated!');
  } else {
    await sql`
      INSERT INTO admin_users (email, password_hash)
      VALUES ('emalkamawal01@gmail.com', ${hash})
    `;
    console.log('✅ Admin created!');
  }

  // Verify
  const updated = await sql`SELECT id, email FROM admin_users`;
  console.log('✅ Final admin:', updated);
  process.exit(0);
}

fixAdmin().catch(e => { console.error('❌ Error:', e); process.exit(1); });
