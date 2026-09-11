import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    word: { type: String, required: true, trim: true },
    meaning: { type: String, required: true },
    example: String,
    level: String,
    category: String,
    timesUsed: { type: Number, default: 0 },
    mastered: { type: Boolean, default: false },
    reviewHistory: { type: [Date], default: [] },
  },
  { timestamps: true },
);
schema.index({ userId: 1, word: 1 }, { unique: true });
export default mongoose.model("Vocabulary", schema);
