import { Router } from "express";
import { protect } from "../middleware/auth";
import { getGoals, getPartnerGoals, createGoal, updateGoal, deleteGoal } from "../controllers/goalController";

const router = Router();

router.use(protect);

router.get("/", getGoals);
router.get("/partner", getPartnerGoals);
router.post("/", createGoal);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;
