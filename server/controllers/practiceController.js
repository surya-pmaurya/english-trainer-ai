import Mistake from "../models/Mistake.js";
import PracticeSession from "../models/PracticeSession.js";
import Vocabulary from "../models/Vocabulary.js";
import { getTutorResponse } from "../services/geminiService.js";
import { recordLearningActivity } from "../services/progressService.js";
import { calculateSessionScores } from "../services/scoringService.js";
import { fail, ok } from "../utils/response.js";

const toSession = (session) => ({
  id: session.id,
  type: session.type,
  topic: session.topic,
  startedAt: session.startedAt,
  completedAt: session.completedAt,
  duration: session.duration,
  overallScore: session.overallScore,
  aiSummary: session.aiSummary,
  scores: {
    grammar: session.grammarScore,
    vocabulary: session.vocabularyScore,
    fluency: session.fluencyScore,
    speaking: session.speakingScore,
  },
  messages: session.messages,
});
async function recordCorrection(userId, correction) {
  if (!correction?.corrected || correction.corrected === correction.original)
    return;
  const category = correction.category || "Grammar";
  const matching = await Mistake.findOne({
    userId,
    category,
    correctedText: correction.corrected,
  });
  if (matching) {
    matching.occurrences += 1;
    matching.originalText = correction.original;
    matching.explanation = correction.explanation;
    matching.lastOccurredAt = new Date();
    await matching.save();
  } else
    await Mistake.create({
      userId,
      category,
      originalText: correction.original,
      correctedText: correction.corrected,
      explanation: correction.explanation,
    });
}
async function storeVocabulary(userId, words) {
  await Promise.all(
    words.map((item) =>
      Vocabulary.findOneAndUpdate(
        { userId, word: item.word },
        { $setOnInsert: { userId, ...item } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ),
    ),
  );
}
export async function startSession(req, res, next) {
  try {
    const session = await PracticeSession.create({
      userId: req.user.id,
      type: req.body.type,
      topic: req.body.topic,
    });
    return ok(res, { session: toSession(session) }, 201);
  } catch (error) {
    next(error);
  }
}
export async function sendMessage(req, res, next) {
  try {
    const session = await PracticeSession.findOne({
      _id: req.body.sessionId,
      userId: req.user.id,
      completedAt: null,
    });
    if (!session)
      return fail(
        res,
        404,
        "That active practice session was not found.",
        "NOT_FOUND",
      );
    const learnerMessage = {
      role: "user",
      content: req.body.content,
      timestamp: new Date(),
    };
    session.messages.push(learnerMessage);
    const mistakes = await Mistake.find({
      userId: req.user.id,
      resolved: false,
    })
      .sort({ occurrences: -1 })
      .limit(4)
      .lean();
    const response = await getTutorResponse({
      user: req.user,
      type: session.type,
      messages: session.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      weaknesses: mistakes.map((mistake) => mistake.category),
    });
    const assistantMessage = {
      role: "assistant",
      content: response.reply,
      correction: response.correction || undefined,
      vocabulary: response.vocabulary,
      scores: response.scores,
      timestamp: new Date(),
    };
    session.messages.push(assistantMessage);
    if (response.correction) session.mistakes.push(response.correction);
    if (response.vocabulary.length)
      session.vocabulary.push(...response.vocabulary);
    await Promise.all([
      recordCorrection(req.user.id, response.correction),
      storeVocabulary(req.user.id, response.vocabulary),
    ]);
    await session.save();
    return ok(res, {
      reply: response.reply,
      correction: response.correction || null,
      vocabulary: response.vocabulary,
      scores: response.scores,
    });
  } catch (error) {
    next(error);
  }
}
export async function completeSession(req, res, next) {
  try {
    const session = await PracticeSession.findOne({
      _id: req.body.sessionId,
      userId: req.user.id,
    });
    if (!session)
      return fail(res, 404, "Practice session not found.", "NOT_FOUND");
    if (!session.completedAt) {
      session.completedAt = new Date();
      session.duration = Math.max(
        1,
        Math.round((session.completedAt - session.startedAt) / 60000),
      );
      const scores = calculateSessionScores(session.messages, session.type);
      Object.assign(session, {
        overallScore: scores.overall,
        grammarScore: scores.grammar,
        vocabularyScore: scores.vocabulary,
        fluencyScore: scores.fluency,
        speakingScore: scores.speaking,
        aiSummary: scores.overall
          ? `You completed a ${session.type} session. Keep building on what you practised today.`
          : "You completed a learning session. When feedback is available, your next session will include skill scores.",
      });
      await session.save();
      await recordLearningActivity(req.user, session);
    }
    return ok(res, { session: toSession(session) });
  } catch (error) {
    next(error);
  }
}
export async function listHistory(req, res, next) {
  try {
    const sessions = await PracticeSession.find({
      userId: req.user.id,
      completedAt: { $ne: null },
    })
      .sort({ completedAt: -1 })
      .select("type completedAt duration overallScore")
      .limit(50)
      .lean();
    return ok(res, {
      sessions: sessions.map((session) => ({
        id: String(session._id),
        type: session.type,
        date: new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
          session.completedAt,
        ),
        duration: session.duration,
        overallScore: session.overallScore,
      })),
    });
  } catch (error) {
    next(error);
  }
}
export async function getSession(req, res, next) {
  try {
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      userId: req.user.id,
      completedAt: { $ne: null },
    });
    if (!session) return fail(res, 404, "Session not found.", "NOT_FOUND");
    return ok(res, { session: toSession(session) });
  } catch (error) {
    next(error);
  }
}
