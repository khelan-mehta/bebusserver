import { Schema, model, Document, Types } from "mongoose";

export interface ILoveLetter extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  message: string;
  stickers: string[];
  drawingAttachment?: string;
  isRead: boolean;
  createdAt: Date;
}

const loveLetterSchema = new Schema<ILoveLetter>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    message: { type: String, required: true },
    stickers: { type: [String], default: [] },
    drawingAttachment: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<ILoveLetter>("LoveLetter", loveLetterSchema);
