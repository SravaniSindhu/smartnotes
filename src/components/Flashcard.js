import React, { useState } from "react";
import "../styles/Flashcard.css";

export default function Flashcard({ question, answer, mode }) {

  const [flipped, setFlipped] = useState(false);

  return (

    <div
      className="flashcard-container"
      onClick={() => setFlipped(!flipped)}
    >

      <div className={`flashcard ${flipped ? "flipped" : ""}`}>

        {/* Front */}
        <div
          className={`flashcard-front ${
            mode === "dark" ? "dark-card" : ""
          }`}
        >
          <div style={{ width: "70%" }}>
            <h6>Question</h6>
            <p>{question}</p>
          </div>
        </div>

        {/* Back */}
        <div
          className={`flashcard-back ${
            mode === "dark" ? "dark-card" : ""
          }`}
        >
          <div style={{ width: "70%" }}>
            <h6>Answer</h6>
            <p>{answer}</p>
          </div>
        </div>

      </div>

    </div>

  );
}
