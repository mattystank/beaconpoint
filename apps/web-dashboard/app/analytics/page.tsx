"use client";
import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Paper, Grid, Card, CardContent, CircularProgress } from "@mui/material";
import { apiRequest } from "../lib/apiClient";

type AnalyticsStats = {
  total_users: number;
  total_screens: number;
  total_ads: number;
  total_bookings: number;
  total_revenue: number;
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<AnalyticsStats>("/analytics", { method: "GET" });
      setStats(data);
    } catch (err: any) {
      setError(err?.detail || "Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>Analytics</Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : stats ? (
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Users</Typography>
                <Typography variant="h4">{stats.total_users}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Screens</Typography>
                <Typography variant="h4">{stats.total_screens}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Ads</Typography>
                <Typography variant="h4">{stats.total_ads}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Bookings</Typography>
                <Typography variant="h4">{stats.total_bookings}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Revenue</Typography>
                <Typography variant="h4">${stats.total_revenue}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : null}
    </Container>
  );
}
