import { Router } from "express";
import { protect } from "../middleware/auth";
import { getPomodoroSessions, createPomodoroSession } from "../controllers/pomodoroController";

const router = Router();

router.use(protect);

router.get("/", getPomodoroSessions);
router.post("/", createPomodoroSession);

export default router;
