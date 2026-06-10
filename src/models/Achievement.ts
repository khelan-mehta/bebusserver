import { Schema, model, Document, Types } from "mongoose";

export interface IAchievement extends Document {
  userId: Types.ObjectId;
  achievementType: string;
  unlockedAt: Date;
}

const achievementSchema = new Schema<IAchievement>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  achievementType: { type: String, required: true },
  unlockedAt: { type: Date, default: Date.now },
});

achievementSchema.index({ userId: 1, achievementType: 1 }, { unique: true });

export default model<IAchievement>("Achievement", achievementSchema);
