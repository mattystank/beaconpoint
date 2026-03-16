import React from 'react';
import { Box, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';

// Props: screens, calendarScreen, setCalendarScreen, campaigns, ads
export default function CalendarPage({
  screens = [],
  calendarScreen,
  setCalendarScreen,
  campaigns = [],
  ads = [],
}) {
  // Find the selected screen
  const selectedScreen = screens.find(s => s.id === calendarScreen) || screens[0];
  // Get all ads for this screen
  const screenAds = ads.filter(ad => ad.screen === selectedScreen?.name);
  // Assume slots are for a single day, 24 hours
  const hours = Array.from({ length: 24 }, (_, i) => i);
  // For demo: assign ads randomly to hours (in real app, use ad time data)
  const hourSlots = hours.map(hour => {
    const ad = screenAds[hour % screenAds.length] || null;
    return ad ? { ...ad, hour } : null;
  });

  return (
    <Paper elevation={0} sx={{ p: 3, background: '#18181C', borderRadius: 3, border: '0.5px solid rgba(255,255,255,0.07)' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#fff' }}>Screen Slot Calendar</Typography>
      <FormControl size="small" sx={{ minWidth: 260, mb: 3 }}>
        <InputLabel>Screen</InputLabel>
        <Select
          value={selectedScreen?.id || ''}
          label="Screen"
          onChange={e => setCalendarScreen(Number(e.target.value))}
          sx={{ color: '#fff' }}
        >
          {screens.map(screen => (
            <MenuItem key={screen.id} value={screen.id}>{screen.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Hour</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Ad Name</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Business</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {hours.map(hour => {
            const slot = hourSlots[hour];
            return (
              <TableRow key={hour} sx={{ background: slot ? 'rgba(124,77,255,0.07)' : 'rgba(255,255,255,0.02)' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 500 }}>{hour}:00 - {hour + 1}:00</TableCell>
                <TableCell sx={{ color: slot ? '#fff' : '#B0B0C3' }}>{slot ? slot.name : 'Open slot'}</TableCell>
                <TableCell sx={{ color: slot ? '#fff' : '#B0B0C3' }}>{slot ? slot.business : '-'}</TableCell>
                <TableCell>
                  {slot ? (
                    <Chip label={slot.status} color={slot.status === 'Pending' ? 'warning' : slot.status === 'Approved' ? 'success' : 'default'} size="small" />
                  ) : (
                    <Chip label="Open" color="info" size="small" />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Typography sx={{ color: '#B0B0C3', mt: 2, fontSize: 14 }}>
        Use this view to identify screens with too many open slots or no ads scheduled.
      </Typography>
    </Paper>
  );
}
