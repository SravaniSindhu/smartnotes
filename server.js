import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Note from "./models/Note.js";
import authMiddleware from "./middleware/auth.js";

dotenv.config();
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));




const app = express();

app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET

function validatePassword(password) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  return passwordRegex.test(password);
}

// -------------------- SIGN UP --------------------

app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;

  // Password validation
    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
      });
    }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({ message: "User created successfully" });

  } catch (err) {
    console.error("REAL ERROR:", err); 
    res.status(500).json({ error: err});
  }
});




// -------------------- LOGIN --------------------

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    
    const payload = {
      id: user._id,
      email: user.email
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1d"
    });

    res.json({ token, user });

  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// -------------------- PROTECTED --------------------

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authorized ✅",
    user: req.user
  });
});

// -------------------- SUMMARIZE --------------------

app.post("/api/summarize", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct",
        messages: [
          {
            role: "system",
            content: "You summarize study notes into clear bullet points."
          },
          {
            role: "user",
            content: `Summarize this text into simple bullet points:\n\n${text}`
          }
        ]
      })
    });

    const data = await response.json();

    console.log("Summary Response:", data);

    const rawSummary = data?.choices?.[0]?.message?.content || "";

    console.log("RAW SUMMARY:", rawSummary);

    // 🔥 CLEAN SUMMARY
    let cleanSummary = rawSummary
      .replace(/\*\*/g, "") // remove bold
      .replace(/Here are.*?:/i, "") // remove intro
      .replace(/^\d+\.\s*/gm, "• ") // numbering → bullets
      .trim();

    res.json({ summary: cleanSummary });

  } catch (error) {
    console.error("Summary Error:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// -------------------- FLASHCARDS --------------------

app.post("/api/flashcards", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct",
        messages: [
          {
            role: "system",
            content: "You create study flashcards."
          },
          {
            role: "user",
            content: `
Create exactly 5 flashcards.

IMPORTANT RULES:
- Return ONLY valid JSON
- Add commas between objects
- No explanation or extra text

Format:
[
  { "question": "Q1", "answer": "A1" },
  { "question": "Q2", "answer": "A2" }
]

Text:
${text}
`
          }
        ]
      })
    });

    const data = await response.json();

    console.log("Flashcards Response:", data);

    const content = data?.choices?.[0]?.message?.content || "";

    console.log("RAW FLASHCARDS:", content);

    let flashcards = [];

    try {
      const jsonStart = content.indexOf("[");
      const jsonEnd = content.lastIndexOf("]") + 1;

      let cleanJson = content.slice(jsonStart, jsonEnd);

      // 🔥 Fix missing commas
      cleanJson = cleanJson.replace(/}\s*{/g, "},{");

      flashcards = JSON.parse(cleanJson);

    } catch (err) {
      console.log("Parsing failed. Raw content:", content);

      // fallback if JSON fails
      flashcards = content
        .split("\n")
        .filter(line => line.trim() !== "")
        .map((line, i) => ({
          question: `Flashcard ${i + 1}`,
          answer: line
        }));
    }

    res.json({ flashcards });

  } catch (error) {
    console.error("Flashcard Error:", error);
    res.status(500).json({ error: "Flashcard generation failed" });
  }
});

// -------------------- SAVE NOTES --------------------

app.post("/api/notes", authMiddleware, async (req, res) => {
  const { title, category, text } = req.body;

  if (!title || !category || !text) {
    return res.status(400).json({ error: "Title and text are required" });
  }

  try {
    const newNote = new Note({
      user: req.user.id, 
      title,
      category,
      text
    });

    await newNote.save();

    res.json({ message: "Note saved successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save note" });
  }
});

// -------------------- GET USER NOTES --------------------

app.get("/api/notes", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(notes);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// -------------------- DELETE NOTES --------------------

app.delete("/api/notes/:id", authMiddleware, async (req, res) => {
  try {

    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id 
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note deleted" });

  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// -------------------- UPDATE NOTE --------------------

app.put("/api/notes/:id", authMiddleware, async (req, res) => {
  try {
    const { title, category, text } = req.body;

    if (!title || !category || !text) {
      return res.status(400).json({ error: "Title and text are required" });
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, category, text },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});



// -------------------- SERVER --------------------

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
