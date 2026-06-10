import { Request, Response } from "express";
import { Achievement } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { emitGlobal } from "../sockets";

export const getAchievements = asyncHandler(async (req: Request, res: Response) => {
  const achievements = await Achievement.find({ userId: req.user!.id }).sort({ unlockedAt: -1 });
  res.json({ success: true, achievements });
});

export const unlockAchievement = asyncHandler(async (req: Request, res: Response) => {
  const { achievementType } = req.body;
  if (!achievementType) {
    throw new ApiError(400, "achievementType is required");
  }

  const existing = await Achievement.findOne({ userId: req.user!.id, achievementType });
  if (existing) {
    return res.json({ success: true, achievement: existing, alreadyUnlocked: true });
  }

  const achievement = await Achievement.create({ userId: req.user!.id, achievementType });

  emitGlobal("achievement:unlocked", { userId: req.user!.id, achievement });

  res.status(201).json({ success: true, achievement, alreadyUnlocked: false });
});
