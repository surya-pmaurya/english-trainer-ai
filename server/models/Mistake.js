import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: { type: String, required: true },
    originalText: { type: String, required: true },
    correctedText: { type: String, required: true },
    explanation: String,
    occurrences: { type: Number, default: 1 },
    lastOccurredAt: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true },
);
schema.index({ userId: 1, category: 1, correctedText: 1 });
export default mongoose.model("Mistake", schema);
