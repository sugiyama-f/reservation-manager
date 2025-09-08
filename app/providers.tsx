"use client";

import * as React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "@/lib/theme";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
