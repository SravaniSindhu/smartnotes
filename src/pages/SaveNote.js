import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function SaveNote({ notes, setNotes }) {

  const navigate = useNavigate();
  const location = useLocation();

  
  const noteId = location.state?.noteId;

  const [title, setTitle] = useState(location.state?.title || "");
  const [category, setCategory] = useState(location.state?.category || "");
  const [text, setText] = useState(location.state?.text || "");

  const [showToast, setShowToast] = useState(false);

  const handleSave = async () => {

    try {
      const token = localStorage.getItem("token");

      const url = noteId
        ? `http://localhost:5000/api/notes/${noteId}`   // UPDATE
        : "http://localhost:5000/api/notes";            // CREATE

      const method = noteId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,  
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({
          title,
          category,
          text
        })
      });

      const data = await res.json();
      console.log("Saved:", data);
      navigate("/saved-notes");

    } catch (err) {
      console.error(err);
    }
  };



     
   

  const handleCancel = () => {

    navigate("/", { state: { text } });

  };

  return (
    <div className="container mt-5 pt-4">

      <h3 className="mb-4">Save Note</h3>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Enter Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Enter Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <textarea
        className="form-control mb-4"
        rows="6"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="d-flex gap-3">

        <button
          className="btn btn-success"
          onClick={handleSave}
        >
          Save
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleCancel}
        >
          Cancel
        </button>

      </div>

      {/* Toast message */}

       {showToast && (
  <div
    className="position-fixed top-0 end-0 p-3"
    style={{ zIndex: 9999 }}
  >
    <div className="toast show">

      <div className="toast-header">
        <strong className="me-auto">SmartNotes</strong>
      </div>

      <div className="toast-body">
        Please enter Title and Category
      </div>

    </div>
  </div>
)}
   </div>

  );
}