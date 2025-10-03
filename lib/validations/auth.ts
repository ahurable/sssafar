import { z } from "zod"

export const signUpSchema = z
  .object({
    email: z.string().email("ایمیل نامعتبر است").optional().or(z.literal("")),
    phone: z
      .string()
      .regex(/^09\d{9}$/, "شماره موبایل نامعتبر است")
      .optional()
      .or(z.literal("")),
    password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.email || data.phone, {
    message: "ایمیل یا شماره موبایل الزامی است",
    path: ["email"],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن مطابقت ندارند",
    path: ["confirmPassword"],
  })

export const signInSchema = z.object({
  identifier: z.string().min(1, "ایمیل یا شماره موبایل الزامی است"),
  password: z.string().min(1, "رمز عبور الزامی است"),
})

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "ایمیل یا شماره موبایل الزامی است"),
})

export const resetPasswordSchema = z
  .object({
    token: z.string(),
    password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن مطابقت ندارند",
    path: ["confirmPassword"],
  })
