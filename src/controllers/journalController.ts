import { Request, Response } from "express";
import { JournalEntry } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { emitGlobal } from "../sockets";

export const getJournalEntries = asyncHandler(async (req: Request, res: Response) => {
  const { shared } = req.query;

  const filter: Record<string, unknown> =
    shared === "true"
      ? { $or: [{ userId: req.user!.id }, { isShared: true }] }
      : { userId: req.user!.id };

  const entries = await JournalEntry.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, entries });
});

export const createJournalEntry = asyncHandler(async (req: Request, res: Response) => {
  const { content, mood, isShared } = req.body;
  if (!content) {
    throw new ApiError(400, "content is required");
  }

  const entry = await JournalEntry.create({
    userId: req.user!.id,
    content,
    mood: mood || "neutral",
    isShared: !!isShared,
  });

  if (entry.isShared) {
    emitGlobal("journal:created", entry);
  }

  res.status(201).json({ success: true, entry });
});

export const updateJournalEntry = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content, mood, isShared } = req.body;

  const entry = await JournalEntry.findOne({ _id: id, userId: req.user!.id });
  if (!entry) {
    throw new ApiError(404, "Journal entry not found");
  }

  if (content !== undefined) entry.content = content;
  if (mood !== undefined) entry.mood = mood;
  if (isShared !== undefined) entry.isShared = isShared;

  await entry.save();

  if (entry.isShared) {
    emitGlobal("journal:updated", entry);
  }

  res.json({ success: true, entry });
});

export const deleteJournalEntry = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = await JournalEntry.findOneAndDelete({ _id: id, userId: req.user!.id });
  if (!entry) {
    throw new ApiError(404, "Journal entry not found");
  }
  res.json({ success: true, id });
});
