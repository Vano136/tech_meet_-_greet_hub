import React from "react";
import { SunIcon, MoonIcon, Sun, Moon } from "./Icons";

interface ThemeToggleProps {
  theme: "dark" | "light";
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  const SunComponent = SunIcon || Sun;
  const MoonComponent = MoonIcon || Moon;

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: "none",
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        padding: "6px 10px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-primary)",
      }}
      title="თემის შეცვლა"
    >
      {theme === "dark" ? <SunComponent size={18} /> : <MoonComponent size={18} />}
    </button>
  );
};