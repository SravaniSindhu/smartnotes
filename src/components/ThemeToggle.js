import React, { useState, useEffect } from "react";

function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.className = savedTheme;
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem("theme", newTheme);
  };

  return (
    <i
      className={`bi ${theme === "light" ? "bi-moon" : "bi-sun"} fs-4`}
      style={{ cursor: "pointer" }}
      onClick={toggleTheme}
    ></i>
  );
}

export default ThemeToggle;
