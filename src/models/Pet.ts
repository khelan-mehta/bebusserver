import { Schema, model, Document, Types } from "mongoose";

export interface IPet extends Document {
  userId: Types.ObjectId;
  petType: string;
  petName: string;
  level: number;
  xp: number;
  accessories: string[];
  createdAt: Date;
}

const petSchema = new Schema<IPet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    petType: { type: String, required: true, default: "cat" },
    petName: { type: String, required: true, default: "Mochi" },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    accessories: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<IPet>("Pet", petSchema);
