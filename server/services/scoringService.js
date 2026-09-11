const clamp = (score) =>
  Math.round(Math.max(0, Math.min(100, Number(score) || 0)));
const average = (values) =>
  values.length
    ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
    : 0;
export function calculateSessionScores(messages, type) {
  const feedback = messages.filter(
    (message) => message.role === "assistant" && message.scores,
  );
  const grammar = average(
    feedback.map((m) => m.scores.grammar).filter(Number.isFinite),
  );
  const vocabulary = average(
    feedback.map((m) => m.scores.vocabulary).filter(Number.isFinite),
  );
  const fluency = average(
    feedback.map((m) => m.scores.fluency).filter(Number.isFinite),
  );
  const speaking = type === "speaking" ? fluency : 0; // Speech recognition can assess language fluency, not pronunciation.
  const present = [grammar, vocabulary, fluency].filter(Boolean);
  return {
    grammar,
    vocabulary,
    fluency,
    speaking,
    overall: clamp(average(present)),
  };
}
export function calculateOverallScore({
  grammar,
  vocabulary,
  fluency,
  speaking,
  consistency,
}) {
  return clamp(
    grammar * 0.25 +
      vocabulary * 0.2 +
      fluency * 0.25 +
      speaking * 0.2 +
      consistency * 0.1,
  );
}
