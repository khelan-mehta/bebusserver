import { Request, Response } from "express";
import { Types } from "mongoose";
import { Goal, PomodoroSession, JournalEntry, User, Pet } from "../models";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { levelFromXp } from "../services/xpService";

const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const dayKey = (date: Date): string => startOfDay(date).toISOString().slice(0, 10);

interface UserStats {
  goalsCompleted: number;
  goalsTotal: number;
  pomodoros: number;
  focusMinutes: number;
  journalEntries: number;
  xpEarned: number;
  completionRate: number;
}

const computeUserStats = async (userId: Types.ObjectId, since: Date): Promise<UserStats> => {
  const goals = await Goal.find({ userId, createdAt: { $gte: since } });
  const sessions = await PomodoroSession.find({ userId, createdAt: { $gte: since }, completed: true });
  const journalEntries = await JournalEntry.countDocuments({ userId, createdAt: { $gte: since } });

  const goalsCompleted = goals.filter((g) => g.completed).length;
  const focusMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const xpEarned = sessions.reduce((sum, s) => sum + s.xpEarned, 0);

  return {
    goalsCompleted,
    goalsTotal: goals.length,
    pomodoros: sessions.length,
    focusMinutes,
    journalEntries,
    xpEarned,
    completionRate: goals.length ? Math.round((goalsCompleted / goals.length) * 100) : 0,
  };
};

export const getOverview = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const since = new Date();
  since.setDate(since.getDate() - 7);
  since.setHours(0, 0, 0, 0);

  const me = await computeUserStats(user._id as Types.ObjectId, since);
  const myPet = user.petId ? await Pet.findById(user.petId) : null;

  let partner: (UserStats & { username: string; xp: number; level: number; streak: number }) | null =
    null;
  let partnerPet = null;
  let partnerUser = null;

  if (user.partnerId) {
    partnerUser = await User.findById(user.partnerId);
    if (partnerUser) {
      const partnerStats = await computeUserStats(partnerUser._id as Types.ObjectId, since);
      partner = {
        ...partnerStats,
        username: partnerUser.username,
        xp: partnerUser.xp,
        level: levelFromXp(partnerUser.xp),
        streak: partnerUser.streak,
      };
      partnerPet = partnerUser.petId ? await Pet.findById(partnerUser.petId) : null;
    }
  }

  const winner =
    partner && partner.completionRate !== me.completionRate
      ? partner.completionRate > me.completionRate
        ? { username: partner.username, xpDifference: partner.xp - user.xp }
        : { username: user.username, xpDifference: user.xp - partner.xp }
      : null;

  res.json({
    success: true,
    me: {
      username: user.username,
      level: levelFromXp(user.xp),
      xp: user.xp,
      streak: user.streak,
      pet: myPet,
      ...me,
    },
    partner: partner
      ? {
          ...partner,
          pet: partnerPet,
        }
      : null,
    winner,
  });
});

export const getWeeklyProgress = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const userIds = [user._id, user.partnerId].filter(Boolean) as Types.ObjectId[];

  const goals = await Goal.find({ userId: { $in: userIds }, createdAt: { $gte: since } });

  const days: { date: string; [key: string]: number | string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    days.push({ date: dayKey(d), [user.username]: 0, ...(user.partnerId ? { [user.partnerId.toString()]: 0 } : {}) });
  }

  const dayIndex = new Map(days.map((d, i) => [d.date, i]));

  for (const goal of goals) {
    if (!goal.completed) continue;
    const key = dayKey(goal.createdAt);
    const idx = dayIndex.get(key);
    if (idx === undefined) continue;

    const isMe = goal.userId.toString() === (user._id as Types.ObjectId).toString();
    const label = isMe ? user.username : "partner";
    days[idx][label] = (Number(days[idx][label]) || 0) + 1;
  }

  res.json({ success: true, days });
});

export const getTrends = asyncHandler(async (req: Request, res: Response) => {
  const days = Number(req.query.days) || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const xpByDay = await PomodoroSession.aggregate([
    { $match: { userId: new Types.ObjectId(req.user!.id), createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        xp: { $sum: "$xpEarned" },
        sessions: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({ success: true, trends: xpByDay });
});

export const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const userIds = [user._id, user.partnerId].filter(Boolean) as Types.ObjectId[];
  const users = await User.find({ _id: { $in: userIds } }).sort({ xp: -1 });

  const leaderboard = users.map((u) => ({
    id: u._id,
    username: u.username,
    avatar: u.avatar,
    xp: u.xp,
    level: levelFromXp(u.xp),
    coins: u.coins,
    streak: u.streak,
  }));

  res.json({ success: true, leaderboard });
});
