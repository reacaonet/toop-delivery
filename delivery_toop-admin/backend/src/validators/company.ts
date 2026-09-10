import { z } from "zod";

const addressSchema = z
  .object({
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  })
  .optional();

const emailSchema = z.union([z.string().trim().email("Email inválido"), z.literal("")]);

const openingHoursSchema = z
  .record(z.string(), z.object({ open: z.string(), close: z.string() }))
  .optional();

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    cnpj: z.string().optional(),
    phone: z.string().optional(),
    email: emailSchema.optional(),
    category: z.string().optional(),
    address: addressSchema,
    active: z.boolean().optional(),
    status: z.boolean().optional(),
  }),
});

export const updateCompanySchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    cnpj: z.string().optional(),
    phone: z.string().optional(),
    email: emailSchema.optional(),
    category: z.string().optional(),
    address: addressSchema,
    active: z.boolean().optional(),
    status: z.boolean().optional(),
    description: z.string().optional(),
    logo: z.string().optional(),
    deliveryFee: z.number().optional(),
    minimumOrder: z.number().optional(),
    estimatedDeliveryTime: z.number().optional(),
    preparationTime: z.number().optional(),
    openingHours: openingHoursSchema,
  }),
});

export const addCompanyAdminSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  }),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>["body"];
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>["body"];
export type AddCompanyAdminInput = z.infer<typeof addCompanyAdminSchema>["body"];