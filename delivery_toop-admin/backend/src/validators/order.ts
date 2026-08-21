import { z } from "zod";

const orderStatusEnum = z.enum([
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivering",
  "delivered",
  "cancelled",
]);

const orderItemSchema = z.object({
  name: z.string().min(1, "Nome do item é obrigatório"),
  quantity: z.number().int().positive("Quantidade deve ser positiva"),
  price: z.number().positive("Preço deve ser positivo"),
  total: z.number().positive("Total do item deve ser positivo"),
});

export const createOrderSchema = z.object({
  body: z.object({
    company: z.string().min(1, "Empresa é obrigatória"),
    customer: z.string().min(1, "Cliente é obrigatório"),
    items: z
      .array(orderItemSchema)
      .min(1, "Pelo menos um item é obrigatório"),
    subtotal: z.number().positive("Subtotal deve ser positivo"),
    total: z.number().positive("Total deve ser positivo"),
    paymentMethod: z.string().min(1, "Método de pagamento é obrigatório"),
    deliveryAddress: z.object({
      street: z.string().optional(),
      number: z.string().optional(),
      complement: z.string().optional(),
      neighborhood: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    }),
    notes: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: orderStatusEnum,
    deliverymanId: z.string().optional(),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>["body"];
export type UpdateOrderStatusInput = z.infer<
  typeof updateOrderStatusSchema
>["body"];
