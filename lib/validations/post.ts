import { z } from "zod"

export const createPostSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  excerpt: z.string().min(1, "خلاصه الزامی است"),
  content: z.string().min(1, "محتوا الزامی است"),
  coverImage: z.string().url("تصویر کاور نامعتبر است"),
  category: z.string().min(1, "دسته‌بندی الزامی است"),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
})

export const updatePostSchema = createPostSchema.partial()
