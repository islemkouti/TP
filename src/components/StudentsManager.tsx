"use client";
import { useCallback, useEffect, useState } from "react";

type Role = "ADMIN" | "ENSEIGNANT" | "ETUDIANT";
type Student = {
  id: number;
  name: string;
  email: string;
  filiere: string | null;
  niveau: string | null;
  moyenne: number | null;
};

// Transforme un formulaire en objet JSON (champs vides ignorés)
function toBody(form: HTMLFormElement) {
  const body: Record<string, unknown> = {};
  for (const [k, v] of new FormData(form)) {
    const s = String(v).trim();
    if (s === "") continue;
    body[k] = k === "moyenne" ? Number(s) : s;
  }
  return body;
}

export default function StudentsManager({ role }: { role: Role }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Student | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/students");
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(`Erreur ${res.status} : ${data?.error ?? "inconnue"}`);
      return;
    }
    setStudents(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function call(url: string, method: string, body?: unknown) {
    setError("");
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(`Erreur ${res.status} : ${data.error ?? "inconnue"}`);
      return false;
    }
    await load();
    return true;
  }

  const cls = "rounded border p-2";
  const canEdit = role === "ADMIN" || role === "ENSEIGNANT";

  return (
    <div className="space-y-6">
      {error && <p className="rounded bg-red-100 p-3 text-red-700">{error}</p>}

      {role === "ADMIN" && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = e.currentTarget;
            if (await call("/api/students", "POST", toBody(f))) f.reset();
          }}
          className="grid gap-2 sm:grid-cols-3"
        >
          <input name="name" placeholder="Nom" required className={cls} />
          <input name="email" type="email" placeholder="Email" required className={cls} />
          <input name="password" type="password" placeholder="Mot de passe" required className={cls} />
          <input name="filiere" placeholder="Filière" className={cls} />
          <input name="niveau" placeholder="Niveau" className={cls} />
          <input name="moyenne" type="number" step="0.01" min="0" max="20" placeholder="Moyenne" className={cls} />
          <button className="rounded bg-gray-800 p-2 text-white sm:col-span-3">
            Créer un étudiant
          </button>
        </form>
      )}

      {editing && (
        <form
          key={editing.id}
          onSubmit={async (e) => {
            e.preventDefault();
            if (await call(`/api/students/${editing.id}`, "PATCH", toBody(e.currentTarget))) {
              setEditing(null);
            }
          }}
          className="grid gap-2 rounded border p-3 sm:grid-cols-3"
        >
          <p className="font-semibold sm:col-span-3">Modifier : {editing.name}</p>
          {/* Les champs désactivés ne sont pas envoyés : l'enseignant n'envoie que le pédagogique */}
          <input name="name" defaultValue={editing.name} disabled={role !== "ADMIN"} className={cls} />
          <input name="email" type="email" defaultValue={editing.email} disabled={role !== "ADMIN"} className={cls} />
          <span />
          <input name="filiere" defaultValue={editing.filiere ?? ""} placeholder="Filière" className={cls} />
          <input name="niveau" defaultValue={editing.niveau ?? ""} placeholder="Niveau" className={cls} />
          <input name="moyenne" type="number" step="0.01" min="0" max="20" defaultValue={editing.moyenne ?? ""} placeholder="Moyenne" className={cls} />
          <div className="flex gap-2 sm:col-span-3">
            <button className="rounded bg-gray-800 px-3 py-2 text-white">Enregistrer</button>
            <button type="button" onClick={() => setEditing(null)} className="rounded border px-3 py-2">
              Annuler
            </button>
          </div>
        </form>
      )}

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b">
            <th className="p-2">Nom</th>
            <th className="p-2">Email</th>
            <th className="p-2">Filière</th>
            <th className="p-2">Niveau</th>
            <th className="p-2">Moyenne</th>
            {canEdit && <th className="p-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="border-b">
              <td className="p-2">{s.name}</td>
              <td className="p-2">{s.email}</td>
              <td className="p-2">{s.filiere ?? "-"}</td>
              <td className="p-2">{s.niveau ?? "-"}</td>
              <td className="p-2">{s.moyenne ?? "-"}</td>
              {canEdit && (
                <td className="flex gap-2 p-2">
                  <button onClick={() => setEditing(s)} className="underline">
                    Modifier
                  </button>
                  {role === "ADMIN" && (
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer ${s.name} ?`)) {
                          call(`/api/students/${s.id}`, "DELETE");
                        }
                      }}
                      className="text-red-600 underline"
                    >
                      Supprimer
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}