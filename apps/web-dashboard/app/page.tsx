import React from 'react';
import { Typography, Container, Box, Button, Paper } from '@mui/material';

export default function HomePage() {
  return (
    <Container maxWidth="md" sx={{ mt: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={6} sx={{
        p: 6,
        borderRadius: 6,
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        border: '1px solid rgba(255,255,255,0.18)',
        maxWidth: 600,
        width: '100%',
        textAlign: 'center',
      }}>
        <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: -2, mb: 2, color: '#24292f' }}>
          <span style={{ color: '#6f42c1' }}>Beacon</span> Point
        </Typography>
        <Typography variant="h5" sx={{ color: "white", mb: 3 }}>
          Digital Signage Marketplace
        </Typography>
        <Typography sx={{ mb: 4, color: 'white', fontSize: 20 }}>
          Connect your business with real-world audiences.<br />
          Buy and sell ad space on physical screens.<br />
          <span style={{ color: '#6f42c1', fontWeight: 600 }}>Modern. Secure. Effortless.</span>
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button href="/marketplace" variant="contained" size="large" sx={{
            background: 'linear-gradient(90deg, #6f42c1 0%, #24292f 100%)',
            color: '#fff',
            fontWeight: 700,
            px: 4,
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(111,66,193,0.15)',
            textTransform: 'none',
          }}>
            Explore Marketplace
          </Button>
          <Button href="/ads" variant="outlined" size="large" sx={{
            color: '#6f42c1',
            borderColor: '#6f42c1',
            fontWeight: 700,
            px: 4,
            borderRadius: 3,
            textTransform: 'none',
            background: 'rgba(255,255,255,0.5)',
            '&:hover': { background: 'rgba(111,66,193,0.08)' }
          }}>
            Upload Ad
          </Button>
        </Box>
      </Paper>
      <Box sx={{ mt: 8, color: '#57606a', fontSize: 16, textAlign: 'center' }}>
        <span style={{ fontWeight: 600 }}>Beacon Point</span> is inspired by the best of modern SaaS and GitHub design.<br />
        <span style={{ color: '#6f42c1' }}>Glassmorphic UI</span>, <span style={{ color: '#24292f' }}>gradient accents</span>, and a focus on usability.
      </Box>
    </Container>
  );
}
