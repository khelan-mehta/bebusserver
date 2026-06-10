import { Router } from "express";
import { protect } from "../middleware/auth";
import { getMyPet, getCouplePets, updatePet } from "../controllers/petController";

const router = Router();

router.use(protect);

router.get("/me", getMyPet);
router.get("/couple", getCouplePets);
router.put("/me", updatePet);

export default router;
