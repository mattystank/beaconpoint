"use client";
import React, { useState } from "react";
import { Container, Typography, Box, Button, TextField, Snackbar, Alert } from "@mui/material";
import { apiRequest } from "../lib/apiClient";

export default function BookingPage() {
  const [screenId, setScreenId] = useState("");
  const [adId, setAdId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function toIsoRangeStart(day: string): string {
    return new Date(`${day}T00:00:00`).toISOString();
  }

  function toIsoRangeEnd(day: string): string {
    return new Date(`${day}T23:59:59`).toISOString();
  }

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
      const isoStart = toIsoRangeStart(startDate);
      const isoEnd = toIsoRangeEnd(endDate);

      const availability = await apiRequest<{ available: boolean; conflicts: Array<{ booking_id: string }> }>(
        `/screens/${encodeURIComponent(screenId)}/availability?start_date=${encodeURIComponent(isoStart)}&end_date=${encodeURIComponent(isoEnd)}`,
        { method: "GET" }
      );

      if (!availability.available) {
        setError("Selected dates are not available for this screen.");
        return;
      }

      await apiRequest<{ id: string; status: string }>("/bookings", {
        method: "POST",
        body: {
          screen_id: screenId,
          ad_id: adId,
          start_date: isoStart,
          end_date: isoEnd,
          total_price: priceNum,
          status: "pending"
        }
      });

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
