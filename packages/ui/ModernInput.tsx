import React from "react";
import { TextField } from "@mui/material";

export default function ModernInput(props: any) {
  return (
    <TextField
      variant="outlined"
      size="small"
      sx={{
        background: "rgba(255,255,255,0.08)",
        borderRadius: 2,
        input: { color: "#fff" },
        label: { color: "#fff" },
        minWidth: 120,
      }}
      {...props}
    />
  );
}
