"use client";
import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Snackbar, Alert } from "@mui/material";

export default function ScreensPage() {
  const [screens, setScreens] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchScreens();
  }, []);

  const fetchScreens = async () => {
    try {
      const res = await fetch("http://localhost:8010/screens");
      if (!res.ok) throw new Error("Failed to fetch screens");
      setScreens(await res.json());
    } catch (err) {
      setError("Failed to load screens.");
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
            {screens.map((s: any) => (
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
