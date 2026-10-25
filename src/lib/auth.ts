import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { Role } from "@/generated/prisma/enums";

export type AuthUser = { id: number; name: string; email: string; role: Role };

type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; response: NextResponse };

export async function requireRole(allowed: Role[]): Promise<AuthResult> {
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Non authentifié" }, { status: 401 }),
    };
  }

  // Le rôle vient toujours de la base, jamais du navigateur
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Non authentifié" }, { status: 401 }),
    };
  }

  if (!allowed.includes(user.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Accès interdit" }, { status: 403 }),
    };
  }
  return { ok: true, user };
}