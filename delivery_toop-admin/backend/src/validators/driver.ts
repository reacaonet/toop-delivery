import { z } from "zod";

const vehicleTypeEnum = z.enum(["bike", "motorcycle", "car", "van"]);
const serviceCategoryEnum = z.enum(["driver", "delivery", "package"]);

export const createDriverSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(1, "Telefone é obrigatório"),
    vehicleType: vehicleTypeEnum.optional(),
    vehiclePlate: z.string().optional(),
    serviceCategories: z.array(serviceCategoryEnum).optional(),
    cpf: z.string().optional(),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional(),
    company: z.string().optional(),
  }),
});

export const updateDriverSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email("Email inválido").optional(),
    phone: z.string().optional(),
    vehicleType: vehicleTypeEnum.optional(),
    vehiclePlate: z.string().optional(),
    serviceCategories: z.array(serviceCategoryEnum).optional(),
    active: z.boolean().optional(),
    cpf: z.string().optional(),
    avatar: z.string().optional(),
    documents: z.object({
      cnh: z.string().optional(),
      vehicleDocument: z.string().optional(),
      photo: z.string().optional(),
    }).optional(),
    documentStatus: z.object({
      cnh: z.enum(['pending', 'approved', 'rejected']).optional(),
      vehicleDocument: z.enum(['pending', 'approved', 'rejected']).optional(),
      photo: z.enum(['pending', 'approved', 'rejected']).optional(),
    }).optional(),
  }),
});

export const updateLocationSchema = z.object({
  body: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    heading: z.number().min(0).max(360).optional(),
    speed: z.number().min(0).optional(),
  }),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>["body"];
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>["body"];
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>["body"];
