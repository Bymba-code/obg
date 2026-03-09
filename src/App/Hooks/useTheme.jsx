import { useContext } from "react";
import { ThemeContext } from "../Providers/ThemeProvider";

export const useTheme = () => useContext(ThemeContext);
