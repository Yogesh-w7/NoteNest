import dotenv from "dotenv";
dotenv.config();

export const MONGO_URI = process.env.MONGO_URI!;
export const JWT_SECRET = process.env.JWT_SECRET || "replace_this_secret";
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
export const NODE_ENV = process.env.NODE_ENV || "development";
