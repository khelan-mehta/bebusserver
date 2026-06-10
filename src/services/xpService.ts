import { Types } from "mongoose";
import { User, Pet } from "../models";

export const XP_PER_LEVEL = 500;

export const levelFromXp = (xp: number): number => Math.floor(xp / XP_PER_LEVEL) + 1;

interface AwardXpResult {
  xp: number;
  level: number;
  coins: number;
}

export const awardXp = async (
  userId: Types.ObjectId | string,
  xpAmount: number,
  coinsAmount = 0
): Promise<AwardXpResult> => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { xp: xpAmount, coins: coinsAmount } },
    { new: true }
  );

  if (!user) {
    throw new Error("User not found while awarding XP");
  }

  if (user.petId) {
    await Pet.findByIdAndUpdate(user.petId, { $inc: { xp: xpAmount } });
    const pet = await Pet.findById(user.petId);
    if (pet) {
      const newLevel = levelFromXp(pet.xp);
      if (newLevel !== pet.level) {
        pet.level = newLevel;
        await pet.save();
      }
    }
  }

  return { xp: user.xp, level: levelFromXp(user.xp), coins: user.coins };
};
