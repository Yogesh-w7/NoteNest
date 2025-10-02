import express from "express";
import Note from "../models/Note";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = express.Router();

router.use(requireAuth);

// GET /notes
router.get("/", async (req: AuthRequest, res) => {
  const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ notes });
});

// POST /notes
router.post("/", async (req: AuthRequest, res) => {
  const { title, body } = req.body;
  if (!title) return res.status(400).json({ message: "Title required" });
  const note = await Note.create({ user: req.user.id, title, body });
  res.json({ note });
});

// DELETE /notes/:id
router.delete("/:id", async (req: AuthRequest, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!note) return res.status(404).json({ message: "Not found" });
  res.json({ ok: true });
});

export default router;
