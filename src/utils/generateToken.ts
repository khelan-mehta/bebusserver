import jwt, { SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";

export const generateToken = (id: Types.ObjectId | string, username: string): string => {
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];
  return jwt.sign({ id: id.toString(), username }, process.env.JWT_SECRET as string, {
    expiresIn,
  });
};
