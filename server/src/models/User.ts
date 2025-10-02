import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // hashed
  isVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  googleId?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
  googleId: String,
  createdAt: { type: Date, default: Date.now }
});

export default model<IUser>("User", UserSchema);
