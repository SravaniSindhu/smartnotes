import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const toastTimer = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const [loading, setLoading] = useState(false);

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

  const handleLogin = async () => {
    if (!email || !password) {
      showMessage("Please fill all fields", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        showMessage("Login successful!", "success");

        setTimeout(() => navigate("/"), 1000);
      } else {
        showMessage(data.error || "Invalid credentials", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("Login failed. Try again.", "error");
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
          <h2 className="text-center mb-4">Login</h2>

          <input
            type="email"
            className="form-control mb-3"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="form-control mb-4"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="btn btn-primary w-100 mb-3"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center mb-0">
            Don't have an account?{" "}
            <span
              style={{
                color: "#0d6efd",
                cursor: "pointer",
                fontWeight: "500",
              }}
              onClick={() => navigate("/signup")}
            >
              Signup
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
