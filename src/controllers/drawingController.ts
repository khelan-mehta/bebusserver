import { Request, Response } from "express";
import { Drawing } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { emitGlobal } from "../sockets";

export const getDrawings = asyncHandler(async (req: Request, res: Response) => {
  const drawings = await Drawing.find({ userId: req.user!.id }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, drawings });
});

export const saveDrawing = asyncHandler(async (req: Request, res: Response) => {
  const { canvasData } = req.body;
  if (!canvasData) {
    throw new ApiError(400, "canvasData is required");
  }

  const drawing = await Drawing.create({ userId: req.user!.id, canvasData });

  emitGlobal("drawing:created", { id: drawing._id, userId: req.user!.id, createdAt: drawing.createdAt });

  res.status(201).json({ success: true, drawing });
});

export const deleteDrawing = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const drawing = await Drawing.findOneAndDelete({ _id: id, userId: req.user!.id });
  if (!drawing) {
    throw new ApiError(404, "Drawing not found");
  }
  res.json({ success: true, id });
});
