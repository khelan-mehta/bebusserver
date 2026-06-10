import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "../controllers/journalController";

const router = Router();

router.use(protect);

router.get("/", getJournalEntries);
router.post("/", createJournalEntry);
router.put("/:id", updateJournalEntry);
router.delete("/:id", deleteJournalEntry);

export default router;
