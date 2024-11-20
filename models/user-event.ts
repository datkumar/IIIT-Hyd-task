import { z } from "zod";

const DetailsSchema = z.object({
  item_id: z.number(),
  quantity: z.number(),
  price: z.number(),
});

export const UserEventSchema = z.object({
  user: z.string(),
  timestamp: z.string(),
  ip: z.string(),
  event: z.string(),
  details: DetailsSchema,
});

export type UserEvent = z.infer<typeof UserEventSchema>;
