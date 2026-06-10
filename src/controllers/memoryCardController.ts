import { Request, Response } from "express";
import { MemoryCard } from "../models";
import { asyncHandler } from "../utils/asyncHandler";

export const getMemoryCards = asyncHandler(async (req: Request, res: Response) => {
  const { limit } = req.query;
  const cards = await MemoryCard.find()
    .sort({ date: -1 })
    .limit(limit ? Number(limit) : 30)
    .populate("winner", "username avatar");

  res.json({ success: true, cards });
});

export const getMemoryCardByDate = asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.params;
  const start = new Date(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const card = await MemoryCard.findOne({ date: { $gte: start, $lt: end } }).populate(
    "winner",
    "username avatar"
  );

  res.json({ success: true, card });
});
