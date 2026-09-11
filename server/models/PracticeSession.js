import mongoose from "mongoose";

const correctionSchema = new mongoose.Schema(
  {
    original: String,
    corrected: String,
    explanation: String,
    category: String,
  },
  { _id: false },
);
const vocabularySchema = new mongoose.Schema(
  {
    word: String,
    meaning: String,
    example: String,
    level: String,
    category: String,
  },
  { _id: false },
);
const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true, maxlength: 4000 },
    timestamp: { type: Date, default: Date.now },
    correction: correctionSchema,
    vocabulary: [vocabularySchema],
    scores: { grammar: Number, vocabulary: Number, fluency: Number },
  },
  { _id: false },
);
const practiceSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "conversation",
        "speaking",
        "grammar",
        "vocabulary",
        "interview",
        "travel",
        "workplace",
      ],
      required: true,
    },
    topic: { type: String, default: "" },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
    duration: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    grammarScore: { type: Number, default: 0 },
    vocabularyScore: { type: Number, default: 0 },
    fluencyScore: { type: Number, default: 0 },
    speakingScore: { type: Number, default: 0 },
    pronunciationScore: { type: Number, default: null },
    messages: { type: [messageSchema], default: [] },
    mistakes: { type: [correctionSchema], default: [] },
    vocabulary: { type: [vocabularySchema], default: [] },
    aiSummary: { type: String, default: "" },
    recommendations: { type: [String], default: [] },
  },
  { timestamps: true },
);
export default mongoose.model("PracticeSession", practiceSessionSchema);
