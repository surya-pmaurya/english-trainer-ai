import { Router } from "express";
import {
  listMistakes,
  updateMistake,
} from "../controllers/mistakeController.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
router.use(requireAuth);
router.get("/", listMistakes);
router.patch("/:id", updateMistake);
export default router;
