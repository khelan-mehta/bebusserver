import { Schema, model, Document, Types } from "mongoose";

export interface IDrawing extends Document {
  userId: Types.ObjectId;
  canvasData: string;
  createdAt: Date;
}

const drawingSchema = new Schema<IDrawing>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    canvasData: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<IDrawing>("Drawing", drawingSchema);
