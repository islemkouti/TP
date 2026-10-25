import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import StudentsManager from "@/components/StudentsManager";

export default async function StudentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-6 pt-12">
      <Link href="/dashboard" className="underline">
        ← Tableau de bord
      </Link>
      <h1 className="text-2xl font-bold">Étudiants</h1>
      <StudentsManager role={user.role} />
    </main>
  );
}