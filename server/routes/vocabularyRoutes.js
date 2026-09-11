import { Router } from "express";
import {
  createVocabulary,
  deleteVocabulary,
  listVocabulary,
  updateVocabulary,
} from "../controllers/vocabularyController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { vocabularySchema } from "../validators/userValidators.js";
const router = Router();
router.use(requireAuth);
router.get("/", listVocabulary);
router.post("/", validate(vocabularySchema), createVocabulary);
router.patch("/:id", validate(vocabularySchema.partial()), updateVocabulary);
router.delete("/:id", deleteVocabulary);
export default router;
