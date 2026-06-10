import { Router } from "express";
import { protect } from "../middleware/auth";
import { getMemoryCards, getMemoryCardByDate } from "../controllers/memoryCardController";

const router = Router();

router.use(protect);

router.get("/", getMemoryCards);
router.get("/:date", getMemoryCardByDate);

export default router;
