import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "mytube-theme";

const normalizeTheme = (storedTheme) => {
  if (storedTheme === "night" || storedTheme === "dark") return "night";
  return "day";
};

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "day";
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return normalizeTheme(storedTheme);
  });

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const dataTheme = theme === "night" ? "dark" : "light";

    root.setAttribute("data-theme", dataTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "day" ? "night" : "day"));
  };

  return { theme, setTheme, toggleTheme };
}
