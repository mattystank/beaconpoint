"use client";


import React, { useState, useRef } from "react";
import { Container, Typography, Box, Divider } from "@mui/material";
import { Card, CardContent, Button, Box as MuiBox } from "@mui/material";
import ModernButton from "@beacon-point/ui/ModernButton";
import ModernInput from "@beacon-point/ui/ModernInput";

// Sample screens data (reuse from marketplace)
const sampleLocations = [
  {
    id: 1,
    name: "Union Station Lobby",
    address: "123 Main St, Baltimore, MD",
    dailyTraffic: 12000,
    hourlyRate: 18,
    slotsFilled: 16,
    slotsTotal: 24,
    tier: 2,
    indoor: true,
    available: true,
    specs: { size: '75"', resolution: "3840x2160", orientation: "Landscape", category: "Transit" },
  },
  {
    id: 2,
    name: "Harborplace Outdoor",
    address: "200 Light St, Baltimore, MD",
    dailyTraffic: 22000,
    hourlyRate: 25,
    slotsFilled: 20,
    slotsTotal: 24,
    tier: 2,
    indoor: false,
    available: true,
    specs: { size: '85"', resolution: "3840x2160", orientation: "Landscape", category: "Outdoor" },
  },
  // ...add more as needed
];

// Sample ads data (placeholder)
const myAds = [
  {
    id: 1,
    name: "Spring Sale",
    screen: "Union Station Lobby",
    budget: 500,
    start: "2024-06-01",
    end: "2024-06-07",
    status: "Active",
  },
  {
    id: 2,
    name: "Summer Promo",
    screen: "Harborplace Outdoor",
    budget: 800,
    start: "2024-07-01",
    end: "2024-07-15",
    status: "Scheduled",
  },
];

export default function BusinessDashboard() {
  const screensRef = useRef<HTMLDivElement>(null);
  const adsRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
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
    <Container maxWidth="xl" sx={{ py: 6, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
      {/* Side Nav */}
      <Box
        sx={{
          minWidth: 210,
          maxWidth: 220,
          position: { xs: 'sticky', md: 'sticky' },
          top: 32,
          alignSelf: 'flex-start',
          background: 'rgba(24,24,27,0.98)',
          borderRadius: 4,
          boxShadow: 3,
          border: '1px solid #23232a',
          p: 3,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Typography variant="h6" sx={{ color: '#6f42c1', fontWeight: 800, mb: 2, fontFamily: 'DM Serif Display, serif', letterSpacing: -1 }}>Business</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button onClick={() => screensRef.current?.scrollIntoView({ behavior: 'smooth' })} sx={{ justifyContent: 'flex-start', color: '#fff', fontWeight: 700, borderRadius: 2, textTransform: 'none', px: 2, py: 1, '&:hover': { background: '#23232a', color: '#6f42c1' } }}>My Screens</Button>
          <Button onClick={() => adsRef.current?.scrollIntoView({ behavior: 'smooth' })} sx={{ justifyContent: 'flex-start', color: '#fff', fontWeight: 700, borderRadius: 2, textTransform: 'none', px: 2, py: 1, '&:hover': { background: '#23232a', color: '#6f42c1' } }}>My Ads</Button>
          <Button onClick={() => settingsRef.current?.scrollIntoView({ behavior: 'smooth' })} sx={{ justifyContent: 'flex-start', color: '#fff', fontWeight: 700, borderRadius: 2, textTransform: 'none', px: 2, py: 1, '&:hover': { background: '#23232a', color: '#6f42c1' } }}>Business Settings</Button>
        </Box>
      </Box>
      {/* Main Content */}
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', mb: 3, gap: 3, flexWrap: 'wrap' }}>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontFamily: 'DM Serif Display, serif',
              color: '#fff',
              fontWeight: 700,
              fontSize: { xs: 32, sm: 40 },
              letterSpacing: -1,
              lineHeight: 1.1,
              mb: 0,
              mr: 2
            }}
          >
            Business <Box component="span" sx={{ color: '#6f42c1', fontStyle: 'italic', fontWeight: 700 }}>dashboard</Box>
          </Typography>
        </Box>

        {/* My Screens Section */}
        <Box ref={screensRef} sx={{ mt: 5, mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#fff', fontFamily: 'DM Serif Display, serif' }}>My Screens</Typography>
          <MuiBox sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 4 }}>
            {sampleLocations.map((screen) => {
              const fillRate = Math.round((screen.slotsFilled / screen.slotsTotal) * 100);
              // Badge color logic
              let badgeBg = '#FCEBEB', badgeColor = '#791F1F';
              if (screen.tier === 2) { badgeBg = '#EAF3DE'; badgeColor = '#27500A'; }
              else if (screen.tier === 1) { badgeBg = '#FAEEDA'; badgeColor = '#633806'; }
              // Fill bar color logic
              let fillBar = '#EF9F27';
              if (fillRate >= 90) fillBar = '#E24B4A';
              else if (fillRate <= 50) fillBar = '#639922';
              return (
                <Card
                  key={screen.id}
                  sx={{
                    background: '#18181B',
                    color: '#fff',
                    borderRadius: 3,
                    boxShadow: 3,
                    border: '0.5px solid #333',
                    overflow: 'hidden',
                    transition: 'border-color 0.15s, transform 0.15s',
                    '&:hover': { borderColor: '#6f42c1', transform: 'translateY(-2px)' },
                    p: 0
                  }}
                >
                  {/* Badge */}
                  <MuiBox sx={{ position: 'relative', height: 16, p: 2 }}>
                    <MuiBox sx={{
                      fontSize: 11,
                      fontWeight: 500,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 40,
                      background: badgeBg,
                      color: badgeColor,
                      letterSpacing: '0.04em',
                      display: 'inline-block',
                      mb: 0.5
                    }}>{screen.tier === 2 ? 'High' : screen.tier === 1 ? 'Medium' : 'Low'} traffic</MuiBox>
                  </MuiBox>
                  <CardContent sx={{ p: '14px 16px 16px', background: '#18181B' }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 500, mb: 0.5, color: '#fff' }}>{screen.name}</Typography>
                    <Box sx={{ fontSize: 12, color: '#aaa', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <svg width="10" height="12" viewBox="0 0 10 12" fill="none" style={{ flexShrink: 0 }}><path d="M5 0C3.07 0 1.5 1.57 1.5 3.5c0 2.63 3.5 6.5 3.5 6.5s3.5-3.87 3.5-6.5C8.5 1.57 6.93 0 5 0zm0 4.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" fill="#ccc"/></svg>
                      {screen.address}
                    </Box>
                    {/* Stats grid */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
                      <Box sx={{ background: '#222', borderRadius: 2, p: '8px 10px' }}>
                        <Box sx={{ fontSize: 11, color: '#aaa', mb: 0.5 }}>Daily traffic</Box>
                        <Box sx={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{screen.dailyTraffic.toLocaleString()}</Box>
                      </Box>
                      <Box sx={{ background: '#222', borderRadius: 2, p: '8px 10px' }}>
                        <Box sx={{ fontSize: 11, color: '#aaa', mb: 0.5 }}>Rate / hour</Box>
                        <Box sx={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>${screen.hourlyRate}</Box>
                      </Box>
                    </Box>
                    {/* Slots filled bar */}
                    <Box sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', mb: 0.5 }}>
                        <span>Slots filled</span>
                        <span>{screen.slotsFilled}/{screen.slotsTotal} — <b style={{ color: '#fff' }}>{screen.slotsTotal - screen.slotsFilled} open</b></span>
                      </Box>
                      <Box sx={{ height: 6, background: '#222', borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ width: `${fillRate}%`, height: '100%', background: fillBar, borderRadius: 3 }} />
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        fontSize: 13,
                        fontWeight: 500,
                        py: 1.2,
                        border: '0.5px solid #6f42c1',
                        borderRadius: 2,
                        background: 'transparent',
                        color: '#fff',
                        textTransform: 'none',
                        mt: 1,
                        '&:hover': { background: '#23232a', borderColor: '#fff' }
                      }}
                    >View details</Button>
                  </CardContent>
                </Card>
              );
            })}
          </MuiBox>
        </Box>

      <Divider sx={{ my: 4, borderColor: '#333' }} />

      {/* My Ads Section */}
        <Box ref={adsRef} sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#fff', fontFamily: 'DM Serif Display, serif' }}>My Ads</Typography>
          <MuiBox sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 4 }}>
            {myAds.map((ad) => (
              <Card
                key={ad.id}
                sx={{
                  background: '#18181B',
                  color: '#fff',
                  borderRadius: 3,
                  boxShadow: 3,
                  border: '0.5px solid #333',
                  overflow: 'hidden',
                  transition: 'border-color 0.15s, transform 0.15s',
                  '&:hover': { borderColor: '#6f42c1', transform: 'translateY(-2px)' },
                  p: 0
                }}
              >
                <CardContent sx={{ p: '14px 16px 16px', background: '#18181B' }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 500, mb: 0.5, color: '#fff' }}>{ad.name}</Typography>
                  <Box sx={{ fontSize: 12, color: '#aaa', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" style={{ flexShrink: 0 }}><path d="M5 0C3.07 0 1.5 1.57 1.5 3.5c0 2.63 3.5 6.5 3.5 6.5s3.5-3.87 3.5-6.5C8.5 1.57 6.93 0 5 0zm0 4.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" fill="#ccc"/></svg>
                    {ad.screen}
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
                    <Box sx={{ background: '#222', borderRadius: 2, p: '8px 10px' }}>
                      <Box sx={{ fontSize: 11, color: '#aaa', mb: 0.5 }}>Budget</Box>
                      <Box sx={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>${ad.budget}</Box>
                    </Box>
                    <Box sx={{ background: '#222', borderRadius: 2, p: '8px 10px' }}>
                      <Box sx={{ fontSize: 11, color: '#aaa', mb: 0.5 }}>Status</Box>
                      <Box sx={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{ad.status}</Box>
                    </Box>
                  </Box>
                  <Box sx={{ fontSize: 13, color: '#B0B0C3', mb: 1 }}>
                    <b>Dates:</b> {ad.start} to {ad.end}
                  </Box>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      fontSize: 13,
                      fontWeight: 500,
                      py: 1.2,
                      border: '0.5px solid #6f42c1',
                      borderRadius: 2,
                      background: 'transparent',
                      color: '#fff',
                      textTransform: 'none',
                      mt: 1,
                      '&:hover': { background: '#23232a', borderColor: '#fff' }
                    }}
                  >View details</Button>
                </CardContent>
              </Card>
            ))}
          </MuiBox>
        </Box>

        <Divider sx={{ my: 4, borderColor: '#333' }} />

        {/* Existing business dashboard features */}
        <Box ref={settingsRef} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mt: 4 }}>
          <Box sx={{ background: '#18181B', borderRadius: 3, p: 4, boxShadow: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#fff', fontFamily: 'DM Serif Display, serif' }}>Update Plan</Typography>
            <ModernInput
              label="Plan"
              value={plan}
              onChange={(e: any) => setPlan(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <ModernButton onClick={handlePlanUpdate} fullWidth>Update Plan</ModernButton>
          </Box>
          <Box sx={{ background: '#18181B', borderRadius: 3, p: 4, boxShadow: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#fff', fontFamily: 'DM Serif Display, serif' }}>Update Settings</Typography>
            <ModernInput
              label="Email"
              value={settings.email}
              onChange={(e: any) => setSettings({ ...settings, email: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <ModernInput
              label="Phone"
              value={settings.phone}
              onChange={(e: any) => setSettings({ ...settings, phone: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <ModernButton onClick={handleSettingsUpdate} fullWidth>Update Settings</ModernButton>
          </Box>
          <Box sx={{ background: '#18181B', borderRadius: 3, p: 4, boxShadow: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#fff', fontFamily: 'DM Serif Display, serif' }}>Contact Support</Typography>
            <ModernInput
              label="Message"
              value={supportMessage}
              onChange={(e: any) => setSupportMessage(e.target.value)}
              fullWidth
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            <ModernButton onClick={handleSupportRequest} fullWidth>Send Request</ModernButton>
          </Box>
          <Box sx={{ background: '#18181B', borderRadius: 3, p: 4, boxShadow: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#fff', fontFamily: 'DM Serif Display, serif' }}>Add Ad to Another Screen</Typography>
            <ModernInput
              label="Ad Title"
              value={adDetails.title}
              onChange={(e: any) => setAdDetails({ ...adDetails, title: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <ModernInput
              label="Screen Location"
              value={adDetails.location}
              onChange={(e: any) => setAdDetails({ ...adDetails, location: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <ModernButton onClick={handleAdSubmission} fullWidth>Submit Ad</ModernButton>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}