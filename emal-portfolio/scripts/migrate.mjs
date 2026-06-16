// scripts/migrate.mjs
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 
                     process.env.NEXT_PUBLIC_DATABASE_URL || 
                     'postgresql://neondb_owner:npg_ZnyN9UgA5bat@ep-withered-grass-a1nvd4mg-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function runMigration() {
  console.log('🔌 Connecting to Neon PostgreSQL...');
  try {
    const res = await sql`SELECT version()`;
    console.log('✅ Connected. Server Version:', res[0].version.split(',')[0]);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }

  console.log('📦 Executing database migrations...');

  try {
    // 1. Settings Table
    console.log('🔧 Creating settings table...');
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Insert default settings
    console.log('📥 Inserting default settings...');
    await sql`
      INSERT INTO settings (key, value) VALUES
      ('name', 'Emal Kamawal'),
      ('title', 'Data Scientist & ML Researcher'),
      ('subtitle', 'Specializing in Machine Learning, Computer Vision, and Medical Data Analysis — transforming raw data into actionable knowledge.'),
      ('email', 'emalkamawal01@gmail.com'),
      ('github', 'https://github.com/emal03'),
      ('linkedin', 'https://www.linkedin.com/in/emal-kamawal-804340251/'),
      ('twitter', ''),
      ('bio', 'I am a passionate computer scientist focused on Machine Learning, Data Science, Computer Vision, and Medical Data Analysis. I work at the intersection of data and biology — turning complex raw datasets into meaningful information and knowledge that drives real-world decisions.'),
      ('university', 'Pak-Austria Fachhochschule (PAF-IAST)'),
      ('degree', 'Bachelor of Science in Computer Science'),
      ('university_years', '2022 - 2026'),
      ('scholarship', 'HEC Scholar — Allama Iqbal Open Scholarship'),
      ('stats_projects', '10+'),
      ('stats_publications', '3+'),
      ('stats_opensource', '5+'),
      ('stats_experience', '2+'),
      ('cv_url', '/cv.pdf'),
      ('availability', 'Available for Collaboration'),
      ('canonical_url', 'https://emal03-portfolio.vercel.app'),
      ('meta_description', 'Portfolio of Emal Kamawal — Data Scientist and ML Researcher specializing in Machine Learning, Computer Vision, and Medical Data Analysis.')
      ON CONFLICT (key) DO NOTHING;
    `;

    // 2. Projects Table
    console.log('📁 Rebuilding projects table...');
    await sql`DROP TABLE IF EXISTS projects CASCADE;`;
    await sql`
      CREATE TABLE projects (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        detailed_description TEXT,
        github_url TEXT,
        is_gated BOOLEAN DEFAULT false,
        is_featured BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'public' CHECK (status IN ('public','gated','private')),
        tags TEXT[] DEFAULT '{}',
        tech_stack TEXT[] DEFAULT '{}',
        media JSONB DEFAULT '[]',
        thumbnail_url TEXT,
        demo_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 3. Project Media Table
    console.log('🎥 Creating project_media table...');
    await sql`
      CREATE TABLE IF NOT EXISTS project_media (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        type TEXT CHECK (type IN ('image','video')),
        caption TEXT,
        display_order INTEGER DEFAULT 0
      );
    `;

    // 4. Code Requests Table
    console.log('🔒 Creating code_requests table...');
    await sql`
      CREATE TABLE IF NOT EXISTS code_requests (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        requester_name TEXT NOT NULL,
        requester_email TEXT NOT NULL,
        requester_institution TEXT,
        purpose TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 5. Publications Table
    console.log('📚 Rebuilding publications table...');
    await sql`DROP TABLE IF EXISTS publications CASCADE;`;
    await sql`
      CREATE TABLE publications (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        authors TEXT NOT NULL,
        journal_or_conference TEXT,
        year INTEGER,
        doi TEXT,
        abstract TEXT,
        pdf_url TEXT,
        status TEXT DEFAULT 'published' CHECK (status IN ('published','under_review','submitted')),
        citation_count INTEGER DEFAULT 0,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 6. Experience Table
    console.log('💼 Rebuilding experience table...');
    await sql`DROP TABLE IF EXISTS experience CASCADE;`;
    await sql`
      CREATE TABLE experience (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        organization TEXT NOT NULL,
        location TEXT,
        type TEXT DEFAULT 'work' CHECK (type IN ('work','internship','research','volunteer')),
        start_date DATE NOT NULL,
        end_date DATE,
        is_current BOOLEAN DEFAULT false,
        description TEXT,
        skills TEXT[] DEFAULT '{}',
        logo_url TEXT,
        display_order INTEGER DEFAULT 0
      );
    `;

    // 7. Certifications Table
    console.log('🏅 Rebuilding certifications table...');
    await sql`DROP TABLE IF EXISTS certifications CASCADE;`;
    await sql`
      CREATE TABLE certifications (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        issuer TEXT NOT NULL,
        year INTEGER,
        credential_url TEXT,
        image_url TEXT,
        description TEXT,
        display_order INTEGER DEFAULT 0
      );
    `;

    // 8. Skills Table
    console.log('⚙️ Creating skills table...');
    await sql`
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        proficiency INTEGER CHECK (proficiency BETWEEN 1 AND 100),
        display_order INTEGER DEFAULT 0
      );
    `;

    // 9. Blog Posts Table
    console.log('📝 Creating blog_posts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT,
        excerpt TEXT,
        thumbnail_url TEXT,
        tags TEXT[] DEFAULT '{}',
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 10. Messages Table
    console.log('💬 Creating messages table...');
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Create Admin table if it doesn't exist (needed for auth)
    console.log('🔑 Ensuring admin_users table exists...');
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL DEFAULT 'Admin',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Seed admin if none exists
    const adminExists = await sql`SELECT id FROM admin_users LIMIT 1`;
    if (adminExists.length === 0) {
      console.log('👤 Seeding default admin user...');
      const defaultHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyPIjDlWGR6aLZ7FkV0qJXsH3fE3zQ3Kdi'; // password: 'admin'
      await sql`
        INSERT INTO admin_users (email, password_hash, name)
        VALUES ('admin@example.com', ${defaultHash}, 'Admin User')
        ON CONFLICT DO NOTHING;
      `;
    }

    console.log('🎉 Migrations successfully completed!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

runMigration();
