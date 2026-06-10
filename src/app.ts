/// <reference path="./types/express/index.d.ts" />
import express, { Application } from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import goalRoutes from "./routes/goalRoutes";
import journalRoutes from "./routes/journalRoutes";
import drawingRoutes from "./routes/drawingRoutes";
import petRoutes from "./routes/petRoutes";
import pomodoroRoutes from "./routes/pomodoroRoutes";
import mailboxRoutes from "./routes/mailboxRoutes";
import memoryCardRoutes from "./routes/memoryCardRoutes";
import achievementRoutes from "./routes/achievementRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import { notFound, errorHandler } from "./middleware/errorHandler";

export const createApp = (): Application => {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(express.json({ limit: "10mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "Pixel Pact API is running" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/goals", goalRoutes);
  app.use("/api/journal", journalRoutes);
  app.use("/api/drawings", drawingRoutes);
  app.use("/api/pets", petRoutes);
  app.use("/api/pomodoro", pomodoroRoutes);
  app.use("/api/mailbox", mailboxRoutes);
  app.use("/api/memory-cards", memoryCardRoutes);
  app.use("/api/achievements", achievementRoutes);
  app.use("/api/analytics", analyticsRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
