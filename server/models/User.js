import mongoose from "mongoose";

const refreshSessionSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshSessions: {
      type: [refreshSessionSchema],
      default: [],
      select: false,
    },
    avatar: { type: String, default: "" },
    nativeLanguage: { type: String, default: "" },
    englishLevel: {
      type: String,
      enum: [
        "Beginner",
        "Elementary",
        "Intermediate",
        "Upper Intermediate",
        "Advanced",
      ],
      default: "Intermediate",
    },
    learningGoal: { type: String, default: "Improve speaking" },
    dailyGoalMinutes: { type: Number, default: 15, min: 5, max: 120 },
    timezone: { type: String, default: "UTC" },
    onboardingCompleted: { type: Boolean, default: false },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: Date,
    overallScore: { type: Number, default: 0 },
    preferences: {
      correctionFrequency: {
        type: String,
        enum: ["gentle", "balanced", "detailed"],
        default: "balanced",
      },
      aiDifficulty: {
        type: String,
        enum: ["adaptive", "easier", "challenging"],
        default: "adaptive",
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.passwordHash;
        delete ret.refreshSessions;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        return ret;
      },
    },
  },
);
export default mongoose.model("User", userSchema);
