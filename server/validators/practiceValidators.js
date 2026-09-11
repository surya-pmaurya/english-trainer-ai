import { z } from "zod";
const sessionType = z.enum([
  "conversation",
  "speaking",
  "grammar",
  "vocabulary",
  "interview",
  "travel",
  "workplace",
]);
export const startSchema = z.object({
  type: sessionType,
  topic: z.string().trim().max(100).optional().default(""),
});
export const messageSchema = z.object({
  sessionId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid session."),
  content: z
    .string()
    .trim()
    .min(1, "Write a message before sending.")
    .max(4000, "Please keep messages under 4,000 characters."),
});
export const completeSchema = z.object({
  sessionId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid session."),
});
