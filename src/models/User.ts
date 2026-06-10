import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar: string;
  xp: number;
  coins: number;
  petId?: Types.ObjectId;
  partnerId?: Types.ObjectId;
  streak: number;
  lastActiveDate?: Date;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    xp: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    petId: { type: Schema.Types.ObjectId, ref: "Pet" },
    partnerId: { type: Schema.Types.ObjectId, ref: "User" },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<IUser>("User", userSchema);
