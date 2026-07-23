 import { createContext, useContext, useEffect, useState } from "react";

 const ThemeContext = createContext();

 export const ThemeProvider = ({ children }) => {
   // Load saved theme or default to light
   const [theme, setTheme] = useState(
     localStorage.getItem("theme") || "light"
   );

   useEffect(() => {
     document.body.classList.remove("light", "dark");
     document.body.classList.add(theme);

     localStorage.setItem("theme", theme);
   }, [theme]);

   const toggleTheme = () => {
     setTheme((prev) => (prev === "light" ? "dark" : "light"));
   };

   return (
     <ThemeContext.Provider
       value={{
         theme,
         toggleTheme,
       }}
     >
       {children}
     </ThemeContext.Provider>
   );
 };

 export const useTheme = () => useContext(ThemeContext);