import { Request, Response } from "express";
import { Pet, User } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { emitGlobal } from "../sockets";

export const getMyPet = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user || !user.petId) {
    throw new ApiError(404, "Pet not found");
  }

  const pet = await Pet.findById(user.petId);
  res.json({ success: true, pet });
});

export const getCouplePets = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const userIds = [user._id, user.partnerId].filter(Boolean);
  const pets = await Pet.find({ userId: { $in: userIds } });

  res.json({ success: true, pets });
});

export const updatePet = asyncHandler(async (req: Request, res: Response) => {
  const { petName, accessories } = req.body;

  const pet = await Pet.findOne({ userId: req.user!.id });
  if (!pet) {
    throw new ApiError(404, "Pet not found");
  }

  if (petName !== undefined) pet.petName = petName;
  if (accessories !== undefined) pet.accessories = accessories;

  await pet.save();

  emitGlobal("pet:updated", pet);
  res.json({ success: true, pet });
});
