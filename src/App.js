import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";


import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import SaveNote from "./pages/SaveNote";
import SavedNotes from "./pages/SavedNotes";
import NoteDetails from "./pages/NoteDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";



function App() {

  // THEME STATE
  const [mode, setMode] = useState("light");

  const toggleTheme = () => {

    const newMode = mode === "light" ? "dark" : "light";

    setMode(newMode);

    document.body.className = newMode;

  };

  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/signup";

  const [notes, setNotes] = useState([]);

  return (

   
    <>
      {!hideNavbar && (
        <Navbar mode={mode} toggleTheme={toggleTheme} />
      )}

      <Routes>

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/login" 
          element={
              <Login />
          }
        />

        <Route 
          path="/signup" 
          element={
              <Signup />
          }
        />

        <Route
          path="/save-note"
          element={
            <ProtectedRoute>
              <SaveNote notes={notes} setNotes={setNotes} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/saved-notes"
          element={
            <ProtectedRoute>
              <SavedNotes notes={notes} setNotes={setNotes} />
            </ProtectedRoute>
          }
        />
      
        <Route
          path="/note/:id"
          element={
            <ProtectedRoute>
              <NoteDetails notes={notes}  mode={mode}/>
            </ProtectedRoute>
          }
        />

      </Routes>

    </>

  );

}

export default App;





