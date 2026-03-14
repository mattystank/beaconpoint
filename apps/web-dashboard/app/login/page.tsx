"use client";
import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Button, TextField, Snackbar, Alert } from "@mui/material";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [apiHost, setApiHost] = useState("localhost");
  const [apiProtocol, setApiProtocol] = useState("http");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setApiHost(window.location.hostname);
      setApiProtocol(window.location.protocol === "https:" ? "https" : "http");
      console.log(`Using backend URL: ${apiProtocol}://${apiHost}:8010`); // Debugging log
      setHydrated(true);
    }
  }, []);

  if (!hydrated) {
    return null; // Prevent rendering until hydration is complete
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    try {
      // Simulate a successful login without backend
      console.log("Demo mode: Skipping backend authentication.");
      setSuccess(true);
      setError("");
    } catch (err) {
      setError("Login failed. Check your credentials.");
    }
  };

  const handleAdminLogin = () => {
    // Simulate admin login and redirect to admin dashboard
    console.log("Admin logged in");
    router.push("/admin");
  };

  const handleBusinessLogin = () => {
    // Simulate business login and redirect to business dashboard
    console.log("Business logged in");
    router.push("/business");
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
      <Button
        variant="contained"
        sx={{ background: "#6f42c1", color: "#fff", fontWeight: 700, borderRadius: 2, ":hover": { background: "#4b2a7b" } }}
        onClick={handleAdminLogin}
      >
        Login as Admin
      </Button>
      <Button
        variant="contained"
        sx={{ background: "#6f42c1", color: "#fff", fontWeight: 700, borderRadius: 2, ":hover": { background: "#4b2a7b" } }}
        onClick={handleBusinessLogin}
      >
        Login as Business
      </Button>
    </Container>
  );
}
