"use client";
import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Button, TextField, Snackbar, Alert } from "@mui/material";
import { useRouter } from "next/navigation";
import { getApiBaseUrl, setAuth } from "../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
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
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Login failed. Check your credentials.");
      }

      const data = await res.json();
      setAuth(data.access_token, data.user, data.refresh_token);

      setSuccess(true);
      setError("");
      if (data.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/business");
      }
    } catch (err) {
      setError((err as Error).message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    setAuth("demo-admin-token", {
      id: "demo-admin-id",
      email: "admin@beaconpoint.local",
      role: "admin"
    });
    router.push("/admin");
  };

  const handleBusinessLogin = () => {
    setAuth("demo-owner-token", {
      id: "demo-owner-id",
      email: "owner@beaconpoint.local",
      role: "owner"
    });
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
        <Button type="submit" variant="contained" disabled={loading} sx={{ background: '#6f42c1', color: '#fff', fontWeight: 700, mt: 2, borderRadius: 2, ':hover': { background: '#4b2a7b' } }}>
          {loading ? "Signing In..." : "Sign In"}
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
