import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token é obrigatório"),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().optional(),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  }),
});

export const registerDeliverymanSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(1, "Telefone é obrigatório"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    vehicleType: z.enum(["bike", "motorcycle", "car", "van", "taxi"]).default("motorcycle"),
    vehicleBrand: z.string().optional(),
    vehicleModel: z.string().optional(),
    vehicleYear: z.coerce.number().int().min(1900, "Ano inválido").max(2100, "Ano inválido").optional(),
    cpf: z.string().optional(),
    cnh: z.string().optional(),
    vehiclePlate: z.string().optional(),
  }),
});

export const registerStoreSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().optional(),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    cnpj: z.string().optional(),
    category: z.string().optional(),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>["body"];
export type RefreshInput = z.infer<typeof refreshSchema>["body"];
export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type RegisterDeliverymanInput = z.infer<typeof registerDeliverymanSchema>["body"];
export type RegisterStoreInput = z.infer<typeof registerStoreSchema>["body"];
