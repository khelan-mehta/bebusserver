import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  getOverview,
  getWeeklyProgress,
  getTrends,
  getLeaderboard,
} from "../controllers/analyticsController";

const router = Router();

router.use(protect);

router.get("/overview", getOverview);
router.get("/weekly-progress", getWeeklyProgress);
router.get("/trends", getTrends);
router.get("/leaderboard", getLeaderboard);

export default router;
