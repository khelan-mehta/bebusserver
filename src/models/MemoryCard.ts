import { Schema, model, Document, Types } from "mongoose";

interface IMemoryCardUserData {
  goalsCompleted: number;
  pomodoros: number;
  journalWritten: boolean;
  thought: string;
}

export interface IMemoryCard extends Document {
  date: Date;
  userAData: IMemoryCardUserData;
  userBData: IMemoryCardUserData;
  winner?: Types.ObjectId;
  createdAt: Date;
}

const memoryCardUserDataSchema = new Schema<IMemoryCardUserData>(
  {
    goalsCompleted: { type: Number, default: 0 },
    pomodoros: { type: Number, default: 0 },
    journalWritten: { type: Boolean, default: false },
    thought: { type: String, default: "" },
  },
  { _id: false }
);

const memoryCardSchema = new Schema<IMemoryCard>(
  {
    date: { type: Date, required: true, index: true },
    userAData: { type: memoryCardUserDataSchema, default: () => ({}) },
    userBData: { type: memoryCardUserDataSchema, default: () => ({}) },
    winner: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<IMemoryCard>("MemoryCard", memoryCardSchema);
