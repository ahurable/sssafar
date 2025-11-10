import { z } from "zod"

export const createPostSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  excerpt: z.string().min(1, "خلاصه الزامی است"),
  content: z.string().min(1, "محتوا الزامی است"),
  coverImage: z.string().min(1, "تصویر کاور الزامی است"),
  images: z.array(z.string()).default([]),
  category: z.string().min(1, "دسته‌بندی الزامی است"),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  tables: z.array(z.object({
    title: z.string(),
    content: z.string(),
  })).default([]),
  readingTime: z.number().int().min(0).default(0),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  canonicalUrl: z.string().url("آدرس کانونیکال معتبر نیست").optional().or(z.literal("")),
})