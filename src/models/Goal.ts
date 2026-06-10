import { Schema, model, Document, Types } from "mongoose";

export interface IGoal extends Document {
  userId: Types.ObjectId;
  title: string;
  completed: boolean;
  tallyCount: number;
  createdAt: Date;
}

const goalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    tallyCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<IGoal>("Goal", goalSchema);
