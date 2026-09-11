import { Router } from "express";
import { history, overview } from "../controllers/progressController.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
router.use(requireAuth);
router.get("/overview", overview);
router.get("/history", history);
export default router;
