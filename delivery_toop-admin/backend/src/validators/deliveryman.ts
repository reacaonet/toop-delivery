import { z } from "zod";

const vehicleTypeEnum = z.enum(["bike", "motorcycle", "car", "van"]);

export const createDeliverymanSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(1, "Telefone é obrigatório"),
    vehicleType: vehicleTypeEnum.optional(),
  }),
});

export const updateDeliverymanSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email("Email inválido").optional(),
    phone: z.string().optional(),
    vehicleType: vehicleTypeEnum.optional(),
    active: z.boolean().optional(),
    cpf: z.string().optional(),
    cnh: z.string().optional(),
    vehiclePlate: z.string().optional(),
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

export type CreateDeliverymanInput = z.infer<
  typeof createDeliverymanSchema
>["body"];
export type UpdateDeliverymanInput = z.infer<
  typeof updateDeliverymanSchema
>["body"];
