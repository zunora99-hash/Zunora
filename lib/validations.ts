import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Use a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const signupSchema = authSchema.extend({
  name: z.string().min(2, "Name is required")
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(3),
  message: z.string().min(10)
});

export const addressSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  line1: z.string().min(5),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().default("India"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

export const checkoutSchema = z.object({
  email: z.string().email(),
  address: addressSchema,
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().int().positive()
      })
    )
    .min(1)
});
