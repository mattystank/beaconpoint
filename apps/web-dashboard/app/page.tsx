"use client";
import React from 'react';
import { Typography, Container, Box, Button, Paper, Grid, Card, CardContent, Link as MuiLink } from '@mui/material';
import Navigation from './navigation';

const Purple = '#6f42c1';

export default function HomePage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Grid container spacing={6} alignItems="center" sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Box>
            <Box sx={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: Purple, mb: 2 }}>
              Digital Signage Marketplace
            </Box>
            <Typography variant="h1" sx={{ fontFamily: 'DM Serif Display, serif', fontSize: 54, lineHeight: 1.08, letterSpacing: -1.5, mb: 2 }}>
              Your message,<br /><Box component="em" sx={{ color: Purple, fontStyle: 'italic' }}>everywhere</Box><br />it matters.
            </Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 300, lineHeight: 1.7, color: 'text.secondary', mb: 3, maxWidth: 340 }}>
              Buy and sell ad space on physical screens across the country. Real audiences. Real places. Real results.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Button variant="contained" sx={{ background: Purple, color: '#fff', borderRadius: 5, px: 3, fontWeight: 500 }}>Browse screens</Button>
              <MuiLink href="#" underline="none" sx={{ fontSize: 14, color: Purple, display: 'flex', alignItems: 'center', gap: 1 }}>
                List your screen
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }}>
                  <path d="M2 7h10M7 2l5 5-5 5" />
                </svg>
              </MuiLink>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'relative', height: 320 }}>
            <Box sx={{ position: 'absolute', width: 260, height: 200, background: '#1A1A1A', top: 20, left: 30, borderRadius: 2, border: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: '#F5F2EE', fontFamily: 'DM Serif Display, serif', fontSize: 15, textAlign: 'center', lineHeight: 1.3, width: '80%' }}>
                Your brand.<br />Their street.
              </Typography>
            </Box>
            <Box sx={{ position: 'absolute', width: 120, height: 90, background: Purple, top: 0, right: 10, opacity: 0.92, borderRadius: 2 }} />
            <Box sx={{ position: 'absolute', width: 140, height: 80, background: '#2A2A2A', bottom: 50, right: 0, borderRadius: 2, border: '0.5px solid rgba(255,255,255,0.1)' }} />
            <Box sx={{ position: 'absolute', bottom: 30, left: 20, background: 'background.paper', border: '0.5px solid', borderColor: 'divider', borderRadius: 5, px: 2, py: 1, fontSize: 12, fontWeight: 500, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: '#4CAF50', flexShrink: 0 }} />
              847 screens live now
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Stats Section */}
      <Grid container spacing={0} sx={{ my: 8, borderRadius: 3, overflow: 'hidden', border: '0.5px solid', borderColor: 'divider', background: 'divider' }}>
        <Grid item xs={12} md={4}><Box sx={{ background: 'background.paper', p: 4, borderRadius: 2, textAlign: 'center' }}><Typography variant="h3" sx={{ fontFamily: 'DM Serif Display, serif', fontSize: 38, letterSpacing: -1, color: 'text.primary', mb: 1 }}>12k+</Typography><Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Screens available<br />across 200+ cities</Typography></Box></Grid>
        <Grid item xs={12} md={4}><Box sx={{ background: 'background.paper', p: 4, borderRadius: 2, textAlign: 'center' }}><Typography variant="h3" sx={{ fontFamily: 'DM Serif Display, serif', fontSize: 38, letterSpacing: -1, color: 'text.primary', mb: 1 }}>$2.4M</Typography><Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Paid out to screen<br />owners this year</Typography></Box></Grid>
        <Grid item xs={12} md={4}><Box sx={{ background: 'background.paper', p: 4, borderRadius: 2, textAlign: 'center' }}><Typography variant="h3" sx={{ fontFamily: 'DM Serif Display, serif', fontSize: 38, letterSpacing: -1, color: 'text.primary', mb: 1 }}>98%</Typography><Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Campaign delivery<br />rate, guaranteed</Typography></Box></Grid>
      </Grid>

      {/* How it works */}
      <Box sx={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'text.secondary', mb: 6, mt: 8 }}>How it works</Box>
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={4}><Box sx={{ fontFamily: 'DM Serif Display, serif', fontSize: 36, color: '#E8D5C9', mb: 1 }}>01</Box><Typography sx={{ fontWeight: 500, fontSize: 16, mb: 1, color: 'text.primary' }}>Find your audience</Typography><Typography sx={{ fontSize: 14, fontWeight: 300, color: 'text.secondary' }}>Filter screens by location, foot traffic, screen type, and time of day. See exactly who walks past before you buy.</Typography></Grid>
        <Grid item xs={12} md={4}><Box sx={{ fontFamily: 'DM Serif Display, serif', fontSize: 36, color: '#E8D5C9', mb: 1 }}>02</Box><Typography sx={{ fontWeight: 500, fontSize: 16, mb: 1, color: 'text.primary' }}>Book in minutes</Typography><Typography sx={{ fontSize: 14, fontWeight: 300, color: 'text.secondary' }}>Reserve time slots, upload your creative, and set your schedule — all from a single dashboard. No middlemen, no calls.</Typography></Grid>
        <Grid item xs={12} md={4}><Box sx={{ fontFamily: 'DM Serif Display, serif', fontSize: 36, color: '#E8D5C9', mb: 1 }}>03</Box><Typography sx={{ fontWeight: 500, fontSize: 16, mb: 1, color: 'text.primary' }}>Track what's working</Typography><Typography sx={{ fontSize: 14, fontWeight: 300, color: 'text.secondary' }}>Live play counts, impression estimates, and spend reports. Know exactly what you're getting and when it runs.</Typography></Grid>
      </Grid>

      {/* Roles Section */}
      <Grid container spacing={3} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}><Card variant="outlined" sx={{ borderRadius: 3, minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'background.paper', color: 'text.primary' }}><CardContent><Box sx={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', border: '0.5px solid', borderColor: 'divider', borderRadius: 5, display: 'inline-block', mb: 2 }}>Advertisers</Box><Typography variant="h4" sx={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, letterSpacing: -0.5, lineHeight: 1.15, mb: 1 }}>Reach the right people, in the right place.</Typography><Typography sx={{ fontSize: 14, fontWeight: 300, lineHeight: 1.65, color: 'rgba(245,242,238,0.6)', mb: 2 }}>Tap into a curated network of high-traffic screens — from coffee shops to shopping centers. Set your own budget and only pay for slots that run.</Typography><MuiLink href="#" underline="none" sx={{ fontSize: 13, fontWeight: 500, color: Purple, display: 'inline-flex', alignItems: 'center', gap: 1 }}>Start your campaign →</MuiLink></CardContent></Card></Grid>
        <Grid item xs={12} md={6}><Card variant="outlined" sx={{ borderRadius: 3, minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'background.paper', color: 'text.primary' }}><CardContent><Box sx={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', border: '0.5px solid', borderColor: 'divider', borderRadius: 5, display: 'inline-block', mb: 2 }}>Screen Owners</Box><Typography variant="h4" sx={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, letterSpacing: -0.5, lineHeight: 1.15, mb: 1 }}>Turn your screen into steady revenue.</Typography><Typography sx={{ fontSize: 14, fontWeight: 300, lineHeight: 1.65, color: 'text.secondary', mb: 2 }}>List your display, set your own rates, and approve every ad before it goes live. You stay in full control — we handle the payments.</Typography><MuiLink href="#" underline="none" sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary', display: 'inline-flex', alignItems: 'center', gap: 1 }}>List your screen →</MuiLink></CardContent></Card></Grid>
      </Grid>

      {/* Why Beacon Point */}
      <Box sx={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'text.secondary', mb: 6, mt: 8 }}>Why Beacon Point</Box>
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}><Box sx={{ borderTop: '0.5px solid', borderColor: 'divider', pt: 2 }}><Typography sx={{ fontSize: 15, fontWeight: 500, mb: 1, color: 'text.primary' }}>Verified screen network</Typography><Typography sx={{ fontSize: 13, fontWeight: 300, color: 'text.secondary' }}>Every screen is confirmed live before listing. No ghost inventory, no surprises on launch day.</Typography></Box></Grid>
        <Grid item xs={12} md={6}><Box sx={{ borderTop: '0.5px solid', borderColor: 'divider', pt: 2 }}><Typography sx={{ fontSize: 15, fontWeight: 500, mb: 1, color: 'text.primary' }}>Instant booking, no contracts</Typography><Typography sx={{ fontSize: 13, fontWeight: 300, color: 'text.secondary' }}>Reserve a single hour or an entire month. Cancel anytime. Terms that respect how you actually work.</Typography></Box></Grid>
        <Grid item xs={12} md={6}><Box sx={{ borderTop: '0.5px solid', borderColor: 'divider', pt: 2 }}><Typography sx={{ fontSize: 15, fontWeight: 500, mb: 1, color: 'text.primary' }}>Publisher approval controls</Typography><Typography sx={{ fontSize: 13, fontWeight: 300, color: 'text.secondary' }}>Screen owners review every campaign before it goes live. Brand safety for both sides of the marketplace.</Typography></Box></Grid>
        <Grid item xs={12} md={6}><Box sx={{ borderTop: '0.5px solid', borderColor: 'divider', pt: 2 }}><Typography sx={{ fontSize: 15, fontWeight: 500, mb: 1, color: 'text.primary' }}>Transparent, real-time reporting</Typography><Typography sx={{ fontSize: 13, fontWeight: 300, color: 'text.secondary' }}>Live play logs and impression data — not estimates. See the exact moment your ad ran and on which screen.</Typography></Box></Grid>
        <Grid item xs={12} md={6}><Box sx={{ borderTop: '0.5px solid', borderColor: 'divider', pt: 2 }}><Typography sx={{ fontSize: 15, fontWeight: 500, mb: 1, color: 'text.primary' }}>Secure, automated payments</Typography><Typography sx={{ fontSize: 13, fontWeight: 300, color: 'text.secondary' }}>Publishers get paid on a fixed schedule. Advertisers only pay for confirmed plays. No invoices, no chasing.</Typography></Box></Grid>
        <Grid item xs={12} md={6}><Box sx={{ borderTop: '0.5px solid', borderColor: 'divider', pt: 2 }}><Typography sx={{ fontSize: 15, fontWeight: 500, mb: 1, color: 'text.primary' }}>Built for scale</Typography><Typography sx={{ fontSize: 13, fontWeight: 300, color: 'text.secondary' }}>Run a single local ad or a nationwide rollout from one place. The platform grows with your ambition.</Typography></Box></Grid>
      </Grid>

      {/* CTA Banner */}
      <Paper elevation={3} sx={{ borderRadius: 4, p: 6, textAlign: 'center', background: 'background.paper', mb: 8 }}>
        <Typography variant="h2" sx={{ fontFamily: 'DM Serif Display, serif', fontSize: 40, letterSpacing: -1, lineHeight: 1.1, mb: 1, color: 'text.primary' }}>
          The world is a<br /><Box component="em" sx={{ color: Purple, fontStyle: 'italic' }}>canvas.</Box> Claim yours.
        </Typography>
        <Typography sx={{ fontSize: 15, fontWeight: 300, color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
          Join thousands of advertisers and screen owners already building something real — out in the open, where people live their lives.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" sx={{ background: Purple, color: '#fff', borderRadius: 5, px: 3, fontWeight: 500 }}>Start advertising</Button>
          <Button variant="outlined" sx={{ color: Purple, borderColor: Purple, borderRadius: 5, px: 3, fontWeight: 500 }}>List a screen</Button>
        </Box>
      </Paper>
    </Container>
  );
}
