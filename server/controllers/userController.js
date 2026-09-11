import User from "../models/User.js";
import { ok } from "../utils/response.js";
export async function getMe(req, res) {
  return ok(res, { user: req.user.toJSON() });
}
export async function updateMe(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    return ok(res, { user: user.toJSON() });
  } catch (error) {
    next(error);
  }
}
export async function updatePreferences(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: Object.fromEntries(
          Object.entries(req.body).map(([key, value]) => [
            `preferences.${key}`,
            value,
          ]),
        ),
      },
      { new: true, runValidators: true },
    );
    return ok(res, { user: user.toJSON() });
  } catch (error) {
    next(error);
  }
}
