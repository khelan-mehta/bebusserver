import { Request, Response } from "express";
import { LoveLetter, User } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { emitToUser } from "../sockets";

export const getMailbox = asyncHandler(async (req: Request, res: Response) => {
  const letters = await LoveLetter.find({ receiverId: req.user!.id })
    .sort({ createdAt: -1 })
    .populate("senderId", "username avatar");

  res.json({ success: true, letters });
});

export const getSentLetters = asyncHandler(async (req: Request, res: Response) => {
  const letters = await LoveLetter.find({ senderId: req.user!.id }).sort({ createdAt: -1 });
  res.json({ success: true, letters });
});

export const sendLetter = asyncHandler(async (req: Request, res: Response) => {
  const { message, stickers, drawingAttachment } = req.body;
  if (!message) {
    throw new ApiError(400, "message is required");
  }

  const sender = await User.findById(req.user!.id);
  if (!sender || !sender.partnerId) {
    throw new ApiError(400, "No partner linked to this account");
  }

  const letter = await LoveLetter.create({
    senderId: sender._id,
    receiverId: sender.partnerId,
    message,
    stickers: stickers || [],
    drawingAttachment,
  });

  emitToUser(sender.partnerId.toString(), "mailbox:newLetter", letter);

  res.status(201).json({ success: true, letter });
});

export const markLetterRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const letter = await LoveLetter.findOne({ _id: id, receiverId: req.user!.id });
  if (!letter) {
    throw new ApiError(404, "Letter not found");
  }

  letter.isRead = true;
  await letter.save();

  res.json({ success: true, letter });
});
