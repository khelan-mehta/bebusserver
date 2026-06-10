import { Router } from "express";
import { protect } from "../middleware/auth";
import { getAchievements, unlockAchievement } from "../controllers/achievementController";

const router = Router();

router.use(protect);

router.get("/", getAchievements);
router.post("/", unlockAchievement);

export default router;
