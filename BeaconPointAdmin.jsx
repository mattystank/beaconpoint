
import React, { useState, useEffect, useMemo } from "react";

// Sidebar nav config
const NAV_ITEMS = [
  { section: 'Overview', items: [
    { key: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  ]},
  { section: 'Screens', items: [
    { key: 'manageScreens', label: 'Manage screens', icon: ScreenIcon },
    { key: 'calendar', label: 'Calendar & slots', icon: CalendarIcon },
    { key: 'addScreen', label: 'Add screen', icon: AddScreenIcon },
  ]},
  { section: 'Ads', items: [
    { key: 'adModeration', label: 'Ad moderation', icon: AdModerationIcon, badge: { count: 5, color: 'error' } },
    { key: 'allCampaigns', label: 'All campaigns', icon: CampaignsIcon, badge: { count: 2, color: 'warning' } },
  ]},
  { section: 'Accounts', items: [
    { key: 'businesses', label: 'Businesses', icon: BusinessIcon },
    { key: 'publishers', label: 'Publishers', icon: PublisherIcon },
  ]},
];

// Inline SVG icon components
function DashboardIcon({ color = '#B0B0C3' }) {
  return <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="2" y="2" width="7" height="7" rx="2" fill={color}/><rect x="11" y="2" width="7" height="4" rx="2" fill={color}/><rect x="2" y="11" width="4" height="7" rx="2" fill={color}/><rect x="8" y="11" width="10" height="7" rx="2" fill={color}/></svg>;
}
function ScreenIcon({ color = '#B0B0C3' }) {
  return <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="3" y="5" width="14" height="8" rx="2" fill={color}/><rect x="7" y="15" width="6" height="2" rx="1" fill={color}/></svg>;
}
function CalendarIcon({ color = '#B0B0C3' }) {
  return <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="3" y="5" width="14" height="12" rx="2" fill={color}/><rect x="7" y="2" width="2" height="4" rx="1" fill={color}/><rect x="11" y="2" width="2" height="4" rx="1" fill={color}/></svg>;
}
function AddScreenIcon({ color = '#B0B0C3' }) {
  return <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="3" y="5" width="14" height="8" rx="2" fill={color}/><rect x="9" y="8" width="2" height="6" rx="1" fill={color}/><rect x="6" y="11" width="8" height="2" rx="1" fill={color}/></svg>;
}
function AdModerationIcon({ color = '#B0B0C3' }) {
  return <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="3" y="5" width="14" height="8" rx="2" fill={color}/><circle cx="10" cy="9" r="2" fill={color}/></svg>;
}
function CampaignsIcon({ color = '#B0B0C3' }) {
  return <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="3" y="5" width="14" height="8" rx="2" fill={color}/><rect x="7" y="8" width="6" height="4" rx="1" fill={color}/></svg>;
}
function BusinessIcon({ color = '#B0B0C3' }) {
  return <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="3" y="7" width="14" height="8" rx="2" fill={color}/><rect x="7" y="4" width="6" height="3" rx="1" fill={color}/></svg>;
}
function PublisherIcon({ color = '#B0B0C3' }) {
  return <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="3" y="7" width="14" height="8" rx="2" fill={color}/><circle cx="10" cy="11" r="2" fill={color}/></svg>;
}

// Main component
export default function BeaconPointAdmin() {
  useGoogleFonts();
  const [activePage, setActivePage] = useState('dashboard');

  // Layout constants
  const SIDEBAR_WIDTH = 220;

  // Sidebar
  function Sidebar() {
    return (
      <Drawer
        variant="permanent"
        PaperProps={{
          sx: {
            width: SIDEBAR_WIDTH,
            background: '#141416',
            borderRight: '0.5px solid rgba(255,255,255,0.07)',
            boxSizing: 'border-box',
            color: '#fff',
            pt: 0,
            pb: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
        sx={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}
      >
        <Box sx={{ px: 3, pt: 4, pb: 2 }}>
          {/* Logo */}
          <Typography variant="h4" sx={{ fontFamily: 'DM Serif Display, serif', fontWeight: 700, color: '#fff', mb: 0, letterSpacing: -1 }}>
            Beacon<span style={{ color: '#7C4DFF', fontStyle: 'italic' }}>Point</span>
          </Typography>
          <Box sx={{ mt: 0.5, mb: 2 }}>
            <Chip label="ADMIN PORTAL" size="small" sx={{ background: '#E24B4A', color: '#fff', fontWeight: 700, fontSize: 12, borderRadius: 40, letterSpacing: 1, mt: 0.5 }} />
          </Box>
        </Box>
        <Box sx={{ flex: 1, px: 1, overflowY: 'auto' }}>
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
                    <item.icon color={isActive ? '#7C4DFF' : '#B0B0C3'} />
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

  // Topbar
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

  // Main layout
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0D0D0F' }}>
        <Sidebar />
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Topbar />
          <Box sx={{ flex: 1, p: 4, background: '#0D0D0F', minHeight: 0, overflow: 'auto' }}>
            {/* Page content will go here */}
            {/* {activePage === 'dashboard' && <DashboardPage />} */}
            {/* {activePage === 'manageScreens' && <ManageScreensPage />} */}
            {/* {activePage === 'calendar' && <CalendarSlotsPage />} */}
            {/* {activePage === 'addScreen' && <AddScreenPage />} */}
            {/* {activePage === 'adModeration' && <AdModerationPage />} */}
            {/* {activePage === 'allCampaigns' && <AllCampaignsPage />} */}
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
}
