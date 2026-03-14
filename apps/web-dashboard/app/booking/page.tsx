"use client";
import React, { useState } from "react";
import { Container, Typography, Box, Button, TextField, Snackbar, Alert } from "@mui/material";

export default function BookingPage() {
  const [screenId, setScreenId] = useState("");
  const [adId, setAdId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenId || !adId || !startDate || !endDate || !totalPrice) {
      setError("All fields are required.");
      return;
    }
    const priceNum = parseFloat(totalPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Total price must be a positive number.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be before end date.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8010/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advertiser_id: "demo-user-id",
          screen_id: screenId,
          ad_id: adId,
          start_date: startDate,
          end_date: endDate,
          total_price: priceNum,
          status: "pending"
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.detail || "Failed to book.");
        return;
      }
      setSuccess(true);
      setScreenId("");
      setAdId("");
      setStartDate("");
      setEndDate("");
      setTotalPrice("");
    } catch (err: any) {
      setError(err?.message || "Failed to book.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Book a Screen
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField label="Screen ID" value={screenId} onChange={e => setScreenId(e.target.value)} required />
        <TextField label="Ad ID" value={adId} onChange={e => setAdId(e.target.value)} required />
        <TextField label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} required />
        <TextField label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} required />
        <TextField label="Total Price" type="number" value={totalPrice} onChange={e => setTotalPrice(e.target.value)} required />
        <Button type="submit" variant="contained" color="primary">Book</Button>
      </Box>
      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success">Booking successful!</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError("")}> 
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Container>
  );
}
