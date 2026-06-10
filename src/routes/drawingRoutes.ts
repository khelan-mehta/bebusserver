import { Router } from "express";
import { protect } from "../middleware/auth";
import { getDrawings, saveDrawing, deleteDrawing } from "../controllers/drawingController";

const router = Router();

router.use(protect);

router.get("/", getDrawings);
router.post("/", saveDrawing);
router.delete("/:id", deleteDrawing);

export default router;
