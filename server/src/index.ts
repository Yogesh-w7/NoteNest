import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { MONGO_URI, CLIENT_URL } from "./config";
import authRoutes from "./routes/auth";
import notesRoutes from "./routes/notes";

const app = express();

// --- Body parsing and cookies ---
app.use(express.json());
app.use(cookieParser());

// --- CORS ---
app.use(cors({
  origin: CLIENT_URL,   // Your frontend URL
  credentials: true
}));

// --- COOP / COEP headers to fix postMessage / Google login ---
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

// --- MongoDB connection & server start ---
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Mongo connected");
    app.listen(process.env.PORT || 4000, () => console.log("Server running"));
  })
  .catch(err => console.error(err));
