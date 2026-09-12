import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const required = ["MONGODB_URI", "JWT_ACCESS_SECRET"];
if (process.env.NODE_ENV === "production") {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length)
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
}
export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/english-trainer-ai",
  accessSecret:
    process.env.JWT_ACCESS_SECRET ||
    "development-secret-change-before-production",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  geminiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    password:
      process.env.SMTP_HOST === "smtp.gmail.com"
        ? process.env.SMTP_PASSWORD?.replace(/\s+/g, "")
        : process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM || "English Trainer AI <engtrainerai@gmail.com>",
  },
};
