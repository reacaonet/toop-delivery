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
  }),
});

export type CreateDeliverymanInput = z.infer<
  typeof createDeliverymanSchema
>["body"];
export type UpdateDeliverymanInput = z.infer<
  typeof updateDeliverymanSchema
>["body"];
