import { Request, Response } from "express";
import { PomodoroSession } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { awardXp } from "../services/xpService";
import { emitGlobal } from "../sockets";

const XP_PER_MINUTE = 1;

export const getPomodoroSessions = asyncHandler(async (req: Request, res: Response) => {
  const sessions = await PomodoroSession.find({ userId: req.user!.id })
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ success: true, sessions });
});

export const createPomodoroSession = asyncHandler(async (req: Request, res: Response) => {
  const { duration, completed } = req.body;
  if (!duration) {
    throw new ApiError(400, "duration (in minutes) is required");
  }

  const isCompleted = !!completed;
  const xpEarned = isCompleted ? Math.round(duration * XP_PER_MINUTE) : 0;

  const session = await PomodoroSession.create({
    userId: req.user!.id,
    duration,
    completed: isCompleted,
    xpEarned,
  });

  let xpResult;
  if (isCompleted) {
    xpResult = await awardXp(req.user!.id, xpEarned, Math.round(xpEarned / 2));
  }

  emitGlobal("pomodoro:created", { userId: req.user!.id, session });
  if (xpResult) {
    emitGlobal("xp:updated", { userId: req.user!.id, ...xpResult });
  }

  res.status(201).json({ success: true, session, xp: xpResult });
});
