import React from "react";
import { Link } from "react-router-dom";

import { useState, useRef, useEffect } from "react";




export default function Navbar({ mode, toggleTheme }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };
  
  useEffect(() => {

  const handleClickOutside = (event) => {

    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setOpen(false);
    }

  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };

}, []);

  return (
    <nav
      className="navbar navbar-expand-lg px-4 fixed-top"
      style={{
        backgroundColor: mode === "dark" ? "#121212" : "#4c6ef5"
      }}
    >

      <div className="container-fluid">

        {/* LEFT SIDE */}

        <div className="d-flex align-items-center gap-4">

          <Link className="navbar-brand text-white fw-bold" to="/">
            SmartNotes
          </Link>

          <Link className="text-white text-decoration-none" to="/">
            Home
          </Link>

          <Link className="text-white text-decoration-none" to="/saved-notes">
            Saved Notes
          </Link>

        </div>

        {/* RIGHT SIDE */}

        <div className="d-flex align-items-center gap-3">

          {/* THEME TOGGLE */}

          <button
            onClick={toggleTheme}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "20px"
            }}
          >
            {mode === "light"
              ? <i className="bi bi-moon-fill"></i>
              : <i className="bi bi-sun-fill"></i>
            }
          </button>

          {/* PROFILE */}

           <div className="position-relative" ref={dropdownRef}>

  <i
    className="bi bi-person-circle fs-4 text-white"
    style={{ cursor: "pointer" }}
    onClick={() => setOpen(!open)}
  ></i>

  {open && (

    <ul
      className={`dropdown-menu show dropdown-menu-end ${
    mode === "dark" ? "dark-dropdown bg-dark text-white" : ""
  }`}
      style={{
        position: "absolute",
        right: 0,
        top: "45px",
        minWidth: "150px"
      }}
    >

    <li>
    <Link className="dropdown-item" to="/">
      Home
    </Link>
  </li>

  <li>
    <Link className="dropdown-item" to="/saved-notes">
      Saved Notes
    </Link>
  </li>

  <li>
    <a className="dropdown-item" onClick={handleLogout}>
      Logout
    </a>
  </li>
  </ul>  

  )}

</div>


   
  

        </div>

      </div>

    </nav>
  );
}