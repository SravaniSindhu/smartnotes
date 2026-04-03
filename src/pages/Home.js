// src/pages/Home.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Flashcard from "../components/Flashcard";
import "../styles/Summary.css"

function parseSummary(rawText) {
  if (!rawText) return [];

  const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);

  const sections = [];
  let currentSection = null;

  lines.forEach(line => {
    // If line is NOT a bullet → treat as title
    if (!line.startsWith("•") && !line.startsWith("*")) {
      if (currentSection) {
        sections.push(currentSection);
      }

      currentSection = {
        title: line,
        points: []
      };
    } else {
      // Bullet point
      if (currentSection) {
        currentSection.points.push(line.replace(/^[•*]\s*/, ""));
      }
    }
  });

  if (currentSection) sections.push(currentSection);

  return sections;
}


export default function Home() {
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [summary, setSummary] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);

  // ---------------- SUMMARIZE ----------------
  const handleSummarize = async () => {
  if (!text.trim()) return;

  try {
    setLoadingSummary(true);

    const res = await fetch("http://localhost:5000/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const data = await res.json();

    console.log("RAW:", data.summary);

    const parsedSummary = parseSummary(data.summary);

    console.log("PARSED:", parsedSummary);

    setSummary(parsedSummary);

  } catch (err) {
    console.error("Summary error:", err);
    setSummary([]);
  } finally {
    setLoadingSummary(false);
  }
};


  // ---------------- FLASHCARDS ----------------
  const handleFlashcards = async () => {
    if (!text.trim()) return;

    try {
      setLoadingFlashcards(true);

      const res = await fetch("http://localhost:5000/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      const data = await res.json();

      // Ensure flashcards is always an array
      if (Array.isArray(data?.flashcards)) {
        setFlashcards(data.flashcards);
      } else {
        setFlashcards([]);
      }

    } catch (err) {
      console.error("Flashcard error:", err);
      setFlashcards([]);
    } finally {
      setLoadingFlashcards(false);
    }
  };

  // ---------------- SAVE ----------------
  const handleSave = () => {
    navigate("/save-note", {
      state: {
        text,
        summary,
        flashcards
      }
    });
  };

  return (
    <div className="container mt-4">

      <h2>Enter your text</h2>

      <textarea
        className="form-control mb-3"
        rows={6}
        placeholder="Type your notes here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="d-flex gap-2 mb-3">

        <button
          className="btn btn-primary"
          onClick={handleSummarize}
          disabled={!text || loadingSummary}
        >
          {loadingSummary ? "Summarizing..." : "Summarize"}
        </button>

        <button
          className="btn btn-success"
          onClick={handleFlashcards}
          disabled={!text || loadingFlashcards}
        >
          {loadingFlashcards ? "Generating..." : "Generate Flashcards"}
        </button>

        <button
          className="btn btn-warning"
          onClick={handleSave}
          disabled={!text}
        >
          Save
        </button>

      </div>

      {/* -------- SUMMARY -------- */}

      {summary.length > 0 && (
  <div className="mt-4">
    <h4 className="mb-3">📄 Summary</h4>

    {summary.map((section, index) => (
      <div key={index} className="summary-card">

        <h5 className="summary-title">
          {section.title}
        </h5>

        {section.points.length > 0 && (
          <ul className="summary-list">
            {section.points.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        )}

      </div>
    ))}
  </div>
)}





      {/* -------- FLASHCARDS -------- */}

      {Array.isArray(flashcards) && flashcards.length > 0 && (
        <div>

          <h5>Flashcards</h5>

          <div className="d-flex flex-wrap">

            {flashcards.map((card, index) => (
              <Flashcard
                key={index}
                question={card.question}
                answer={card.answer}
              />
            ))}

          </div>

        </div>
      )}

    </div>
  );
}
