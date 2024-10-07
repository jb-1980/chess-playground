import { z } from "zod"

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  rating: z.number().default(1200),
  avatarUrl: z.string().nullish(),
})

export type User = z.infer<typeof userSchema>
