// src/pages/NoteDetails.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Flashcard from "../components/Flashcard";

function parseSummary(rawText) {
  if (!rawText) return [];

  const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);

  const sections = [];
  let currentSection = null;

  lines.forEach(line => {
    if (!line.startsWith("•") && !line.startsWith("*")) {
      if (currentSection) {
        sections.push(currentSection);
      }

      currentSection = {
        title: line,
        points: []
      };
    } else {
      if (currentSection) {
        currentSection.points.push(line.replace(/^[•*]\s*/, ""));
      }
    }
  });

  if (currentSection) sections.push(currentSection);

  return sections;
}


export default function NoteDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const note = location.state;

  const [summary, setSummary] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);

  // 🚨 FIX: Handle null note
  if (!note) {
    return (
      <div className="container mt-4 text-center">
        <h3>Note not found ❌</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/saved-notes")}>
          Go Back
        </button>
      </div>
    );
  }

  // ---------------- SUMMARIZE ----------------
  const handleSummarize = async () => {
    if (!note.text) return;

    try {
      setLoadingSummary(true);

      const res = await fetch("http://localhost:5000/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: note.text }),
      });

      const data = await res.json();

      const parsedSummary = parseSummary(data.summary);
      setSummary(parsedSummary || "No Summary Generated");

    } catch (err) {
      console.error(err);
      setSummary("Error generating summary ❌");
    } finally {
      setLoadingSummary(false);
    }
  };

  // ---------------- FLASHCARDS ----------------
  const handleFlashcards = async () => {
    if (!note.text) return;

    try {
      setLoadingFlashcards(true);

      const res = await fetch("http://localhost:5000/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: note.text }),
      });

      const data = await res.json();

      setFlashcards(data.flashcards || []);

    } catch (err) {
      console.error(err);
      setFlashcards([]);
    } finally {
      setLoadingFlashcards(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>{note.title}</h2>
      <p><strong>Category:</strong> {note.category}</p>
      <p style={{ whiteSpace: "pre-line" }}>
        {note.text}
      </p>

      <div className="d-flex gap-2 mb-3">
        <button
          className="btn btn-primary"
          onClick={handleSummarize}
          disabled={loadingSummary}
        >
          {loadingSummary ? "Summarizing..." : "Summarize"}
        </button>

        <button
          className="btn btn-success"
          onClick={handleFlashcards}
          disabled={loadingFlashcards}
        >
          {loadingFlashcards ? "Generating..." : "Generate Flashcards"}
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
