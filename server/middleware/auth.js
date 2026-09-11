import User from "../models/User.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { fail } from "../utils/response.js";
export async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
    if (!token)
      return fail(res, 401, "Authentication is required.", "UNAUTHENTICATED");
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (!user)
      return fail(
        res,
        401,
        "Your session is no longer valid.",
        "UNAUTHENTICATED",
      );
    req.user = user;
    next();
  } catch {
    return fail(
      res,
      401,
      "Your session has expired. Please log in again.",
      "UNAUTHENTICATED",
    );
  }
}
