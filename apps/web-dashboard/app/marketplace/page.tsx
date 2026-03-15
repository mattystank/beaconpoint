"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Container, Typography, Grid, Card, CardContent, CardActions, Button, Box, Chip, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions, Divider, TextField, Checkbox, FormControlLabel, FormGroup, InputLabel, MenuItem, Select, OutlinedInput
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { purple } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#0D0D0F", paper: "#18181B" },
    primary: { main: "#7C4DFF" },
    secondary: { main: "#fff" },
    text: { primary: "#fff", secondary: "#B0B0C3" },
  },
  typography: {
    fontFamily: ["DM Sans", "sans-serif"].join(","),
    h2: { fontFamily: "DM Serif Display, serif", fontWeight: 700 },
    h4: { fontFamily: "DM Serif Display, serif", fontWeight: 700 },
    h5: { fontFamily: "DM Serif Display, serif", fontWeight: 700 },
  },
});

const trafficTiers = [
  { label: "Low", color: "#B0B0C3" },
  { label: "Medium", color: "#FFD600" },
  { label: "High", color: "#7C4DFF" },
];

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
    slotGrid: ["peak", "peak", "open", "taken", "open", "open", "peak", "taken", "open", "open", "taken", "open", "open", "peak", "peak", "open", "taken", "open", "open", "open", "peak", "open", "taken", "open"],
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
    slotGrid: ["peak", "peak", "peak", "peak", "open", "open", "peak", "taken", "open", "open", "taken", "open", "open", "peak", "peak", "open", "taken", "open", "open", "open", "peak", "open", "taken", "open"],
  },
  {
    id: 3,
    name: "Fells Point Coffee",
    address: "500 Thames St, Baltimore, MD",
    dailyTraffic: 3500,
    hourlyRate: 10,
    slotsFilled: 8,
    slotsTotal: 24,
    tier: 1,
    indoor: true,
    available: true,
    specs: { size: '55"', resolution: "1920x1080", orientation: "Portrait", category: "Cafe" },
    slotGrid: ["open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open"],
  },
  {
    id: 4,
    name: "Downtown Gym",
    address: "800 Pratt St, Baltimore, MD",
    dailyTraffic: 9000,
    hourlyRate: 15,
    slotsFilled: 12,
    slotsTotal: 24,
    tier: 1,
    indoor: true,
    available: false,
    specs: { size: '65"', resolution: "1920x1080", orientation: "Landscape", category: "Fitness" },
    slotGrid: ["taken", "taken", "taken", "taken", "taken", "taken", "taken", "taken", "taken", "taken", "taken", "taken", "taken", "taken", "taken", "taken", "taken", "taken", "taken", "taken", "taken", "taken", "taken", "taken"],
  },
  {
    id: 5,
    name: "Lexington Market",
    address: "400 W Lexington St, Baltimore, MD",
    dailyTraffic: 18000,
    hourlyRate: 20,
    slotsFilled: 18,
    slotsTotal: 24,
    tier: 2,
    indoor: true,
    available: true,
    specs: { size: '70"', resolution: "3840x2160", orientation: "Landscape", category: "Market" },
    slotGrid: ["peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak"],
  },
  {
    id: 6,
    name: "Inner Harbor Hotel",
    address: "600 E Pratt St, Baltimore, MD",
    dailyTraffic: 8000,
    hourlyRate: 14,
    slotsFilled: 10,
    slotsTotal: 24,
    tier: 1,
    indoor: true,
    available: true,
    specs: { size: '60"', resolution: "1920x1080", orientation: "Landscape", category: "Hotel" },
    slotGrid: ["open", "open", "peak", "peak", "open", "open", "peak", "peak", "open", "open", "peak", "peak", "open", "open", "peak", "peak", "open", "open", "peak", "peak", "open", "open", "peak", "peak"],
  },
  {
    id: 7,
    name: "Johns Hopkins Hospital",
    address: "1800 Orleans St, Baltimore, MD",
    dailyTraffic: 25000,
    hourlyRate: 30,
    slotsFilled: 22,
    slotsTotal: 24,
    tier: 2,
    indoor: true,
    available: false,
    specs: { size: '90"', resolution: "3840x2160", orientation: "Landscape", category: "Healthcare" },
    slotGrid: ["peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak", "peak"],
  },
  {
    id: 8,
    name: "Federal Hill Rooftop",
    address: "1000 Battery Ave, Baltimore, MD",
    dailyTraffic: 6000,
    hourlyRate: 12,
    slotsFilled: 6,
    slotsTotal: 24,
    tier: 0,
    indoor: false,
    available: true,
    specs: { size: '55"', resolution: "1920x1080", orientation: "Landscape", category: "Outdoor" },
    slotGrid: ["open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open"],
  },
  {
    id: 9,
    name: "Charles Center Plaza",
    address: "200 N Charles St, Baltimore, MD",
    dailyTraffic: 14000,
    hourlyRate: 17,
    slotsFilled: 15,
    slotsTotal: 24,
    tier: 1,
    indoor: false,
    available: true,
    specs: { size: '65"', resolution: "1920x1080", orientation: "Landscape", category: "Outdoor" },
    slotGrid: ["peak", "peak", "open", "open", "peak", "peak", "open", "open", "peak", "peak", "open", "open", "peak", "peak", "open", "open", "peak", "peak", "open", "open", "peak", "peak", "open", "open"],
  },
  {
    id: 10,
    name: "Penn Station Atrium",
    address: "1500 N Charles St, Baltimore, MD",
    dailyTraffic: 11000,
    hourlyRate: 16,
    slotsFilled: 13,
    slotsTotal: 24,
    tier: 1,
    indoor: true,
    available: true,
    specs: { size: '60"', resolution: "1920x1080", orientation: "Landscape", category: "Transit" },
    slotGrid: ["peak", "peak", "open", "open", "peak", "peak", "open", "open", "peak", "peak", "open", "open", "peak", "peak", "open", "open", "peak", "peak", "open", "open", "peak", "peak", "open", "open"],
  },
  {
    id: 11,
    name: "Canton Waterfront Park",
    address: "3001 Boston St, Baltimore, MD",
    dailyTraffic: 7000,
    hourlyRate: 13,
    slotsFilled: 7,
    slotsTotal: 24,
    tier: 0,
    indoor: false,
    available: true,
    specs: { size: '55"', resolution: "1920x1080", orientation: "Landscape", category: "Outdoor" },
    slotGrid: ["open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open"],
  },
  {
    id: 12,
    name: "Mount Vernon Library",
    address: "400 Cathedral St, Baltimore, MD",
    dailyTraffic: 5000,
    hourlyRate: 11,
    slotsFilled: 9,
    slotsTotal: 24,
    tier: 0,
    indoor: true,
    available: true,
    specs: { size: '50"', resolution: "1920x1080", orientation: "Portrait", category: "Library" },
    slotGrid: ["open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open", "open"],
  },
];

const filterOptions = [
  { label: "All", value: "all" },
  { label: "High Traffic", value: "high" },
  { label: "Available", value: "available" },
  { label: "Indoor", value: "indoor" },
  { label: "Outdoor", value: "outdoor" },
];

const sortOptions = [
  { label: "Traffic", value: "traffic" },
  { label: "Price", value: "price" },
  { label: "Availability", value: "availability" },
];

function getTrafficTier(tier: number) {
  return trafficTiers[tier] || trafficTiers[0];
}

function getSlotColor(slot: string) {
  if (slot === "open") return "#00E676";
  if (slot === "peak") return "#FFD600";
  return "#444";
}


// Helper to fetch Unsplash image from our API
async function fetchUnsplashImage(query: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/image-search?query=${encodeURIComponent(query)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.imageUrl || null;
  } catch {
    return null;
  }
}

export default function MarketplacePage() {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("traffic");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [bookingStep, setBookingStep] = useState(0);
  const [booking, setBooking] = useState({
    name: "",
    slots: [] as number[],
    budget: "",
    start: "",
    end: "",
    creative: null as File | null,
  });
  // Demo: Assume not logged in (replace with real auth logic)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  // Ref for dialog container
  const dialogContainerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    dialogContainerRef.current = typeof window !== 'undefined' ? document.body : null;
  }, []);

  // Filtering and sorting logic
  let filtered = sampleLocations.filter((loc) => {
    if (filter === "high") return loc.tier === 2;
    if (filter === "available") return loc.available;
    if (filter === "indoor") return loc.indoor;
    if (filter === "outdoor") return !loc.indoor;
    return true;
  });
  if (sort === "traffic") filtered = filtered.sort((a, b) => b.dailyTraffic - a.dailyTraffic);
  if (sort === "price") filtered = filtered.sort((a, b) => a.hourlyRate - b.hourlyRate);
  if (sort === "availability") filtered = filtered.sort((a, b) => (b.slotsTotal - b.slotsFilled) - (a.slotsTotal - a.slotsFilled));

  // Modal open/close
  const openModal = (loc: any) => {
    setSelected(loc);
    setBookingStep(0);
    setBooking({ name: "", slots: [], budget: "", start: "", end: "", creative: null });
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  // Booking form logic
  const handleBookingChange = (e: any) => {
    const { name, value, type, files } = e.target;
    if (type === "file") setBooking((b) => ({ ...b, creative: files[0] }));
    else setBooking((b) => ({ ...b, [name]: value }));
  };
  const handleSlotToggle = (idx: number) => {
    setBooking((b) => ({ ...b, slots: b.slots.includes(idx) ? b.slots.filter((i) => i !== idx) : [...b.slots, idx] }));
  };
  const nextStep = () => {
    if (!isLoggedIn && bookingStep === 0) {
      setLoginPromptOpen(true);
      return;
    }
    setBookingStep((s) => s + 1);
  };
        {/* Login/Signup Prompt Dialog */}
        <Dialog
          open={loginPromptOpen}
          onClose={() => setLoginPromptOpen(false)}
          maxWidth="xs"
          fullWidth
          container={dialogContainerRef.current}
          sx={{ '& .MuiDialog-paper': { background: '#18181B', color: '#fff', borderRadius: 4, zIndex: 1700, border: '2px solid #7C4DFF' } }}
        >
          <DialogTitle sx={{ fontFamily: 'DM Serif Display, serif', fontWeight: 700, color: '#fff', fontSize: 22 }}>Sign in required</DialogTitle>
          <DialogContent>
            <Typography sx={{ color: '#B0B0C3', mb: 2, fontSize: 15 }}>
              You need to be logged in to start a campaign. Please sign in or create an account to continue.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant="contained" color="primary" sx={{ flex: 1, fontWeight: 700, borderRadius: 2, textTransform: 'none' }} onClick={() => { setIsLoggedIn(true); setLoginPromptOpen(false); }}>
                Sign In
              </Button>
              <Button variant="outlined" sx={{ flex: 1, fontWeight: 700, borderRadius: 2, textTransform: 'none', color: '#fff', borderColor: '#7C4DFF', '&:hover': { background: '#23232a', borderColor: '#fff' } }} onClick={() => { setIsLoggedIn(true); setLoginPromptOpen(false); }}>
                Create Account
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
  const prevStep = () => setBookingStep((s) => s - 1);

  // State to hold image URLs for each location
  const [imageUrls, setImageUrls] = useState<{ [id: number]: string | null }>({});

  useEffect(() => {
    // Only fetch for visible cards
    const fetchImages = async () => {
      const promises = filtered.map(async (loc) => {
        if (!imageUrls[loc.id]) {
          const url = await fetchUnsplashImage(`${loc.name} Baltimore`);
          return { id: loc.id, url };
        }
        return { id: loc.id, url: imageUrls[loc.id] };
      });
      const results = await Promise.all(promises);
      const newUrls: { [id: number]: string | null } = {};
      results.forEach(({ id, url }) => { newUrls[id] = url; });
      setImageUrls((prev) => ({ ...prev, ...newUrls }));
    };
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Modern Title Bar */}
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
            Screen <Box component="span" sx={{ color: '#7C4DFF', fontStyle: 'italic', fontWeight: 700 }}>marketplace</Box>
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', ml: 1 }}>
            <Box sx={{ fontSize: 14, color: '#B0B0C3', fontWeight: 400 }}>
              <b>{sampleLocations.length}</b> screens live
            </Box>
            <Box sx={{ fontSize: 14, color: '#B0B0C3', fontWeight: 400 }}>
              <b>{sampleLocations.reduce((s, l) => s + (l.slotsTotal - l.slotsFilled), 0)}</b> slots available today
            </Box>
          </Box>
        </Box>
        {/* Modern Filter Bar */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 4,
          flexWrap: 'wrap',
          background: 'rgba(30,30,40,0.85)',
          borderRadius: 3,
          px: 2,
          py: 1.5,
          boxShadow: 2,
          border: '1px solid #23232a',
        }}>
          <Box sx={{ fontSize: 13, color: '#B0B0C3', mr: 1 }}>Filter:</Box>
          {filterOptions.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'contained' : 'outlined'}
              color={filter === f.value ? 'primary' : 'secondary'}
              onClick={() => setFilter(f.value)}
              sx={{
                fontWeight: 600,
                fontSize: 13,
                px: 2.5,
                py: 0.7,
                borderRadius: 40,
                borderColor: filter === f.value ? '#7C4DFF' : '#333',
                color: filter === f.value ? '#fff' : '#B0B0C3',
                background: filter === f.value ? '#7C4DFF' : 'transparent',
                boxShadow: filter === f.value ? 2 : 0,
                textTransform: 'none',
                transition: 'all 0.15s',
                '&:hover': {
                  background: filter === f.value ? '#6a3fdc' : '#23232a',
                  color: '#fff',
                  borderColor: '#7C4DFF',
                },
              }}
            >
              {f.label}
            </Button>
          ))}
          <Select
            value={sort}
            onChange={e => setSort(e.target.value)}
            size="small"
            sx={{
              ml: 2,
              minWidth: 140,
              bgcolor: '#23232a',
              color: '#fff',
              borderRadius: 2,
              fontSize: 13,
              border: '1px solid #333',
              '& .MuiSelect-icon': { color: '#7C4DFF' },
              '& .MuiOutlinedInput-notchedOutline': { border: 0 },
            }}
            input={<OutlinedInput notched={false} label={undefined} />}
          >
            {sortOptions.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
          </Select>
        </Box>
        <Grid container spacing={4}>
          {filtered.map((loc) => {
            const fillRate = Math.round((loc.slotsFilled / loc.slotsTotal) * 100);
            const tier = getTrafficTier(loc.tier);
            const avail = loc.slotsTotal - loc.slotsFilled;
            // Badge color logic
            let badgeBg = '#FCEBEB', badgeColor = '#791F1F';
            if (tier.label === 'High') { badgeBg = '#EAF3DE'; badgeColor = '#27500A'; }
            else if (tier.label === 'Medium') { badgeBg = '#FAEEDA'; badgeColor = '#633806'; }
            // Fill bar color logic
            let fillBar = '#EF9F27';
            if (fillRate >= 90) fillBar = '#E24B4A';
            else if (fillRate <= 50) fillBar = '#639922';
            return (
              <Grid item xs={12} sm={6} md={4} key={loc.id}>
                <Card
                  sx={{
                    background: '#18181B',
                    color: '#fff',
                    borderRadius: 3,
                    boxShadow: 3,
                    cursor: 'pointer',
                    border: '0.5px solid #333',
                    overflow: 'hidden',
                    transition: 'border-color 0.15s, transform 0.15s',
                    '&:hover': { borderColor: '#7C4DFF', transform: 'translateY(-2px)' },
                    p: 0
                  }}
                  onClick={() => openModal(loc)}
                >
                  {/* Image and badge */}
                  <Box sx={{ position: 'relative', height: 130, background: '#222', display: 'flex', alignItems: 'flex-end', p: 1.5, borderBottom: '0.5px solid #222' }}>
                    {imageUrls[loc.id] ? (
                      <img
                        src={imageUrls[loc.id] as string}
                        alt={loc.name}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                      />
                    ) : (
                      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 18, zIndex: 0 }}>Loading image...</Box>
                    )}
                    {/* Badge */}
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{
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
                      }}>{tier.label} traffic</Box>
                    </Box>
                  </Box>
                  {/* Card body */}
                  <CardContent sx={{ p: '14px 16px 16px', background: '#18181B' }}>
                    <Typography className="loc-name" sx={{ fontSize: 15, fontWeight: 500, mb: 0.5, color: '#fff' }}>{loc.name}</Typography>
                    <Box className="loc-addr" sx={{ fontSize: 12, color: '#aaa', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <svg width="10" height="12" viewBox="0 0 10 12" fill="none" style={{ flexShrink: 0 }}><path d="M5 0C3.07 0 1.5 1.57 1.5 3.5c0 2.63 3.5 6.5 3.5 6.5s3.5-3.87 3.5-6.5C8.5 1.57 6.93 0 5 0zm0 4.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" fill="#ccc"/></svg>
                      {loc.address}
                    </Box>
                    {/* Stats grid */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
                      <Box sx={{ background: '#222', borderRadius: 2, p: '8px 10px' }}>
                        <Box sx={{ fontSize: 11, color: '#aaa', mb: 0.5 }}>Daily traffic</Box>
                        <Box sx={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{loc.dailyTraffic.toLocaleString()}</Box>
                      </Box>
                      <Box sx={{ background: '#222', borderRadius: 2, p: '8px 10px' }}>
                        <Box sx={{ fontSize: 11, color: '#aaa', mb: 0.5 }}>Rate / hour</Box>
                        <Box sx={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>${loc.hourlyRate}</Box>
                      </Box>
                    </Box>
                    {/* Slots filled bar */}
                    <Box sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', mb: 0.5 }}>
                        <span>Slots filled</span>
                        <span>{loc.slotsFilled}/{loc.slotsTotal} — <b style={{ color: '#fff' }}>{avail} open</b></span>
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
                        border: '0.5px solid #7C4DFF',
                        borderRadius: 2,
                        background: 'transparent',
                        color: '#fff',
                        textTransform: 'none',
                        mt: 1,
                        '&:hover': { background: '#23232a', borderColor: '#fff' }
                      }}
                    >View details & book</Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        {/* Modal */}
        <Dialog open={modalOpen} onClose={closeModal} maxWidth="md" fullWidth sx={{ '& .MuiDialog-paper': { background: '#18181B', color: '#fff', borderRadius: 4, position: 'static', p: 0 } }}>
          {selected && (
            <>
              {/* Banner accent */}
              <Box sx={{ height: 8, width: '100%', background: '#7C4DFF', borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
              <DialogTitle sx={{
                fontFamily: 'DM Serif Display, serif',
                fontWeight: 700,
                color: '#fff',
                fontSize: 28,
                textAlign: 'left',
                pb: 0.5,
                pt: 2,
                mb: 0,
                borderBottom: 'none',
              }}>{selected.name}
                <Typography variant="subtitle2" sx={{ color: '#B0B0C3', fontWeight: 400, fontSize: 15, mt: 0.5 }}>{selected.address}</Typography>
              </DialogTitle>
              <DialogContent sx={{ pt: 1, pb: 2 }}>
                {/* Modern Metrics Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4,1fr)' }, gap: 2, mb: 3, mt: 1 }}>
                  <Box sx={{ background: '#23232a', borderRadius: 2, p: 2, textAlign: 'center' }}>
                    <Box sx={{ fontSize: 12, color: '#B0B0C3', mb: 0.5 }}>Daily traffic</Box>
                    <Box sx={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{selected.dailyTraffic.toLocaleString()}</Box>
                  </Box>
                  <Box sx={{ background: '#23232a', borderRadius: 2, p: 2, textAlign: 'center' }}>
                    <Box sx={{ fontSize: 12, color: '#B0B0C3', mb: 0.5 }}>Rate / hour</Box>
                    <Box sx={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>${selected.hourlyRate}</Box>
                  </Box>
                  <Box sx={{ background: '#23232a', borderRadius: 2, p: 2, textAlign: 'center' }}>
                    <Box sx={{ fontSize: 12, color: '#B0B0C3', mb: 0.5 }}>Open slots</Box>
                    <Box sx={{ fontSize: 20, fontWeight: 700, color: '#7C4DFF' }}>{selected.slotsTotal - selected.slotsFilled}</Box>
                  </Box>
                  <Box sx={{ background: '#23232a', borderRadius: 2, p: 2, textAlign: 'center' }}>
                    <Box sx={{ fontSize: 12, color: '#B0B0C3', mb: 0.5 }}>Fill rate</Box>
                    <Box sx={{ fontSize: 20, fontWeight: 700, color: '#7C4DFF' }}>{Math.round((selected.slotsFilled / selected.slotsTotal) * 100)}%</Box>
                  </Box>
                </Box>
                {/* Time Slots Section - HTML inspired */}
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ color: '#B0B0C3', fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', mb: 1, pb: 0.5, borderBottom: '1px solid #23232a' }}>
                    Available time slots
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1.5, mb: 1.5 }}>
                    {selected.slotGrid.map((slot: string, idx: number) => {
                      let pillBg = '#23232a', pillColor = '#fff', pillBorder = '1px solid #333';
                      if (slot === 'open') { pillBg = '#EAF3DE'; pillColor = '#27500A'; pillBorder = '1.5px solid #C0DD97'; }
                      else if (slot === 'peak') { pillBg = '#FAEEDA'; pillColor = '#633806'; pillBorder = '1.5px solid #FAC775'; }
                      else if (slot === 'taken') { pillBg = '#222'; pillColor = '#888'; pillBorder = '1.5px solid #444'; }
                      return (
                        <Box
                          key={idx}
                          sx={{
                            px: 1.5,
                            py: 0.7,
                            borderRadius: 2,
                            fontSize: 13,
                            fontWeight: 500,
                            bgcolor: pillBg,
                            color: pillColor,
                            border: pillBorder,
                            textAlign: 'center',
                            cursor: slot === 'open' ? 'pointer' : 'default',
                            opacity: slot === 'taken' ? 0.5 : 1,
                            boxShadow: booking.slots.includes(idx) ? '0 0 0 2px #7C4DFF' : undefined,
                            transition: 'box-shadow 0.15s',
                          }}
                          onClick={() => slot === 'open' && bookingStep === 1 && handleSlotToggle(idx)}
                        >
                          {slot === 'peak' ? 'Peak' : slot === 'open' ? 'Open' : 'Taken'}
                          <Box component="span" sx={{ display: 'block', fontSize: 11, color: pillColor, opacity: 0.7 }}>{`Slot ${idx + 1}`}</Box>
                          {booking.slots.includes(idx) && bookingStep === 1 && (
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#7C4DFF', display: 'inline-block', ml: 0.5, mt: 0.5 }} />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, fontSize: 12, color: '#B0B0C3', mt: 0.5 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: '#EAF3DE', borderRadius: 1, display: 'inline-block', mr: 0.5, border: '1.5px solid #C0DD97' }} /> Open
                    <Box sx={{ width: 16, height: 16, bgcolor: '#FAEEDA', borderRadius: 1, display: 'inline-block', mr: 0.5, border: '1.5px solid #FAC775' }} /> Peak
                    <Box sx={{ width: 16, height: 16, bgcolor: '#222', borderRadius: 1, display: 'inline-block', mr: 0.5, border: '1.5px solid #444' }} /> Taken
                  </Box>
                </Box>
                {/* Campaign Details Section - HTML inspired */}
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ color: '#B0B0C3', fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', mb: 1, pb: 0.5, borderBottom: '1px solid #23232a' }}>
                    Screen details
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, py: 1, borderBottom: '1px solid #23232a' }}>
                      <Box sx={{ color: '#B0B0C3' }}>Screen size</Box>
                      <Box sx={{ color: '#fff', fontWeight: 500 }}>{selected.specs.size}</Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, py: 1, borderBottom: '1px solid #23232a' }}>
                      <Box sx={{ color: '#B0B0C3' }}>Resolution</Box>
                      <Box sx={{ color: '#fff', fontWeight: 500 }}>{selected.specs.resolution}</Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, py: 1, borderBottom: '1px solid #23232a' }}>
                      <Box sx={{ color: '#B0B0C3' }}>Orientation</Box>
                      <Box sx={{ color: '#fff', fontWeight: 500 }}>{selected.specs.orientation}</Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, py: 1, borderBottom: '1px solid #23232a' }}>
                      <Box sx={{ color: '#B0B0C3' }}>Category</Box>
                      <Box sx={{ color: '#fff', fontWeight: 500 }}>{selected.specs.category}</Box>
                    </Box>
                  </Box>
                </Box>
                {/* Booking Steps Modern */}
                <Box sx={{ mt: 2 }}>
                  {bookingStep === 0 && (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ fontWeight: 700, fontSize: 18, py: 1.5, borderRadius: 3, boxShadow: 2, textTransform: 'none', letterSpacing: 0.5 }}
                      onClick={() => {
                        if (!isLoggedIn) {
                          setLoginPromptOpen(true);
                        } else {
                          setBookingStep(1);
                        }
                      }}
                    >
                      Start Campaign
                    </Button>
                  )}
                  {bookingStep === 1 && (
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                      <TextField label="Campaign Name" name="name" value={booking.name} onChange={handleBookingChange} fullWidth required sx={{ input: { color: '#fff' } }} />
                      <Typography variant="subtitle2" sx={{ color: '#B0B0C3', fontWeight: 500, fontSize: 14 }}>Select Time Slots</Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 1 }}>
                        {selected.slotGrid.map((slot: string, idx: number) => (
                          <Checkbox key={idx} checked={booking.slots.includes(idx)} disabled={slot !== 'open'} onChange={() => handleSlotToggle(idx)} sx={{ color: slot === 'open' ? '#00E676' : slot === 'peak' ? '#FFD600' : '#444', p: 0.5 }} />
                        ))}
                      </Box>
                      <TextField label="Daily Budget ($)" name="budget" value={booking.budget} onChange={handleBookingChange} type="number" fullWidth required sx={{ input: { color: '#fff' } }} />
                      <TextField label="Start Date" name="start" value={booking.start} onChange={handleBookingChange} type="date" fullWidth InputLabelProps={{ shrink: true }} required sx={{ input: { color: '#fff' } }} />
                      <TextField label="End Date" name="end" value={booking.end} onChange={handleBookingChange} type="date" fullWidth InputLabelProps={{ shrink: true }} required sx={{ input: { color: '#fff' } }} />
                      <Button variant="outlined" component="label" sx={{ color: '#7C4DFF', borderColor: '#7C4DFF', fontWeight: 600, borderRadius: 2, textTransform: 'none', py: 1 }}>
                        Upload Creative
                        <input type="file" hidden onChange={handleBookingChange} name="creative" />
                      </Button>
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button variant="outlined" onClick={prevStep} sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600, color: '#fff', borderColor: '#7C4DFF', '&:hover': { background: '#23232a', borderColor: '#fff' } }}>Back</Button>
                        <Button variant="contained" color="primary" onClick={nextStep} sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700, boxShadow: 2 }}>Review</Button>
                      </Box>
                    </Box>
                  )}
                  {bookingStep === 2 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#fff' }}>Confirm Campaign Details</Typography>
                      <Box sx={{ fontSize: 15, color: '#B0B0C3', mb: 1 }}><b>Name:</b> {booking.name}</Box>
                      <Box sx={{ fontSize: 15, color: '#B0B0C3', mb: 1 }}><b>Slots:</b> {booking.slots.length} selected</Box>
                      <Box sx={{ fontSize: 15, color: '#B0B0C3', mb: 1 }}><b>Budget:</b> ${booking.budget}</Box>
                      <Box sx={{ fontSize: 15, color: '#B0B0C3', mb: 1 }}><b>Start:</b> {booking.start}</Box>
                      <Box sx={{ fontSize: 15, color: '#B0B0C3', mb: 1 }}><b>End:</b> {booking.end}</Box>
                      <Box sx={{ fontSize: 15, color: '#B0B0C3', mb: 1 }}><b>Creative:</b> {booking.creative ? booking.creative.name : 'None'}</Box>
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button variant="outlined" onClick={prevStep} sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600, color: '#fff', borderColor: '#7C4DFF', '&:hover': { background: '#23232a', borderColor: '#fff' } }}>Back</Button>
                        <Button variant="contained" color="primary" sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700, boxShadow: 2 }} onClick={() => { setBookingStep(3); setTimeout(closeModal, 1500); }}>Submit</Button>
                      </Box>
                    </Box>
                  )}
                  {bookingStep === 3 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h5" sx={{ color: '#7C4DFF', mb: 2, fontWeight: 700 }}>Campaign Submitted!</Typography>
                      <Typography variant="body1" sx={{ color: '#fff' }}>Your campaign has been submitted for review. You will receive a confirmation email soon.</Typography>
                    </Box>
                  )}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={closeModal} sx={{ color: '#fff', fontWeight: 600, textTransform: 'none', fontSize: 15 }}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}
