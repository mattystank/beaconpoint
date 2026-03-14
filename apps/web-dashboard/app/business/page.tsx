"use client";

import React, { useState } from "react";
import { Container, Typography, Box, Button, TextField, Grid, Card, CardContent } from "@mui/material";

export default function BusinessDashboard() {
  const [plan, setPlan] = useState("Basic");
  const [settings, setSettings] = useState({ email: "business@example.com", phone: "123-456-7890" });
  const [supportMessage, setSupportMessage] = useState("");
  const [adDetails, setAdDetails] = useState({ title: "", location: "" });

  const handlePlanUpdate = () => {
    alert(`Plan updated to: ${plan}`);
  };

  const handleSettingsUpdate = () => {
    alert("Settings updated successfully.");
  };

  const handleSupportRequest = () => {
    alert("Support request sent successfully.");
  };

  const handleAdSubmission = () => {
    alert(`Ad submitted: ${adDetails.title} for ${adDetails.location}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Business Dashboard
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Update Plan
              </Typography>
              <TextField
                label="Plan"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                fullWidth
                margin="normal"
              />
              <Button variant="contained" onClick={handlePlanUpdate}>
                Update Plan
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Update Settings
              </Typography>
              <TextField
                label="Email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                fullWidth
                margin="normal"
              />
              <Button variant="contained" onClick={handleSettingsUpdate}>
                Update Settings
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Contact Support
              </Typography>
              <TextField
                label="Message"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={4}
              />
              <Button variant="contained" onClick={handleSupportRequest}>
                Send Request
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Add Ad to Another Screen
              </Typography>
              <TextField
                label="Ad Title"
                value={adDetails.title}
                onChange={(e) => setAdDetails({ ...adDetails, title: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Screen Location"
                value={adDetails.location}
                onChange={(e) => setAdDetails({ ...adDetails, location: e.target.value })}
                fullWidth
                margin="normal"
              />
              <Button variant="contained" onClick={handleAdSubmission}>
                Submit Ad
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}