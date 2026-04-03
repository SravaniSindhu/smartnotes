import React, { useState } from "react";
import NoteCard from "../components/NoteCard";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useRef } from "react";

export default function SavedNotes() {

  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const toastTimer = useRef(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const showMessage = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);

    // clear previous timer (important)
    if (toastTimer.current) clearTimeout(toastTimer.current);

    toastTimer.current = setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/notes", {
        headers: {
          Authorization: token,
        },
      });

      const data = await res.json();
      if (Array.isArray(data)) {
        setNotes(data);
      } else {
        console.error("Invalid response:", data);
        setNotes([]);
      }

    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/notes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });

      const data = await res.json();

      if (data.message) {
        setNotes((prev) => prev.filter((note) => note._id !== id));
        showMessage("Note deleted", "success");
      } else {
        showMessage(data.error || "Delete failed", "error");
      }

    } catch (err) {
      console.error(err);
      showMessage("Something went wrong", "error");
    }
  };

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortType, setSortType] = useState("date");
  const [visibleCount, setVisibleCount] = useState(6);

  // -------- CATEGORY LIST --------
  const categories = [
    "All",
    ...new Set(notes.map((n) => n.category || "General"))
  ];

  // -------- FILTER + SORT --------
  const filteredNotes = notes
    .filter((note) => {

      const title = note?.title || "";
      const category = note?.category || "";
      const text = note?.text || "";

      const matchesSearch =
        title.toLowerCase().includes(search.toLowerCase()) ||
        category.toLowerCase().includes(search.toLowerCase()) ||
        text.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || category === selectedCategory;

      return matchesSearch && matchesCategory;

    })
    .sort((a, b) => {

      if (sortType === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }

      // default: sort by date
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);

    });

  const visibleNotes = filteredNotes.slice(0, visibleCount);

  return (

    <div className="container mt-5 pt-4">

      {/* -------- HEADER -------- */}
      <div className="d-flex align-items-center justify-content-between mb-4">

        <button
          className="btn btn-secondary"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>

        <h3 className="m-0 text-center flex-grow-1">
          Saved Notes
        </h3>

        <div style={{ width: "120px" }}></div>

      </div>

      {/* -------- SEARCH + SORT -------- */}
      <div className="d-flex gap-3 mb-4">

        <input
          type="text"
          className="form-control"
          placeholder="Search by title, category or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="btn-group">

          <button
            className={`btn btn-outline-secondary ${
              sortType === "date" ? "active" : ""
            }`}
            onClick={() => setSortType("date")}
          >
            Sort by Date
          </button>

          <button
            className={`btn btn-outline-secondary ${
              sortType === "title" ? "active" : ""
            }`}
            onClick={() => setSortType("title")}
          >
            Sort by Title
          </button>

        </div>

      </div>

      <div className="row">

        {/* -------- CATEGORY SIDEBAR -------- */}
        <div className="col-md-3 mb-4">

          <h6>Categories</h6>

          <ul className="list-group">

            {categories.map((cat, index) => (

              <li
                key={index}
                className={`list-group-item ${
                  selectedCategory === cat ? "active" : ""
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </li>

            ))}

          </ul>

        </div>

        {/* -------- NOTES GRID -------- */}
        <div className="col-md-9">
          <div className="row">

            {notes.length === 0 ? (
              <p className="text-center mt-4">No notes yet</p>
            ) : (
              visibleNotes.map((note) => (
                <div key={note._id} className="col-12 col-md-6 col-lg-4">
                  <NoteCard
                    note={note}
                    onDelete={handleDelete}
                    
                  />
                </div>
              ))
            )}

          </div>

          {/* -------- LOAD MORE -------- */}
          {visibleCount < filteredNotes.length && (
            <div className="text-center mt-3">
              <button
                className="btn btn-primary"
                onClick={() => setVisibleCount(visibleCount + 6)}
              >
                Load More
              </button>
            </div>
          )}
        </div>


    </div>

  </div>

  );
}
