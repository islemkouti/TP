import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { createStudentSchema } from "@/lib/validation";
import { studentSelect } from "@/lib/students";

export async function GET() {
  const auth = await requireRole(["ADMIN", "ENSEIGNANT", "ETUDIANT"]);
  if (!auth.ok) return auth.response;
  const { user } = auth;

  // Un étudiant ne voit que sa propre ligne
  const where =
    user.role === "ETUDIANT" ? { id: user.id } : { role: "ETUDIANT" as const };

  const students = await prisma.user.findMany({
    where,
    select: studentSelect,
    orderBy: { id: "asc" },
  });
  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = createStudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }
  const { password, ...data } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return NextResponse.json(
      { error: "Cet email est déjà utilisé" },
      { status: 409 }
    );
  }

  const student = await prisma.user.create({
    data: { ...data, password: await bcrypt.hash(password, 10), role: "ETUDIANT" },
    select: studentSelect,
  });
  return NextResponse.json(student, { status: 201 });
}