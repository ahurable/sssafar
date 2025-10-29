import { z } from "zod"

export const travelerSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  nationalId: z
    .string()
    .regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد"),
  dateOfBirth: z.string(),
  passportNumber: z.string(),
  passportExpiry: z.string()
})

export const travelersSchema = z.object(
  {
    children: z.array(z.object({
    firstName: z.string(),
    lastName: z.string(),
    nationalId: z
      .string()
      .regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد"),
    dateOfBirth: z.string(),
    passportNumber: z.string(),
    passportExpiry: z.string()
  }))
})
