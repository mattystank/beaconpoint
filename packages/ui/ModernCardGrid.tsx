import React from "react";
import { Grid } from "@mui/material";

export default function ModernCardGrid({ children }: { children: React.ReactNode }) {
  return (
    <Grid container spacing={4} sx={{ mt: 2 }}>
      {children}
    </Grid>
  );
}
