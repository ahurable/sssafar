import { z } from "zod"

export const cipServiceSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  description: z.string().optional(),
  content: z.any().optional(),
  image: z.string().optional(),
  airport: z.string().min(1, "فرودگاه الزامی است"),
  price: z.number().min(0, "قیمت باید مثبت باشد").optional(),
  currency: z.string().default("IRR"),
  duration: z.string().optional(),
  features: z.array(z.string()).default([]),
  included: z.array(z.string()).default([]),
  notIncluded: z.array(z.string()).default([]),
  priority: z.number().int().min(0).default(0),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
})

export type CipServiceInput = z.infer<typeof cipServiceSchema>