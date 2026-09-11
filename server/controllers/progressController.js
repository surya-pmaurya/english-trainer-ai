import LearningActivity from "../models/LearningActivity.js";
import PracticeSession from "../models/PracticeSession.js";
import { calculateOverallScore } from "../services/scoringService.js";
import { ok } from "../utils/response.js";
const localDate = (timezone) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${value.year}-${value.month}-${value.day}`;
};
const avg = (values) =>
  values.length
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : 0;
export async function overview(req, res, next) {
  try {
    const sessions = await PracticeSession.find({
      userId: req.user.id,
      completedAt: { $ne: null },
    })
      .sort({ completedAt: -1 })
      .limit(90)
      .lean();
    const scores = {
      grammar: avg(sessions.map((item) => item.grammarScore).filter(Boolean)),
      vocabulary: avg(
        sessions.map((item) => item.vocabularyScore).filter(Boolean),
      ),
      fluency: avg(sessions.map((item) => item.fluencyScore).filter(Boolean)),
      speaking: avg(sessions.map((item) => item.speakingScore).filter(Boolean)),
    };
    const consistency = Math.min(100, req.user.currentStreak * 10);
    scores.overall = calculateOverallScore({ ...scores, consistency });
    const today = localDate(req.user.timezone);
    const activity = await LearningActivity.findOne({
      userId: req.user.id,
      date: today,
    }).lean();
    const recentSessions = sessions
      .slice(0, 5)
      .map((item) => ({
        id: String(item._id),
        label: `${item.type[0].toUpperCase()}${item.type.slice(1)} practice`,
        duration: item.duration,
        score: item.overallScore,
        date: new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
          item.completedAt,
        ),
      }));
    const scoreHistory = sessions
      .slice(0, 14)
      .reverse()
      .map((item) => ({
        date: new Intl.DateTimeFormat("en", {
          month: "short",
          day: "numeric",
        }).format(item.completedAt),
        score: item.overallScore,
      }));
    return ok(res, {
      scores,
      streak: {
        current: req.user.currentStreak,
        longest: req.user.longestStreak,
      },
      dailyGoal: {
        minutes: activity?.minutes || 0,
        sessions: activity?.sessionsCompleted || 0,
        percent: Math.min(
          100,
          Math.round(
            ((activity?.minutes || 0) / req.user.dailyGoalMinutes) * 100,
          ),
        ),
      },
      recentSessions,
      scoreHistory,
    });
  } catch (error) {
    next(error);
  }
}
export async function history(req, res, next) {
  try {
    const activities = await LearningActivity.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(90)
      .lean();
    return ok(res, { activities });
  } catch (error) {
    next(error);
  }
}
