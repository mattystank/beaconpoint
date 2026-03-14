import React from "react";
import { Button } from "@mui/material";

export default function ModernButton(props: any) {
  return (
    <Button
      variant="contained"
      color="primary"
      sx={{
        fontWeight: 700,
        borderRadius: 3,
        fontSize: "1.1rem",
        boxShadow: 3,
        textTransform: "none",
      }}
      {...props}
    />
  );
}
