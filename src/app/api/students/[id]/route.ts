import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { updateStudentSchema } from "@/lib/validation";
import { studentSelect, parseId } from "@/lib/students";

type Ctx = { params: Promise<{ id: string }> };

const TEACHER_FIELDS = ["filiere", "niveau", "moyenne"];

export async function GET(_req: Request, { params }: Ctx) {
  const auth = await requireRole(["ADMIN", "ENSEIGNANT", "ETUDIANT"]);
  if (!auth.ok) return auth.response;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

  // Protection IDOR : un étudiant ne lit que son propre profil
  if (auth.user.role === "ETUDIANT" && auth.user.id !== id) {
    return NextResponse.json({ error: "Accès interdit à ce profil" }, { status: 403 });
  }

  const student = await prisma.user.findFirst({
    where: { id, role: "ETUDIANT" },
    select: studentSelect,
  });
  if (!student) return NextResponse.json({ error: "Étudiant introuvable" }, { status: 404 });
  return NextResponse.json(student);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await requireRole(["ADMIN", "ENSEIGNANT"]);
  if (!auth.ok) return auth.response;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  // L'enseignant ne peut modifier que les champs pédagogiques
  if (auth.user.role === "ENSEIGNANT") {
    const forbidden = Object.keys(body).filter((k) => !TEACHER_FIELDS.includes(k));
    if (forbidden.length > 0) {
      return NextResponse.json(
        { error: `Champs interdits pour un enseignant : ${forbidden.join(", ")}` },
        { status: 403 }
      );
    }
  }

  const parsed = updateStudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Aucune donnée à modifier" }, { status: 400 });
  }

  const target = await prisma.user.findFirst({
    where: { id, role: "ETUDIANT" },
    select: { id: true },
  });
  if (!target) return NextResponse.json({ error: "Étudiant introuvable" }, { status: 404 });

  if (parsed.data.email) {
    const taken = await prisma.user.findFirst({
      where: { email: parsed.data.email, NOT: { id } },
      select: { id: true },
    });
    if (taken) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: studentSelect,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

  const target = await prisma.user.findFirst({
    where: { id, role: "ETUDIANT" },
    select: { id: true },
  });
  if (!target) return NextResponse.json({ error: "Étudiant introuvable" }, { status: 404 });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}