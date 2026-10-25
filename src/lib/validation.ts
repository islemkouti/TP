import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nom : 2 caractères minimum"),
  email: z.string().trim().toLowerCase().email("Email invalide"),
  password: z.string().min(8, "Mot de passe : 8 caractères minimum"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});
const pedagogique = {
  filiere: z.string().trim().min(1).max(100).optional(),
  niveau: z.string().trim().min(1).max(50).optional(),
  moyenne: z
    .number()
    .min(0, "Moyenne : entre 0 et 20")
    .max(20, "Moyenne : entre 0 et 20")
    .optional(),
};

export const createStudentSchema = registerSchema.extend(pedagogique);

export const updateStudentSchema = z.object({
  name: registerSchema.shape.name.optional(),
  email: registerSchema.shape.email.optional(),
  ...pedagogique,
});