"use client";
import * as React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "@beacon-point/ui";

export default function ThemeProviderClient({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
