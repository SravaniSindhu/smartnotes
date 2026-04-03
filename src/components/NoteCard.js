import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function NoteCard({ note, onDelete, mode }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="md-4 mb-3">
      <div
        className="card shadow-sm h-100 p-3"
        style={{
          borderRadius: "12px",
          border: "1px solid #ddd",
          backgroundColor: mode === "dark" ? "#1f1f1f" : "white",
          color: mode === "dark" ? "white" : "black",
        }}
      >
        <div className="card-body d-flex flex-column">

          {/* -------- TITLE -------- */}
          <h5 className="card-title fw-bold">
            {note?.title || "Untitled"}
          </h5>

          {/* -------- CATEGORY -------- */}
          <span
            className="badge mb-2"
            style={{
              backgroundColor: "#0dcaf0",
              width: "fit-content",
            }}
          >
            {note?.category || "General"}
          </span>

          {/* -------- TEXT PREVIEW -------- */}
          <p className="card-text mt-2" style={{ lineHeight: "1.6" }}>
            {(note?.text || "").substring(0, 160)}
            {note?.text && note.text.length > 160 && "..."}
          </p>

          {/* -------- READ MORE -------- */}
          <button
            type="button"
            className="btn btn-link p-0 mb-3"
            onClick={() =>
              navigate(`/note/${note._id}`, { state: note })  // ✅ FIXED
            }
          >
            Read More
          </button>

          {/* -------- ACTION BUTTONS -------- */}
          <div className="mt-auto d-flex gap-2">

            {/* EDIT */}
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() =>
                navigate("/save-note", {
                  state: {
                    noteId: note._id,   // ✅ FIXED
                    title: note.title,
                    category: note.category,
                    text: note.text,
                  },
                })
              }
            >
              Edit
            </button>

            {/* DELETE */}
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => setShowModal(true)}  // ✅ open modal
            >
              Delete
            </button>

          </div>
        </div>
      </div>

      {/* ================= DELETE MODAL ================= */}
      {showModal && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className={`modal-content ${
                mode === "dark" ? "bg-dark text-white" : ""
              }`}
            >
              {/* HEADER */}
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
              </div>

              {/* BODY */}
              <div className="modal-body">
                Are you sure you want to delete this note?
              </div>

              {/* FOOTER */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    onDelete(note._id);   // 🔥 backend call from parent
                    setShowModal(false);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoteCard;
