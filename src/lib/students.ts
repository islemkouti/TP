export const studentSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  filiere: true,
  niveau: true,
  moyenne: true,
  createdAt: true,
} as const;

export function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}