
import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Drawer, Divider, Avatar, Typography, Chip, Snackbar, Alert } from '@mui/material';
// --- THEME ---
const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0D0D0F',
      paper: '#18181C',
    },
    primary: {
      main: '#7C4DFF',
    },
    secondary: {
      main: '#FFA726',
    },
    error: {
      main: '#E24B4A',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FFA726',
    },
    text: {
      primary: '#fff',
      secondary: '#B0B0C3',
    },
  },
  typography: {
    fontFamily: 'DM Sans, Arial, sans-serif',
    h3: { fontFamily: 'DM Serif Display, serif' },
    h5: { fontFamily: 'DM Serif Display, serif' },
  },
});

import { DashboardPage } from './apps/web-dashboard/app/admin/pages/DashboardPage.jsx';
import { ManageScreensPage } from './apps/web-dashboard/app/admin/pages/ManageScreensPage.jsx';
import CalendarPage from './apps/web-dashboard/app/admin/pages/CalendarPage.jsx';
import AddScreenPage from './apps/web-dashboard/app/admin/pages/AddScreenPage.jsx';
import AdModerationPage from './apps/web-dashboard/app/admin/pages/AdModerationPage.jsx';
import AllCampaignsPage from './apps/web-dashboard/app/admin/pages/AllCampaignsPage.jsx';
import BusinessesPage from './apps/web-dashboard/app/admin/pages/BusinessesPage.jsx';
import PublishersPage from './apps/web-dashboard/app/admin/pages/PublishersPage.jsx';

// --- GOOGLE FONTS HOOK ---
function useGoogleFonts() {
  useEffect(() => {
    const id = 'google-fonts-dm';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=DM+Serif+Display:ital,wght@0,400;1,400&display=swap';
      document.head.appendChild(link);
    }
  }, []);
}

// --- SAMPLE DATA ---
const SCREENS = [
  { id: 1, name: 'Union Station Concourse', city: 'Washington DC', location: 'Union Station', type: 'Indoor', rate: 85, slots: { open: 8, total: 12 }, status: 'Active', category: 'Transit Hub', publisher: 'Penn Station Authority', environment: 'Indoor', size: '98"', resolution: '1920x1080', orientation: 'Landscape', dailyTraffic: 12000, trafficTier: 'High', notes: '', offline: false },
  { id: 2, name: 'Harbor View Coffee Co.', city: 'Baltimore', location: 'Harbor View', type: 'Indoor', rate: 28, slots: { open: 10, total: 12 }, status: 'Active', category: 'Café', publisher: 'Harbor View LLC', environment: 'Indoor', size: '55"', resolution: '1920x1080', orientation: 'Portrait', dailyTraffic: 3500, trafficTier: 'Medium', notes: '', offline: false },
  { id: 3, name: 'Pratt Street Billboard', city: 'Baltimore', location: 'Pratt Street', type: 'Outdoor', rate: 140, slots: { open: 2, total: 12 }, status: 'Active', category: 'Billboard', publisher: 'JHU Facilities Dept', environment: 'Outdoor', size: '120"', resolution: '3840x2160', orientation: 'Landscape', dailyTraffic: 25000, trafficTier: 'High', notes: '', offline: false },
  { id: 4, name: 'Lexington Market Entry', city: 'Baltimore', location: 'Lexington Market', type: 'Indoor', rate: 65, slots: { open: 6, total: 12 }, status: 'Active', category: 'Market', publisher: 'JHU Facilities Dept', environment: 'Indoor', size: '75"', resolution: '1920x1080', orientation: 'Landscape', dailyTraffic: 9000, trafficTier: 'Medium', notes: '', offline: false },
  { id: 5, name: 'Penn Station Main Hall', city: 'Baltimore', location: 'Penn Station', type: 'Indoor', rate: 110, slots: { open: 4, total: 12 }, status: 'Active', category: 'Transit Hub', publisher: 'Penn Station Authority', environment: 'Indoor', size: '98"', resolution: '1920x1080', orientation: 'Landscape', dailyTraffic: 15000, trafficTier: 'High', notes: '', offline: false },
  { id: 6, name: 'Towson Town Center', city: 'Towson', location: 'Towson Town Center', type: 'Indoor', rate: 95, slots: { open: 7, total: 12 }, status: 'Active', category: 'Shopping Mall', publisher: 'JHU Facilities Dept', environment: 'Indoor', size: '86"', resolution: '1920x1080', orientation: 'Landscape', dailyTraffic: 11000, trafficTier: 'Medium', notes: '', offline: false },
  { id: 7, name: 'Federal Hill Rooftop', city: 'Baltimore', location: 'Federal Hill', type: 'Outdoor', rate: 18, slots: { open: 0, total: 12 }, status: 'Offline', category: 'Rooftop', publisher: 'Harbor View LLC', environment: 'Outdoor', size: '65"', resolution: '1920x1080', orientation: 'Landscape', dailyTraffic: 2000, trafficTier: 'Low', notes: '', offline: true },
  { id: 8, name: 'Fells Point Ferry Stop', city: 'Baltimore', location: 'Fells Point', type: 'Outdoor', rate: 48, slots: { open: 3, total: 12 }, status: 'Active', category: 'Waterfront', publisher: 'Kara\'s Café LLC', environment: 'Outdoor', size: '55"', resolution: '1920x1080', orientation: 'Landscape', dailyTraffic: 4000, trafficTier: 'Low', notes: '', offline: false },
];

const PUBLISHERS = [
  { id: 1, name: 'Harbor View LLC', screens: 2, earnings: 4200, payout: 'ACH', status: 'Active' },
  { id: 2, name: 'Penn Station Authority', screens: 2, earnings: 6700, payout: 'Wire', status: 'Active' },
  { id: 3, name: 'JHU Facilities Dept', screens: 3, earnings: 8900, payout: 'Check', status: 'Active' },
  { id: 4, name: 'Kara\'s Café LLC', screens: 1, earnings: 1200, payout: 'ACH', status: 'Pending' },
];

const BUSINESSES = [
  { id: 1, name: 'Acme Beverages', status: 'Active', campaigns: 3, spend: 5400 },
  { id: 2, name: 'AquaPark Baltimore', status: 'Active', campaigns: 2, spend: 3200 },
  { id: 3, name: 'Canton Cantina', status: 'Active', campaigns: 1, spend: 1800 },
  { id: 4, name: 'BudgetMart', status: 'Under review', campaigns: 1, spend: 900 },
  { id: 5, name: 'Nexus Apparel', status: 'Active', campaigns: 2, spend: 2600 },
  { id: 6, name: 'Harbor View Coffee', status: 'Active', campaigns: 1, spend: 1200 },
  { id: 7, name: 'Cat\'s Eye Pub', status: 'Active', campaigns: 1, spend: 800 },
  { id: 8, name: 'ShineRight Auto', status: 'Active', campaigns: 1, spend: 1100 },
];

const CAMPAIGNS = [
  { id: 1, name: 'Spring Splash', business: 'AquaPark Baltimore', screen: 'Union Station Concourse', slots: 8, budget: 400, dates: 'Mar 1–31', status: 'Pending' },
  { id: 2, name: 'Coffee Happy Hour', business: 'Harbor View Coffee', screen: 'Harbor View Coffee Co.', slots: 6, budget: 120, dates: 'Mar 10–24', status: 'Running' },
  { id: 3, name: 'Billboard Blast', business: 'Nexus Apparel', screen: 'Pratt Street Billboard', slots: 12, budget: 900, dates: 'Mar 5–Apr 5', status: 'Running' },
  { id: 4, name: 'BudgetMart Spring', business: 'BudgetMart', screen: 'Towson Town Center', slots: 4, budget: 80, dates: 'Mar 1–15', status: 'Ended' },
];

const ADS = [
  { id: 1, name: 'Spring Splash', business: 'AquaPark Baltimore', screen: 'Union Station Concourse', type: 'Video', slots: 8, rate: 400, dates: 'Mar 1–31', status: 'Pending', warning: false },
  { id: 2, name: 'Coffee Happy Hour', business: 'Harbor View Coffee', screen: 'Harbor View Coffee Co.', type: 'Image', slots: 6, rate: 120, dates: 'Mar 10–24', status: 'Pending', warning: true },
  { id: 3, name: 'Billboard Blast', business: 'Nexus Apparel', screen: 'Pratt Street Billboard', type: 'Video', slots: 12, rate: 900, dates: 'Mar 5–Apr 5', status: 'Pending', warning: false },
  { id: 4, name: 'BudgetMart Spring', business: 'BudgetMart', screen: 'Towson Town Center', type: 'Image', slots: 4, rate: 80, dates: 'Mar 1–15', status: 'Pending', warning: true },
  { id: 5, name: 'ShineRight Launch', business: 'ShineRight Auto', screen: 'Fells Point Ferry Stop', type: 'Video', slots: 3, rate: 60, dates: 'Mar 12–20', status: 'Pending', warning: false },
];

// --- Status Pill Helper (shared) ---
const StatusPill = ({ label, color }) => (
  <Chip
    label={<span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 8, background: color, display: 'inline-block' }} />{label}</span>}
    size="small"
    sx={{ background: color, color: '#fff', fontWeight: 700, fontSize: 12, borderRadius: 40, minWidth: 0 }}
  />
);

// --- MAIN COMPONENT ---
export default function BeaconPointAdmin() {
    // --- Row Actions for ManageScreensPage ---
    const handleDelete = (id) => {
      if (window.confirm('Are you sure you want to delete this screen?')) {
        setScreens(screens => screens.filter(s => s.id !== id));
        showToast('Screen deleted', 'success');
      }
    };
    const handleCalendar = (id) => {
      setCalendarScreen(id);
      setActivePage('calendar');
    };
  useGoogleFonts();
  // --- State ---
  const [activePage, setActivePage] = useState('dashboard');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  // Screens state for manage screens page
  const [screens, setScreens] = useState(SCREENS);
  // Businesses state for card click
  const [businesses, setBusinesses] = useState(BUSINESSES);
  // Publishers state for table
  const [publishers, setPublishers] = useState(PUBLISHERS);
  // Campaigns state for all campaigns page
  const [campaigns, setCampaigns] = useState(CAMPAIGNS);
  // Ad moderation state
  const [ads, setAds] = useState(ADS);
  // Calendar state
  const [calendarScreen, setCalendarScreen] = useState(screens[0]?.id || 1);
  const [selectedSlots, setSelectedSlots] = useState([]); // [{day, time}]
  // Ad moderation tab
  const [adTab, setAdTab] = useState(0);
  // Add screen form state
  const [addScreenForm, setAddScreenForm] = useState({
    name: '', publisher: '', address: '', category: '', environment: '', size: '', resolution: '', orientation: '', rate: '', dailyTraffic: '', trafficTier: '', totalSlots: '', notes: ''
  });
  // Manage Screens search/filter state (must be top-level, not inside renderPage)
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  // --- Helper: Toast ---
  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });
  // --- Sidebar ---
  function Sidebar() {
    return (
      <Drawer
        variant="permanent"
        PaperProps={{
          sx: {
            width: 220,
            background: '#141416',
            borderRight: '0.5px solid rgba(255,255,255,0.07)',
            boxSizing: 'border-box',
            color: '#fff',
            pt: 0,
            pb: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            height: '100vh',
            mt: 0,
          },
        }}
        sx={{ width: 220, flexShrink: 0 }}
      >
        <Box sx={{ flex: 1, px: 1, overflowY: 'auto', minHeight: 0 }}>
          {NAV_ITEMS.map((section) => (
            <Box key={section.section} sx={{ mb: 2 }}>
              <Typography variant="overline" sx={{ color: '#B0B0C3', fontWeight: 700, fontSize: 12, letterSpacing: 1, pl: 2, mb: 0.5 }}>{section.section}</Typography>
              {section.items.map((item) => {
                const isActive = activePage === item.key;
                return (
                  <Box
                    key={item.key}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 2,
                      py: 1.2,
                      borderRadius: 2,
                      cursor: 'pointer',
                      background: isActive ? 'rgba(124,77,255,0.12)' : 'none',
                      color: isActive ? '#7C4DFF' : '#B0B0C3',
                      fontWeight: isActive ? 700 : 500,
                      mb: 0.5,
                      position: 'relative',
                      transition: 'background 0.2s',
                      '&:hover': { background: 'rgba(124,77,255,0.08)' },
                    }}
                    onClick={() => setActivePage(item.key)}
                  >
                    {icons[item.icon](isActive ? '#7C4DFF' : '#B0B0C3')}
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <Chip
                        label={item.badge.count}
                        size="small"
                        sx={{
                          ml: 1,
                          background: item.badge.color === 'error' ? '#E24B4A' : '#FFA726',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 12,
                          borderRadius: 40,
                          minWidth: 24,
                          height: 22,
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
        {/* Admin profile chip at bottom */}
        <Box sx={{ px: 3, pb: 3, pt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#7C4DFF', width: 40, height: 40, fontWeight: 700, fontSize: 20 }}>JD</Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: 16 }}>Jordan Davis</Typography>
              <Typography sx={{ color: '#B0B0C3', fontSize: 13 }}>Super Admin</Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>
    );
  }

  // --- Topbar ---
  function Topbar() {
    const pageTitle = {
      dashboard: 'Dashboard',
      manageScreens: 'Manage screens',
      calendar: 'Calendar & slots',
      addScreen: 'Add screen',
      adModeration: 'Ad moderation',
      allCampaigns: 'All campaigns',
      businesses: 'Businesses',
      publishers: 'Publishers',
    }[activePage] || '';
    return (
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: '#0D0D0F',
        borderBottom: '0.5px solid rgba(255,255,255,0.07)',
        px: 4,
        py: 2.5,
        display: 'flex',
        alignItems: 'center',
        minHeight: 70,
        gap: 2,
      }}>
        <Typography variant="h3" sx={{ fontFamily: 'DM Serif Display, serif', color: '#fff', fontWeight: 700, fontSize: 32, letterSpacing: -1, flex: 1 }}>{pageTitle}</Typography>
        {/* Contextual action buttons will go here per page */}
      </Box>
    );
  }

  // --- Page Rendering ---
  function renderPage() {
    switch (activePage) {
      case 'dashboard': {
        // --- Stat Cards Data ---
        const statCards = [
          {
            label: 'Total screens',
            value: 12,
            change: '+2 this month',
            color: '#7C4DFF',
            icon: icons.screen('#7C4DFF'),
          },
          {
            label: 'Active campaigns',
            value: 34,
            change: '+8 this week',
            color: '#4CAF50',
            icon: icons.campaigns('#4CAF50'),
          },
          {
            label: 'Pending approval',
            value: 5,
            change: '',
            color: '#FFA726',
            icon: icons.adModeration('#FFA726'),
          },
          {
            label: 'Revenue MTD',
            value: '$24.1k',
            change: '+18%',
            color: '#E24B4A',
            icon: icons.business('#E24B4A'),
          },
        ];

        // --- Recent Activity Table Data ---
        const recentActivity = [
          { event: 'Screen added', screen: 'Pratt Street Billboard', actor: 'Jordan Davis', time: '2h ago', status: 'Success' },
          { event: 'Campaign started', screen: 'Union Station Concourse', actor: 'Acme Beverages', time: '4h ago', status: 'Success' },
          { event: 'Ad rejected', screen: 'Towson Town Center', actor: 'Admin', time: '6h ago', status: 'Error' },
          { event: 'Screen offline', screen: 'Federal Hill Rooftop', actor: 'System', time: '8h ago', status: 'Warning' },
          { event: 'Publisher payout', screen: 'Harbor View Coffee Co.', actor: 'System', time: '1d ago', status: 'Success' },
          { event: 'Campaign ended', screen: 'Lexington Market Entry', actor: 'Nexus Apparel', time: '2d ago', status: 'Success' },
        ];

        // --- Screens Needing Attention Table Data ---
        const screensAttention = [
          { issue: 'Screen offline >24h', screen: 'Federal Hill Rooftop', priority: 'High' },
          { issue: 'Low fill rate', screen: 'Fells Point Ferry Stop', priority: 'Medium' },
          { issue: 'Unverified publisher', screen: 'Kara\'s Café LLC', priority: 'Low' },
        ];

        return <DashboardPage statCards={statCards} recentActivity={recentActivity} screensAttention={screensAttention} icons={icons} StatusPill={StatusPill} />;
      }
      case 'manageScreens': {
        return <ManageScreensPage
          screens={screens}
          search={search}
          setSearch={setSearch}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          handleDelete={handleDelete}
          handleCalendar={handleCalendar}
          icons={icons}
          StatusPill={StatusPill}
        />;
      }
      case 'manageScreens':
        // --- State for search and filters ---
        const [search, setSearch] = useState('');
        const [typeFilter, setTypeFilter] = useState('');
        const [statusFilter, setStatusFilter] = useState('');
        // --- Filtered screens ---
        const filteredScreens = screens.filter(s =>
          (!search || s.name.toLowerCase().includes(search.toLowerCase())) &&
          (!typeFilter || s.type === typeFilter) &&
          (!statusFilter || (statusFilter === 'Offline' ? s.offline : !s.offline))
        );


// --- Status Pill Helper (shared) ---
const StatusPill = ({ label, color }) => (
  <Chip
    label={<span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 8, background: color, display: 'inline-block' }} />{label}</span>}
    size="small"
    sx={{ background: color, color: '#fff', fontWeight: 700, fontSize: 12, borderRadius: 40, minWidth: 0 }}
  />
);

        // --- Row Actions ---
        const handleDelete = (id) => {
          if (window.confirm('Are you sure you want to delete this screen?')) {
            setScreens(screens => screens.filter(s => s.id !== id));
            showToast('Screen deleted', 'success');
          }
        };
        const handleCalendar = (id) => {
          setCalendarScreen(id);
          setActivePage('calendar');
        };

        return (
          <Box>
            {/* Search and Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search screens..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ minWidth: 220, flex: 1 }}
              />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Type</InputLabel>
                <Select value={typeFilter} label="Type" onChange={e => setTypeFilter(e.target.value)}>
                  <MenuItem value="">All types</MenuItem>
                  <MenuItem value="Indoor">Indoor</MenuItem>
                  <MenuItem value="Outdoor">Outdoor</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
                  <MenuItem value="">All statuses</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Offline">Offline</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Screens Table */}
            <TableContainer component={Paper} elevation={0} sx={{ background: '#1C1C20', borderRadius: 3, border: '0.5px solid rgba(255,255,255,0.07)' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Screen name</TableCell>
                    <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Location</TableCell>
                    <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Rate/hr</TableCell>
                    <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Slots</TableCell>
                    <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredScreens.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ color: '#fff', fontWeight: 500 }}>{row.name}</TableCell>
                      <TableCell sx={{ color: '#fff' }}>{row.location}</TableCell>
                      <TableCell sx={{ color: '#fff' }}>{row.type}</TableCell>
                      <TableCell sx={{ color: '#fff' }}>${row.rate}</TableCell>
                      <TableCell sx={{ color: '#fff' }}>{row.slots.open}/{row.slots.total}</TableCell>
                      <TableCell>
                        {row.offline
                          ? <StatusPill label="Offline" color="#B0B0C3" />
                          : <StatusPill label="Active" color="#4CAF50" />}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton size="small" sx={{ border: '0.5px solid #7C4DFF', mr: 1 }}>
                            {icons.edit()}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Calendar">
                          <IconButton size="small" sx={{ border: '0.5px solid #7C4DFF', mr: 1 }} onClick={() => handleCalendar(row.id)}>
                            {icons.calendarBtn()}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" sx={{ border: '0.5px solid #E24B4A', color: '#E24B4A', '&:hover': { background: '#E24B4A22' } }} onClick={() => handleDelete(row.id)}>
                            {icons.delete()}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredScreens.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ color: '#B0B0C3', textAlign: 'center', py: 4 }}>
                        No screens found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      case 'calendar':
        return (
          <CalendarPage
            screens={screens}
            calendarScreen={calendarScreen}
            setCalendarScreen={setCalendarScreen}
            campaigns={campaigns}
            ads={ads}
          />
        );
      case 'addScreen':
        return (
          <AddScreenPage
            addScreenForm={addScreenForm}
            setAddScreenForm={setAddScreenForm}
            onAddScreen={() => {
              // Add new screen to state
              setScreens((prev) => [
                ...prev,
                {
                  id: prev.length + 1,
                  name: addScreenForm.name,
                  publisher: addScreenForm.publisher,
                  location: addScreenForm.location,
                  type: addScreenForm.type,
                  rate: Number(addScreenForm.rate),
                  slots: { open: Number(addScreenForm.totalSlots), total: Number(addScreenForm.totalSlots) },
                  status: 'Active',
                  category: addScreenForm.category || '',
                  environment: addScreenForm.environment || '',
                  size: addScreenForm.size || '',
                  resolution: addScreenForm.resolution || '',
                  orientation: addScreenForm.orientation || '',
                  dailyTraffic: addScreenForm.dailyTraffic ? Number(addScreenForm.dailyTraffic) : 0,
                  trafficTier: addScreenForm.trafficTier || '',
                  notes: addScreenForm.notes || '',
                  offline: false,
                },
              ]);
              setAddScreenForm({
                name: '', publisher: '', address: '', category: '', environment: '', size: '', resolution: '', orientation: '', rate: '', dailyTraffic: '', trafficTier: '', totalSlots: '', notes: ''
              });
              showToast('Screen added successfully', 'success');
              setActivePage('manageScreens');
            }}
            publishers={publishers}
          />
        );
      case 'adModeration':
        return (
          <AdModerationPage
            ads={ads}
            setAds={setAds}
            showToast={showToast}
          />
        );
      case 'allCampaigns':
        return <AllCampaignsPage campaigns={campaigns} />;
      case 'businesses':
        return <BusinessesPage businesses={businesses} />;
      case 'publishers':
        return <PublishersPage publishers={publishers} />;
      default:
        return null;
    }
  }

  // --- Main Layout ---
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D0D0F' }}>
        <Sidebar />
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Topbar />
          <Box sx={{ flex: 1, p: 4, background: '#0D0D0F', minHeight: 0, overflow: 'auto' }}>
            {renderPage()}
          </Box>
        </Box>
      </Box>
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: 2, fontWeight: 700 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

// --- ICONS ---
const icons = {
    calendar: (color = '#7C4DFF') => (
      <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><rect x="2" y="4" width="14" height="10" rx="2" stroke={color} strokeWidth="1.5"/><rect x="6" y="1" width="2" height="4" rx="1" fill={color}/><rect x="10" y="1" width="2" height="4" rx="1" fill={color}/></svg>
    ),
    addScreen: (color = '#4CAF50') => (
      <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><rect x="2" y="4" width="14" height="10" rx="2" stroke={color} strokeWidth="1.5"/><path d="M9 7v4M7 9h4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>
    ),
    publisher: (color = '#FFA726') => (
      <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7" stroke={color} strokeWidth="1.5"/><rect x="6" y="7" width="6" height="4" rx="2" fill={color}/></svg>
    ),
  dashboard: (color = '#7C4DFF') => (
    <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><rect x="2" y="8" width="4" height="8" rx="2" fill={color}/><rect x="7" y="2" width="4" height="14" rx="2" fill={color}/><rect x="12" y="11" width="4" height="5" rx="2" fill={color}/></svg>
  ),
  screen: (color = '#7C4DFF') => (
    <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><rect x="2" y="4" width="14" height="8" rx="2" stroke={color} strokeWidth="1.5"/><rect x="6" y="13" width="6" height="2" rx="1" fill={color}/></svg>
  ),
  campaigns: (color = '#4CAF50') => (
    <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7" stroke={color} strokeWidth="1.5"/><rect x="7.25" y="4" width="1.5" height="5" rx="0.75" fill={color}/><rect x="7.25" y="11" width="1.5" height="1.5" rx="0.75" fill={color}/></svg>
  ),
  adModeration: (color = '#FFA726') => (
    <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><rect x="3" y="3" width="12" height="12" rx="3" stroke={color} strokeWidth="1.5"/><rect x="7" y="7" width="4" height="4" rx="2" fill={color}/></svg>
  ),
  business: (color = '#E24B4A') => (
    <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><rect x="2" y="7" width="14" height="7" rx="2" stroke={color} strokeWidth="1.5"/><rect x="5" y="2" width="8" height="5" rx="2" fill={color}/></svg>
  ),
  edit: (color = '#7C4DFF') => (
    <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M13.5 3.5l1 1a2 2 0 0 1 0 2.8l-7.5 7.5-3 1 1-3 7.5-7.5a2 2 0 0 1 2.8 0z" stroke={color} strokeWidth="1.5"/></svg>
  ),
  calendarBtn: (color = '#7C4DFF') => (
    <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><rect x="2" y="4" width="14" height="10" rx="2" stroke={color} strokeWidth="1.5"/><rect x="6" y="1" width="2" height="4" rx="1" fill={color}/><rect x="10" y="1" width="2" height="4" rx="1" fill={color}/></svg>
  ),
  delete: (color = '#E24B4A') => (
    <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><rect x="4" y="7" width="10" height="7" rx="2" stroke={color} strokeWidth="1.5"/><path d="M7 7V5a2 2 0 1 1 4 0v2" stroke={color} strokeWidth="1.5"/><path d="M6 10h6" stroke={color} strokeWidth="1.5"/></svg>
  ),
  pause: (color = '#FFA726') => (
    <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><rect x="5" y="4" width="3" height="10" rx="1.5" fill={color}/><rect x="10" y="4" width="3" height="10" rx="1.5" fill={color}/></svg>
  ),
  view: (color = '#7C4DFF') => (
    <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><ellipse cx="9" cy="9" rx="7" ry="4" stroke={color} strokeWidth="1.5"/><circle cx="9" cy="9" r="2" fill={color}/></svg>
  ),
  suspend: (color = '#E24B4A') => (
    <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><rect x="4" y="7" width="10" height="7" rx="2" stroke={color} strokeWidth="1.5"/><path d="M6 10h6" stroke={color} strokeWidth="1.5"/></svg>
  ),
  warning: (color = '#FFA726') => (
    <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke={color} strokeWidth="2"/><rect x="7.25" y="4" width="1.5" height="5" rx="0.75" fill={color}/><rect x="7.25" y="11" width="1.5" height="1.5" rx="0.75" fill={color}/></svg>
  ),
};

// --- SIDEBAR NAV CONFIG ---
const NAV_ITEMS = [
  { section: 'Overview', items: [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  ]},
  { section: 'Screens', items: [
    { key: 'manageScreens', label: 'Manage screens', icon: 'screen' },
    { key: 'calendar', label: 'Calendar & slots', icon: 'calendar' },
    { key: 'addScreen', label: 'Add screen', icon: 'addScreen' },
  ]},
  { section: 'Ads', items: [
    { key: 'adModeration', label: 'Ad moderation', icon: 'adModeration', badge: { count: 5, color: 'error' } },
    { key: 'allCampaigns', label: 'All campaigns', icon: 'campaigns', badge: { count: 2, color: 'warning' } },
  ]},
  { section: 'Accounts', items: [
    { key: 'businesses', label: 'Businesses', icon: 'business' },
    { key: 'publishers', label: 'Publishers', icon: 'publisher' },
  ]},
];

// --- STATUS COLORS ---
// (removed unused/incomplete object)
