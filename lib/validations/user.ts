import { z } from "zod"

export const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  nationalId: z
    .string()
    .regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد")
    .optional(),
  address: z.string().optional(),
  postalCode: z
    .string()
    .regex(/^\d{10}$/, "کد پستی باید ۱۰ رقم باشد")
    .optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  dateOfBirth: z.string().optional(),
})
