import LearningActivity from "../models/LearningActivity.js";
const localDate = (timezone) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
const shiftDay = (dateString, amount) => {
  const date = new Date(`${dateString}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
};
export async function recordLearningActivity(user, session) {
  const today = localDate(user.timezone);
  const activity = await LearningActivity.findOneAndUpdate(
    { userId: user._id, date: today },
    {
      $inc: {
        minutes: session.duration,
        sessionsCompleted: 1,
        wordsLearned: session.vocabulary.length,
      },
      $set: { score: session.overallScore },
    },
    { upsert: true, new: true },
  );
  const previous = shiftDay(today, -1);
  if (user.lastActivityDate !== today) {
    user.currentStreak =
      user.lastActivityDate === previous ? user.currentStreak + 1 : 1;
    user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
    user.lastActivityDate = today;
    user.overallScore = session.overallScore;
    await user.save();
  }
  return activity;
}
