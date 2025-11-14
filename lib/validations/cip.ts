import { z } from "zod"

export const cipServiceSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  description: z.string().optional(),
  content: z.any().optional(),
  image: z.string().optional(),
  airportId: z.string().optional(), // Keep this for form data
  price: z.number().min(0, "قیمت باید مثبت باشد").optional(),
  currency: z.string().default("IRR"),
  duration: z.string().optional(),
  features: z.array(z.string()).default([]),
  included: z.array(z.string()).default([]),
  notIncluded: z.array(z.string()).default([]),
  priority: z.number().int().min(0).default(0),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  entry: z.boolean().default(false),
  deferent: z.boolean().default(false)
})

export const cipFaqSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1, "سوال الزامی است"),
  answer: z.string().min(1, "پاسخ الزامی است"),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true)
})

export const cipServiceWithFaqsSchema = cipServiceSchema.extend({
  faqs: z.array(cipFaqSchema).optional()
})

export type CipServiceInput = z.infer<typeof cipServiceSchema>
export type CipFaqInput = z.infer<typeof cipFaqSchema>
export type CipServiceWithFaqsInput = z.infer<typeof cipServiceWithFaqsSchema>