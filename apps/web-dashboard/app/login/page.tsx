"use client";
import React, { useState } from "react";
import { Container, Typography, Box, Button, TextField, Snackbar, Alert } from "@mui/material";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    try {
      // Use the current hostname for backend API to work in Codespaces/dev containers
      const apiHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const apiProtocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https' : 'http';
      const res = await fetch(`${apiProtocol}://${apiHost}:8010/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error("Login failed");
      setSuccess(true);
      setError("");
    } catch (err) {
      setError("Login failed. Check your credentials.");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, p: 4, bgcolor: "rgba(0,0,0,0.7)", borderRadius: 3 }}>
        <Typography variant="h5" align="center" sx={{ color: "#fff", mb: 2 }}>
          Login
        </Typography>
        <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus InputLabelProps={{ style: { color: '#fff' } }} inputProps={{ style: { color: '#fff', background: '#181a1b' } }} />
        <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required InputLabelProps={{ style: { color: '#fff' } }} inputProps={{ style: { color: '#fff', background: '#181a1b' } }} />
        <Button type="submit" variant="contained" sx={{ background: '#6f42c1', color: '#fff', fontWeight: 700, mt: 2, borderRadius: 2, ':hover': { background: '#4b2a7b' } }}>
          Sign In
        </Button>
      </Box>
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError("")}> 
        <Alert severity="error">{error}</Alert>
      </Snackbar>
      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success">Login successful!</Alert>
      </Snackbar>
    </Container>
  );
}
