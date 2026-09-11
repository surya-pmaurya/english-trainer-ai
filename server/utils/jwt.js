import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export const signAccessToken = (userId) =>
  jwt.sign({ sub: userId }, env.accessSecret, {
    expiresIn: "15m",
    issuer: "english-trainer-ai",
    audience: "english-trainer-ai-client",
  });
export const verifyAccessToken = (token) =>
  jwt.verify(token, env.accessSecret, {
    issuer: "english-trainer-ai",
    audience: "english-trainer-ai-client",
  });
