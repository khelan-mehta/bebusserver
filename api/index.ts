import dotenv from "dotenv";
dotenv.config();

import type { IncomingMessage, ServerResponse } from "http";
import mongoose from "mongoose";
import { createApp } from "../src/app";

// Reuse a single Express app instance across warm invocations.
const app = createApp();

// Cache the MongoDB connection across invocations so each request in a
// warm serverless container reuses the same pool instead of reconnecting.
let connecting: Promise<typeof mongoose> | null = null;

const ensureDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) return;
  if (!connecting) {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/pixel-pact";
    connecting = mongoose.connect(uri);
  }
  await connecting;
};

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  await ensureDB();
  (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
}
