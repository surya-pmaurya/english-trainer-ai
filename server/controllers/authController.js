import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { env } from "../config/env.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../services/emailService.js";
import { createOpaqueToken, hashToken } from "../utils/crypto.js";
import { signAccessToken } from "../utils/jwt.js";
import { fail, ok } from "../utils/response.js";

const verificationExpiry = () => new Date(Date.now() + 1000 * 60 * 60 * 24);
const resetExpiry = () => new Date(Date.now() + 1000 * 60 * 30);
const refreshExpiry = () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax",
  path: "/api/auth",
  maxAge: 1000 * 60 * 60 * 24 * 30,
};
const clearCookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax",
  path: "/api/auth",
};
const publicUser = (user) => user.toJSON();
function issueAccessAndRefresh(res, user) {
  const refreshToken = createOpaqueToken();
  user.refreshSessions = (user.refreshSessions || [])
    .filter((session) => session.expiresAt > new Date())
    .slice(-7);
  user.refreshSessions.push({
    tokenHash: hashToken(refreshToken),
    expiresAt: refreshExpiry(),
  });
  res.cookie("eta_refresh", refreshToken, cookieOptions);
  return signAccessToken(user.id);
}

export async function register(req, res, next) {
  try {
    const email = req.body.email.toLowerCase();
    const existing = await User.findOne({ email }).select(
      "+emailVerificationToken +emailVerificationExpires",
    );
    if (existing) {
      if (!existing.isEmailVerified) {
        const rawToken = createOpaqueToken();
        existing.name = req.body.name;
        existing.passwordHash = await bcrypt.hash(req.body.password, 12);
        existing.emailVerificationToken = hashToken(rawToken);
        existing.emailVerificationExpires = verificationExpiry();
        await existing.save();
        await sendVerificationEmail(existing.email, rawToken);
        return ok(
          res,
          { message: "Account created. Please verify your email to continue." },
          201,
        );
      }
      return fail(
        res,
        409,
        "An account already exists with that email.",
        "EMAIL_IN_USE",
      );
    }
    const rawToken = createOpaqueToken();
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      passwordHash: await bcrypt.hash(req.body.password, 12),
      emailVerificationToken: hashToken(rawToken),
      emailVerificationExpires: verificationExpiry(),
    });
    await sendVerificationEmail(user.email, rawToken);
    return ok(
      res,
      { message: "Account created. Please verify your email to continue." },
      201,
    );
  } catch (error) {
    next(error);
  }
}
export async function verifyEmail(req, res, next) {
  try {
    const user = await User.findOne({
      emailVerificationToken: hashToken(req.body.token),
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationToken +emailVerificationExpires");
    if (!user)
      return fail(
        res,
        400,
        "This verification link is invalid or has expired.",
        "INVALID_TOKEN",
      );
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    return ok(res, { message: "Email verified." });
  } catch (error) {
    next(error);
  }
}
export async function resendVerification(req, res, next) {
  try {
    const user = await User.findOne({
      email: req.body.email.toLowerCase(),
    }).select("+emailVerificationToken +emailVerificationExpires");
    if (user && !user.isEmailVerified) {
      const rawToken = createOpaqueToken();
      user.emailVerificationToken = hashToken(rawToken);
      user.emailVerificationExpires = verificationExpiry();
      await user.save();
      await sendVerificationEmail(user.email, rawToken);
    }
    return ok(res, {
      message: "If needed, a new verification email has been sent.",
    });
  } catch (error) {
    next(error);
  }
}
export async function login(req, res, next) {
  try {
    const user = await User.findOne({
      email: req.body.email.toLowerCase(),
    }).select("+passwordHash +refreshSessions");
    if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash)))
      return fail(
        res,
        401,
        "Invalid email or password.",
        "INVALID_CREDENTIALS",
      );
    if (!user.isEmailVerified)
      return fail(
        res,
        403,
        "Please verify your email before logging in.",
        "EMAIL_NOT_VERIFIED",
      );
    const accessToken = issueAccessAndRefresh(res, user);
    await user.save();
    return ok(res, { accessToken, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}
export async function refresh(req, res, next) {
  try {
    const rawToken = req.cookies.eta_refresh;
    if (!rawToken)
      return fail(res, 401, "No active session.", "UNAUTHENTICATED");
    const tokenHash = hashToken(rawToken);
    const user = await User.findOne({
      "refreshSessions.tokenHash": tokenHash,
    }).select("+refreshSessions");
    const session = user?.refreshSessions?.find(
      (item) => item.tokenHash === tokenHash && item.expiresAt > new Date(),
    );
    if (!user || !session) {
      res.clearCookie("eta_refresh", clearCookieOptions);
      return fail(res, 401, "Your session has expired.", "UNAUTHENTICATED");
    }

    // Keep consumed token valid for a 60-second grace window to absorb
    // concurrent/duplicate browser requests without destroying the session
    session.expiresAt = new Date(Date.now() + 60 * 1000);

    const accessToken = issueAccessAndRefresh(res, user);
    try {
      await user.save();
    } catch (saveError) {
      if (saveError.name === "VersionError") {
        return ok(res, { accessToken: signAccessToken(user.id) });
      }
      throw saveError;
    }
    return ok(res, { accessToken });
  } catch (error) {
    next(error);
  }
}
export async function logout(req, res, next) {
  try {
    const rawToken = req.cookies.eta_refresh;
    if (rawToken) {
      const user = await User.findOne({
        "refreshSessions.tokenHash": hashToken(rawToken),
      }).select("+refreshSessions");
      if (user) {
        user.refreshSessions = user.refreshSessions.filter(
          (item) => item.tokenHash !== hashToken(rawToken),
        );
        await user.save();
      }
    }
    res.clearCookie("eta_refresh", clearCookieOptions);
    return ok(res, { message: "Logged out." });
  } catch (error) {
    next(error);
  }
}
export async function forgotPassword(req, res, next) {
  try {
    const user = await User.findOne({
      email: req.body.email.toLowerCase(),
    }).select("+passwordResetToken +passwordResetExpires");
    if (user) {
      const rawToken = createOpaqueToken();
      user.passwordResetToken = hashToken(rawToken);
      user.passwordResetExpires = resetExpiry();
      await user.save();
      await sendPasswordResetEmail(user.email, rawToken);
    }
    return ok(res, {
      message:
        "If that email belongs to an account, a reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
}
export async function resetPassword(req, res, next) {
  try {
    const user = await User.findOne({
      passwordResetToken: hashToken(req.body.token),
      passwordResetExpires: { $gt: new Date() },
    }).select(
      "+passwordResetToken +passwordResetExpires +passwordHash +refreshSessions",
    );
    if (!user)
      return fail(
        res,
        400,
        "This reset link is invalid or has expired.",
        "INVALID_TOKEN",
      );
    user.passwordHash = await bcrypt.hash(req.body.password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshSessions = [];
    await user.save();
    res.clearCookie("eta_refresh", clearCookieOptions);
    return ok(res, { message: "Password updated. You can now log in." });
  } catch (error) {
    next(error);
  }
}
export async function changePassword(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select(
      "+passwordHash +refreshSessions",
    );
    if (!(await bcrypt.compare(req.body.currentPassword, user.passwordHash)))
      return fail(
        res,
        400,
        "Your current password is incorrect.",
        "INVALID_PASSWORD",
      );
    user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    user.refreshSessions = [];
    await user.save();
    res.clearCookie("eta_refresh", clearCookieOptions);
    return ok(res, { message: "Password changed. Please log in again." });
  } catch (error) {
    next(error);
  }
}
export async function me(req, res) {
  return ok(res, { user: publicUser(req.user) });
}
