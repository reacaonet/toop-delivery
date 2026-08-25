import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    serviceCategory: z.enum(["driver", "delivery", "package"]),
    pickup: z.object({
      address: z.string().min(1, "Endereço de origem é obrigatório"),
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      complement: z.string().optional(),
    }),
    dropoff: z.object({
      address: z.string().min(1, "Endereço de destino é obrigatório"),
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      complement: z.string().optional(),
    }),
    paymentMethod: z.string().min(1, "Forma de pagamento é obrigatória"),
    notes: z.string().optional(),
  }),
});

export const cancelBookingSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
    cancelledBy: z.enum(["client", "driver", "system"]).optional(),
  }),
});

export const rateBookingSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
    ratingType: z.enum(["client", "driver"]).optional(),
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>["body"];
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>["body"];
export type RateBookingInput = z.infer<typeof rateBookingSchema>["body"];
