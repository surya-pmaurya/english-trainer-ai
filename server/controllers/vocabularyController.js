import Vocabulary from "../models/Vocabulary.js";
import { fail, ok } from "../utils/response.js";
export async function listVocabulary(req, res, next) {
  try {
    const vocabulary = await Vocabulary.find({ userId: req.user.id })
      .sort({ mastered: 1, updatedAt: -1 })
      .lean();
    return ok(res, {
      vocabulary: vocabulary.map((word) => ({ ...word, id: word._id })),
    });
  } catch (error) {
    next(error);
  }
}
export async function createVocabulary(req, res, next) {
  try {
    const word = await Vocabulary.findOneAndUpdate(
      {
        userId: req.user.id,
        word: new RegExp(
          `^${req.body.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i",
        ),
      },
      { $set: { ...req.body, userId: req.user.id } },
      { upsert: true, new: true, runValidators: true },
    );
    return ok(res, { vocabulary: { ...word.toJSON(), id: word.id } }, 201);
  } catch (error) {
    next(error);
  }
}
export async function updateVocabulary(req, res, next) {
  try {
    const word = await Vocabulary.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!word) return fail(res, 404, "Vocabulary item not found.", "NOT_FOUND");
    return ok(res, { vocabulary: { ...word.toJSON(), id: word.id } });
  } catch (error) {
    next(error);
  }
}
export async function deleteVocabulary(req, res, next) {
  try {
    const word = await Vocabulary.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!word) return fail(res, 404, "Vocabulary item not found.", "NOT_FOUND");
    return ok(res, { message: "Vocabulary item removed." });
  } catch (error) {
    next(error);
  }
}
