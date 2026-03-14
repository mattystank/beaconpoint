"use client";
import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Grid, Card, CardContent } from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

export default function AdminDashboard() {
  const [openSlots, setOpenSlots] = useState([]);
  const [pendingAds, setPendingAds] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);

  useEffect(() => {
    // Fetch open slots, pending ads, and payments (mock data for now)
    setOpenSlots([
      { title: "Lobby TV Slot", date: "2026-03-15" },
      { title: "Conference Room Slot", date: "2026-03-16" },
    ]);
    setPendingAds([
      { id: 1, name: "Ad for Product A", location: "Lobby TV" },
      { id: 2, name: "Ad for Product B", location: "Conference Room" },
    ]);
    setPendingPayments([
      { id: 1, name: "Ad for Product C", amount: "$100" },
      { id: 2, name: "Ad for Product D", amount: "$200" },
    ]);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Admin Dashboard
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Open Slots Calendar
        </Typography>
        <FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" events={openSlots} />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Pending Ads for Approval
              </Typography>
              {pendingAds.map((ad) => (
                <Typography key={ad.id}>
                  {ad.name} - {ad.location}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Pending Payments
              </Typography>
              {pendingPayments.map((payment) => (
                <Typography key={payment.id}>
                  {payment.name} - {payment.amount}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
