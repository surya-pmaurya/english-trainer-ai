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
  let clean = text.trim();
  const firstBrace = clean.indexOf("{");
  const lastBrace = clean.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.slice(firstBrace, lastBrace + 1);
  }
  try {
    return JSON.parse(clean);
  } catch {
    const relaxed = clean
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
    return JSON.parse(relaxed);
  }
}
export async function getTutorResponse({ user, type, messages, weaknesses }) {
  if (!env.geminiKey) return FALLBACK;
  const candidateModels = [
    env.geminiModel,
    "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.6-flash",
  ].filter(Boolean);
  const modelsToTry = [...new Set(candidateModels)];

  for (const model of modelsToTry) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.geminiKey)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
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
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
          },
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.warn(
          `[Gemini] ${model} failed (${response.status}):`,
          errorData?.error?.message || response.statusText,
        );
        continue;
      }
      const payload = await response.json();
      const text = payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("");
      return responseSchema.parse(extractJson(text));
    } catch (error) {
      console.warn(`[Gemini] Error with ${model}:`, error.message);
    } finally {
      clearTimeout(timeout);
    }
  }

  console.error("Gemini service unavailable on all attempted models.");
  return FALLBACK;
}
