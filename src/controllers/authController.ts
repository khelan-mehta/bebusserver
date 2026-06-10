import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User, Pet } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { generateToken } from "../utils/generateToken";
import { levelFromXp } from "../services/xpService";

const sanitizeUser = (user: any) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  xp: user.xp,
  level: levelFromXp(user.xp),
  coins: user.coins,
  petId: user.petId,
  partnerId: user.partnerId,
  streak: user.streak,
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, avatar, petName, petType } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "username, email and password are required");
  }

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    avatar: avatar || "",
  });

  const pet = await Pet.create({
    userId: user._id,
    petType: petType || "cat",
    petName: petName || "Mochi",
  });

  user.petId = pet._id as any;
  await user.save();

  const token = generateToken(user._id as any, user.username);

  res.status(201).json({ success: true, token, user: sanitizeUser(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id as any, user.username);

  res.json({ success: true, token, user: sanitizeUser(user) });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, message: "Logged out successfully" });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.json({ success: true, user: sanitizeUser(user) });
});
