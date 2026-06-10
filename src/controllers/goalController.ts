import { Request, Response } from "express";
import { Goal, User } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { awardXp } from "../services/xpService";
import { emitGlobal } from "../sockets";

const GOAL_COMPLETE_XP = 20;

export const getGoals = asyncHandler(async (req: Request, res: Response) => {
  const goals = await Goal.find({ userId: req.user!.id }).sort({ createdAt: -1 });
  res.json({ success: true, goals });
});

export const getPartnerGoals = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user || !user.partnerId) {
    return res.json({ success: true, goals: [] });
  }

  const goals = await Goal.find({ userId: user.partnerId }).sort({ createdAt: -1 });
  res.json({ success: true, goals });
});

export const createGoal = asyncHandler(async (req: Request, res: Response) => {
  const { title } = req.body;
  if (!title) {
    throw new ApiError(400, "title is required");
  }

  const goal = await Goal.create({ userId: req.user!.id, title });

  emitGlobal("goal:created", goal);
  res.status(201).json({ success: true, goal });
});

export const updateGoal = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, completed, tallyCount } = req.body;

  const goal = await Goal.findOne({ _id: id, userId: req.user!.id });
  if (!goal) {
    throw new ApiError(404, "Goal not found");
  }

  const wasCompleted = goal.completed;

  if (title !== undefined) goal.title = title;
  if (tallyCount !== undefined) goal.tallyCount = tallyCount;
  if (completed !== undefined) goal.completed = completed;

  await goal.save();

  let xpResult;
  if (!wasCompleted && goal.completed) {
    xpResult = await awardXp(req.user!.id, GOAL_COMPLETE_XP);
  }

  emitGlobal("goal:updated", goal);
  if (xpResult) {
    emitGlobal("xp:updated", { userId: req.user!.id, ...xpResult });
  }

  res.json({ success: true, goal, xp: xpResult });
});

export const deleteGoal = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const goal = await Goal.findOneAndDelete({ _id: id, userId: req.user!.id });
  if (!goal) {
    throw new ApiError(404, "Goal not found");
  }

  emitGlobal("goal:deleted", { id });
  res.json({ success: true, id });
});
