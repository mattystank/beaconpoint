"use client";
import React, { useState } from "react";
import { Container, Typography, Box, Button, TextField, MenuItem, Snackbar, Alert } from "@mui/material";

const mediaTypes = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" }
];

export default function AdsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [mediaUrl, setMediaUrl] = useState("");
  const [duration, setDuration] = useState(15);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !mediaUrl || !duration) {
      setError("All fields are required.");
      return;
    }
    if (typeof duration !== "number" || duration <= 0) {
      setError("Duration must be a positive number.");
      return;
    }
    try {
      // Simple URL validation
      const urlPattern = /^(https?:\/\/)[^\s]+$/;
      if (!urlPattern.test(mediaUrl)) {
        setError("Media URL must be a valid URL starting with http(s)://");
        return;
      }
      const res = await fetch("http://localhost:8010/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          media_type: mediaType,
          media_url: mediaUrl,
          duration_seconds: duration,
          status: "active"
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.detail || "Failed to upload ad.");
        return;
      }
      setSuccess(true);
      setTitle("");
      setDescription("");
      setMediaUrl("");
      setDuration(15);
    } catch (err: any) {
      setError(err?.message || "Failed to upload ad.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Upload New Ad
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} multiline rows={2} />
        <TextField select label="Media Type" value={mediaType} onChange={e => setMediaType(e.target.value)}>
          {mediaTypes.map(option => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </TextField>
        <TextField label="Media URL" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} required />
        <TextField label="Duration (seconds)" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} required />
        <Button type="submit" variant="contained" color="primary">Upload Ad</Button>
      </Box>
      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success">Ad uploaded successfully!</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError("")}> 
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Container>
  );
}
