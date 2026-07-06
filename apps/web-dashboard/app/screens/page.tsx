"use client";
import React, { useEffect, useState } from "react";
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Snackbar, Alert } from "@mui/material";
import { apiRequest } from "../lib/apiClient";

type ScreenRow = {
  id: string;
  location_name: string;
  venue_type: string;
  status: string;
};

export default function ScreensPage() {
  const [screens, setScreens] = useState<ScreenRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchScreens();
  }, []);

  const fetchScreens = async () => {
    try {
      const data = await apiRequest<ScreenRow[]>("/screens", { method: "GET" });
      setScreens(data);
    } catch (err: any) {
      setError(err?.detail || "Failed to load screens.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>My Screens</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Location</TableCell>
              <TableCell>Venue</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {screens.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.location_name}</TableCell>
                <TableCell>{s.venue_type}</TableCell>
                <TableCell>{s.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError("")}> 
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Container>
  );
}
