import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import authRoutes from "./routes/authRoutes.js";
import mistakeRoutes from "./routes/mistakeRoutes.js";
import practiceRoutes from "./routes/practiceRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import vocabularyRoutes from "./routes/vocabularyRoutes.js";

const app = express();
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  }),
);
app.use(express.json({ limit: "64kb" }));
app.use(cookieParser());
app.get("/api/health", (_req, res) =>
  res.json({ success: true, data: { status: "ok" } }),
);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/mistakes", mistakeRoutes);
app.use("/api/vocabulary", vocabularyRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
