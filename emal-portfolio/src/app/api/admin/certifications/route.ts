import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL!);

export async function GET() {
  const rows = await sql`SELECT * FROM certifications ORDER BY display_order ASC, year DESC`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, issuer, description, image_url, credential_url, year } = await req.json();
  if (!title || !issuer) return NextResponse.json({ error: "Title and issuer required" }, { status: 400 });
  const result = await sql`
    INSERT INTO certifications (title, issuer, description, image_url, credential_url, year, display_order)
    VALUES (${title}, ${issuer}, ${description||null}, ${image_url||null}, ${credential_url||null}, ${year||null}, 0)
    RETURNING *
  `;
  return NextResponse.json({ success: true, data: result[0] });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, title, issuer, description, image_url, credential_url, year } = await req.json();
  await sql`
    UPDATE certifications SET title=${title}, issuer=${issuer}, description=${description||null},
    image_url=${image_url||null}, credential_url=${credential_url||null}, year=${year||null}
    WHERE id=${id}
  `;
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await sql`DELETE FROM certifications WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
