import { z } from "zod";

const roleEnum = z.enum(["admin", "manager", "operator"]);

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    phone: z.string().optional(),
    role: roleEnum.optional(),
    company: z.string().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email("Email inválido").optional(),
    password: z.string().min(6).optional(),
    phone: z.string().optional(),
    role: roleEnum.optional(),
    active: z.boolean().optional(),
    company: z.string().optional(),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>["body"];
export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"];
