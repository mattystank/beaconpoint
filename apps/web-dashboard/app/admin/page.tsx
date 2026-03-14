"use client";
import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Snackbar, Alert } from "@mui/material";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);
  const [screens, setScreens] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const usersRes = await fetch("http://localhost:8010/users");
      const adsRes = await fetch("http://localhost:8010/ads");
      const screensRes = await fetch("http://localhost:8010/screens");
      setUsers(await usersRes.json());
      setAds(await adsRes.json());
      setScreens(await screensRes.json());
    } catch (err) {
      setError("Failed to load admin data.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">Users</Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{u.created_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">Ads</Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Company</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ads.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell>{a.title}</TableCell>
                  <TableCell>{a.status}</TableCell>
                  <TableCell>{a.company_id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box>
        <Typography variant="h6">Screens</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Location</TableCell>
                <TableCell>Venue</TableCell>
                <TableCell>Owner</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {screens.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell>{s.location_name}</TableCell>
                  <TableCell>{s.venue_type}</TableCell>
                  <TableCell>{s.owner_id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess("")}> 
        <Alert severity="success">{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError("")}> 
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Container>
  );
}
