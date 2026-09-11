import Mistake from "../models/Mistake.js";
import { fail, ok } from "../utils/response.js";
export async function listMistakes(req, res, next) {
  try {
    const mistakes = await Mistake.find({
      userId: req.user.id,
      resolved: false,
    })
      .sort({ occurrences: -1, lastOccurredAt: -1 })
      .lean();
    return ok(res, {
      mistakes: mistakes.map((mistake) => ({
        ...mistake,
        id: String(mistake._id),
      })),
    });
  } catch (error) {
    next(error);
  }
}
export async function updateMistake(req, res, next) {
  try {
    const mistake = await Mistake.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { resolved: Boolean(req.body.resolved) } },
      { new: true },
    );
    if (!mistake) return fail(res, 404, "Mistake not found.", "NOT_FOUND");
    return ok(res, { mistake });
  } catch (error) {
    next(error);
  }
}
