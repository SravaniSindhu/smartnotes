import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const toastTimer = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const [loading, setLoading] = useState(false);

  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);
  };

  const showMessage = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);

    if (toastTimer.current) clearTimeout(toastTimer.current);

    toastTimer.current = setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
      showMessage("Please fill all fields", "error");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be 8+ chars, include uppercase, lowercase, number, and special character"
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (data.message) {
        showMessage("Signup successful! Redirecting...", "success");

        setTimeout(() => navigate("/login"), 1200);
      } else {
        if (typeof data.error === "object") {
            if (data.error.code === 11000) {
                showMessage("Email already exists", "error");
            } else {
                showMessage("Something went wrong", "error");
            }
            } else {
            showMessage(data.error || "Signup failed", "error");
            }
        }
    } catch (err) {
      console.error(err);
      showMessage("Signup failed. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }

    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [navigate]);

  return (
    <>
      {/* 🔹 Page Container */}
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to right, #eef2f3, #dfe9f3)",
          padding: "20px",
        }}
      >
        {/* 🔹 Card */}
        <div
          className="card shadow-lg p-5"
          style={{
            width: "400px",
            borderRadius: "15px",
          }}
        >
          <h2 className="text-center mb-4">Signup</h2>

          <input
            type="text"
            className="form-control mb-3"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            className="form-control mb-3"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className={`form-control mb-2 ${error ? "is-invalid" : ""}`}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />

          {error && <div className="invalid-feedback">{error}</div>}


          <button
            className="btn btn-success w-100 mb-3"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? "Signing up..." : "Signup"}
          </button>

          <p className="text-center mb-0">
            Already have an account?{" "}
            <span
              style={{
                color: "#0d6efd",
                cursor: "pointer",
                fontWeight: "500",
              }}
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </div>
      </div>

      {/* 🔔 Toast */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        <div
          className={`toast align-items-center text-white border-0 ${
            showToast ? "show" : ""
          } ${toastType === "success" ? "bg-success" : "bg-danger"}`}
        >
          <div className="d-flex">
            <div className="toast-body">{toastMsg}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setShowToast(false)}
            ></button>
          </div>
        </div>
      </div>
    </>
  );
}
