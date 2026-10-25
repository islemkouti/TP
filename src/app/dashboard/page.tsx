import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, role: true, createdAt: true },
  });
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-md space-y-3 pt-24">
      <h1 className="text-2xl font-bold">Bonjour {user.name} !</h1>
      <p>Email : {user.email}</p>
      <p>
        Membre depuis le{" "}
        {user.createdAt.toLocaleDateString("fr-FR")}
      </p>
        <p>
          Rôle : <strong>{user.role}</strong>
          </p>
          <p>
            <Link href="/students" className="underline">
            {user.role === "ETUDIANT" ? "Mon profil" : "Gérer les étudiants"}
            </Link>
          </p>
      <LogoutButton />
    </main>
  );
}