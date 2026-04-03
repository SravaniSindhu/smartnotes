import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: String,
  category: String,
  text: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Note = mongoose.model("Note", noteSchema);

export default Note;
