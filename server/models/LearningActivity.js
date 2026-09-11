import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: String, required: true },
    minutes: { type: Number, default: 0 },
    sessionsCompleted: { type: Number, default: 0 },
    wordsLearned: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
  },
  { timestamps: true },
);
schema.index({ userId: 1, date: 1 }, { unique: true });
export default mongoose.model("LearningActivity", schema);
