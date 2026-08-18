import { z } from "zod";

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    cnpj: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Email inválido").optional(),
    category: z.string().optional(),
  }),
});

export const updateCompanySchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    cnpj: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Email inválido").optional(),
    category: z.string().optional(),
    active: z.boolean().optional(),
  }),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>["body"];
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>["body"];
