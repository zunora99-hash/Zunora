import { z } from "zod";

const existingPasswordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .refine((password) => new TextEncoder().encode(password).byteLength <= 72, "Password must be at most 72 UTF-8 bytes");

const newPasswordSchema = z.string()
  .min(12, "Use at least 12 characters for your new password")
  .max(72, "Password must be at most 72 characters")
  .refine((password) => new TextEncoder().encode(password).byteLength <= 72, "Password must be at most 72 UTF-8 bytes");

export const authSchema = z.object({
  email: z.string().trim().email("Use a valid email address").max(254).transform((email) => email.toLowerCase()),
  password: existingPasswordSchema
});

export const signupSchema = authSchema.extend({
  password: newPasswordSchema,
  name: z.string().trim().min(2, "Name is required").max(100)
});

export const passwordResetSchema = z.object({
  token: z.string().regex(/^[a-f\d]{64}$/i),
  password: newPasswordSchema,
  confirmPassword: z.string().max(72)
}).refine((value) => value.password === value.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10).max(5000)
});

export const addressSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(8).max(30),
  line1: z.string().trim().min(5).max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().min(4).max(20),
  country: z.string().trim().min(2).max(100).default("India"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

export const checkoutSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  address: addressSchema,
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  couponCode: z.string().trim().max(40).optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().int().positive().max(100)
      })
    )
    .min(1)
    .max(25)
});

export const newsletterSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase())
});
