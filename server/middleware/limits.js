import rateLimit from "express-rate-limit";
import { fail } from "../utils/response.js";
const rejected = (_req, res) =>
  fail(
    res,
    429,
    "Too many requests. Please wait a moment and try again.",
    "RATE_LIMITED",
  );
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rejected,
});
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  keyGenerator: (req) => req.user?.id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rejected,
});
