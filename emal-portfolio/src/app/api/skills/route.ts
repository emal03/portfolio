import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL!);

export async function GET() {
  const skills = await sql`SELECT * FROM skills ORDER BY category, display_order, name`;
  return NextResponse.json(skills);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, category, proficiency } = await req.json();
  if (!name || !category) return NextResponse.json({ error: "Name and category required" }, { status: 400 });
  const result = await sql`
    INSERT INTO skills (name, category, proficiency, display_order)
    VALUES (${name}, ${category}, ${Math.min(100, Math.max(0, Number(proficiency) || 0))}, 0)
    RETURNING *
  `;
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await sql`DELETE FROM skills WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, name, category, proficiency } = await req.json();
  await sql`
    UPDATE skills SET name = ${name}, category = ${category},
    proficiency = ${Math.min(100, Math.max(0, Number(proficiency) || 0))}
    WHERE id = ${id}
  `;
  return NextResponse.json({ success: true });
}
