import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();
const getPreferredTheme = () => localStorage.getItem("eta-theme") || "system";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getPreferredTheme);
  useEffect(() => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("eta-theme", theme);
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export const useTheme = () => useContext(ThemeContext);
