import React from "react";
import { Card, CardContent, CardActions, Typography, Button } from "@mui/material";

export default function ModernCard({
  title,
  description,
  price,
  onAction,
  actionLabel = "Book Now",
  children,
}: {
  title: string;
  description: string;
  price: string;
  onAction?: () => void;
  actionLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card
      sx={{
        minHeight: 240,
        borderRadius: 4,
        boxShadow: 6,
        background: "rgba(0,0,0,0.85)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <CardContent>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Typography variant="h6" color="primary.main" fontWeight={700}>
          {price}
        </Typography>
        {children}
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ fontWeight: 700, fontSize: "1.1rem" }}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </CardActions>
    </Card>
  );
}
