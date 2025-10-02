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
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Mongo connected");
    app.listen(process.env.PORT || 4000, () => console.log("Server running"));
  })
  .catch(err => console.error(err));
