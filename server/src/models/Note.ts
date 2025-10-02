import { Schema, model, Document, Types } from "mongoose";

interface INote extends Document {
  user: Types.ObjectId;
  title: string;
  body: string;
  createdAt: Date;
}

const NoteSchema = new Schema<INote>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  body: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default model<INote>("Note", NoteSchema);
