import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  getMailbox,
  getSentLetters,
  sendLetter,
  markLetterRead,
} from "../controllers/mailboxController";

const router = Router();

router.use(protect);

router.get("/", getMailbox);
router.get("/sent", getSentLetters);
router.post("/", sendLetter);
router.put("/:id/read", markLetterRead);

export default router;
