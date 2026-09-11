import { z } from "zod";
import { env } from "../config/env.js";

const responseSchema = z.object({
  reply: z.string().min(1).max(1600),
  correction: z
    .object({
      original: z.string().max(1000),
      corrected: z.string().max(1000),
      explanation: z.string().max(600),
      category: z.string().max(50).optional(),
    })
    .nullable()
    .optional(),
  vocabulary: z
    .array(
      z.object({
        word: z.string().max(80),
        meaning: z.string().max(300),
        example: z.string().max(500),
        level: z.string().max(40).optional(),
        category: z.string().max(50).optional(),
      }),
    )
    .max(3)
    .default([]),
  scores: z
    .object({
      grammar: z.number().min(0).max(100).optional(),
      vocabulary: z.number().min(0).max(100).optional(),
      fluency: z.number().min(0).max(100).optional(),
    })
    .default({}),
});
const FALLBACK = {
  reply:
    "Thanks for sharing that. I’m having trouble reaching the feedback service right now, but we can keep practising when it is available.",
  correction: null,
  vocabulary: [],
  scores: {},
};

function tutorPrompt({ user, type, messages, weaknesses }) {
  return `You are English Trainer AI, a friendly, encouraging personal English teacher. Your purpose is helping this learner improve—not generic chatting.\n\nLearner context:\n- English level: ${user.englishLevel}\n- Goal: ${user.learningGoal}\n- Correction preference: ${user.preferences?.correctionFrequency || "balanced"}\n- Current practice: ${type}\n- Repeated weaknesses: ${weaknesses.length ? weaknesses.join(", ") : "none identified yet"}\n\nGive a natural conversational reply first. Correct only meaningful errors; do not invent a correction for valid English. Keep explanations short, clear and suitable for the learner’s level. You may suggest up to 3 genuinely useful words. Score only the learner’s latest message on grammar, vocabulary and fluency if you can fairly assess it. Never claim pronunciation analysis.\n\nReturn JSON only with this exact shape:\n{"reply":"string","correction":null|{"original":"string","corrected":"string","explanation":"string","category":"Tense|Articles|Prepositions|Word choice|Sentence structure|Spelling|Grammar"},"vocabulary":[{"word":"string","meaning":"string","example":"string","level":"string","category":"string"}],"scores":{"grammar":0,"vocabulary":0,"fluency":0}}\n\nConversation (most recent last):\n${messages
    .slice(-10)
    .map((m) => `${m.role === "user" ? "Learner" : "Trainer"}: ${m.content}`)
    .join("\n")}`;
}
function extractJson(text) {
  const trimmed = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(trimmed);
}
export async function getTutorResponse({ user, type, messages, weaknesses }) {
  if (!env.geminiKey) return FALLBACK;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.geminiModel)}:generateContent?key=${encodeURIComponent(env.geminiKey)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: tutorPrompt({ user, type, messages, weaknesses }) },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.45,
          maxOutputTokens: 1000,
          responseMimeType: "application/json",
        },
      }),
    });
    if (!response.ok)
      throw new Error(`Gemini request failed: ${response.status}`);
    const payload = await response.json();
    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("");
    return responseSchema.parse(extractJson(text));
  } catch (error) {
    console.error("Gemini service unavailable:", error.message);
    return FALLBACK;
  } finally {
    clearTimeout(timeout);
  }
}
