import { Schema, model, Document, Types } from "mongoose";

export interface IPomodoroSession extends Document {
  userId: Types.ObjectId;
  duration: number;
  completed: boolean;
  xpEarned: number;
  createdAt: Date;
}

const pomodoroSessionSchema = new Schema<IPomodoroSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    duration: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    xpEarned: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<IPomodoroSession>("PomodoroSession", pomodoroSessionSchema);
