import { z } from "zod";
const password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/\d/, "Password must include a number.");
export const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(80),
  email: z.string().trim().email("Enter a valid email.").max(254),
  password,
});
export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});
export const tokenSchema = z.object({
  token: z.string().length(64, "The token is invalid."),
});
export const emailSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
});
export const resetSchema = tokenSchema.extend({ password });
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
});
