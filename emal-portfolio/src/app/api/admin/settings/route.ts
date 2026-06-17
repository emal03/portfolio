import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL!);

export async function GET() {
  try {
    const rows = await sql`SELECT key, value FROM site_settings`;
    const result: Record<string, unknown> = {};
    rows.forEach(row => {
      try { result[row.key] = JSON.parse(row.value); }
      catch { result[row.key] = row.value; }
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

async function upsertSiteSetting(key: string, value: unknown) {
  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}, NOW())
    ON CONFLICT (key)
    DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
}

async function upsertSetting(key: string, value: string) {
  await sql`
    INSERT INTO settings (key, value)
    VALUES (${key}, ${value})
    ON CONFLICT (key)
    DO UPDATE SET value = EXCLUDED.value
  `;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { profile, about, social } = body;

    if (profile) {
      await upsertSiteSetting("profile", profile);
      // Mirror individual keys to settings table so about page reads them
      if (profile.name)          await upsertSetting("name",          profile.name);
      if (profile.title)         await upsertSetting("title",         profile.title);
      if (profile.email)         await upsertSetting("email",         profile.email);
      if (profile.bio)           await upsertSetting("bio",           profile.bio);
      if (profile.cv_url)        await upsertSetting("cv_url",        profile.cv_url);
      if (profile.availability)  await upsertSetting("availability",  profile.availability);
      if (profile.profile_photo) await upsertSetting("profile_photo", profile.profile_photo);
    }

    if (about) {
      await upsertSiteSetting("about", about);
      if (about.university)      await upsertSetting("university",       about.university);
      if (about.degree)          await upsertSetting("degree",           about.degree);
      if (about.university_years)await upsertSetting("university_years", about.university_years);
      if (about.scholarship)     await upsertSetting("scholarship",      about.scholarship);
    }

    if (social) {
      await upsertSiteSetting("social", social);
      if (social.github)   await upsertSetting("github",   social.github);
      if (social.linkedin) await upsertSetting("linkedin", social.linkedin);
      if (social.twitter)  await upsertSetting("twitter",  social.twitter);
    }

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("POST settings error:", error);
    return NextResponse.json({ error: "Failed to save: " + msg }, { status: 500 });
  }
}
