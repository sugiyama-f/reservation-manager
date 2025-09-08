"use client";
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2563eb" }, // indigo-ish
    secondary: { main: "#0ea5e9" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", borderRadius: 12 } },
    },
    MuiCard: { styleOverrides: { root: { borderRadius: 16 } } },
  },
});
