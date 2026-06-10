import { Schema, model, Document, Types } from "mongoose";

export type Mood = "happy" | "sad" | "neutral" | "excited" | "tired" | "grateful";

export interface IJournalEntry extends Document {
  userId: Types.ObjectId;
  content: string;
  mood: Mood;
  isShared: boolean;
  createdAt: Date;
}

const journalEntrySchema = new Schema<IJournalEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true },
    mood: {
      type: String,
      enum: ["happy", "sad", "neutral", "excited", "tired", "grateful"],
      default: "neutral",
    },
    isShared: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<IJournalEntry>("JournalEntry", journalEntrySchema);
