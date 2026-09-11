import { z } from "zod";
export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  nativeLanguage: z.string().trim().max(60).optional(),
  englishLevel: z
    .enum([
      "Beginner",
      "Elementary",
      "Intermediate",
      "Upper Intermediate",
      "Advanced",
    ])
    .optional(),
  learningGoal: z.string().trim().max(100).optional(),
  dailyGoalMinutes: z.coerce.number().int().min(5).max(120).optional(),
  timezone: z.string().trim().max(80).optional(),
  onboardingCompleted: z.boolean().optional(),
});
export const preferenceSchema = z.object({
  correctionFrequency: z.enum(["gentle", "balanced", "detailed"]).optional(),
  aiDifficulty: z.enum(["adaptive", "easier", "challenging"]).optional(),
});
export const vocabularySchema = z.object({
  word: z.string().trim().min(1).max(80),
  meaning: z.string().trim().min(1).max(300),
  example: z.string().trim().max(500).optional().default(""),
});
