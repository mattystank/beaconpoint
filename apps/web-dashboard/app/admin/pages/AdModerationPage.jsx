import React from 'react';
import { Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip, Tooltip, IconButton } from '@mui/material';

export default function AdModerationPage({ ads, setAds, showToast }) {
  const handleApprove = (id) => {
    setAds((prev) => prev.map(ad => ad.id === id ? { ...ad, status: 'Approved' } : ad));
    showToast('Ad approved', 'success');
  };
  const handleReject = (id) => {
    setAds((prev) => prev.map(ad => ad.id === id ? { ...ad, status: 'Rejected' } : ad));
    showToast('Ad rejected', 'error');
  };

  return (
    <Paper elevation={0} sx={{ p: 3, background: '#18181C', borderRadius: 3, border: '0.5px solid rgba(255,255,255,0.07)' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#fff' }}>Ad Moderation</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Ad Name</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Business</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Screen</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Type</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Dates</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Status</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ads.map((ad) => (
            <TableRow key={ad.id}>
              <TableCell sx={{ color: '#fff', fontWeight: 500 }}>{ad.name}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{ad.business}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{ad.screen}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{ad.type}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{ad.dates}</TableCell>
              <TableCell>
                {ad.status === 'Pending' && <Chip label="Pending" color="warning" size="small" />}
                {ad.status === 'Approved' && <Chip label="Approved" color="success" size="small" />}
                {ad.status === 'Rejected' && <Chip label="Rejected" color="error" size="small" />}
              </TableCell>
              <TableCell>
                {ad.status === 'Pending' && (
                  <>
                    <Tooltip title="Approve">
                      <IconButton color="success" onClick={() => handleApprove(ad.id)}>
                        <span role="img" aria-label="approve">✅</span>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject">
                      <IconButton color="error" onClick={() => handleReject(ad.id)}>
                        <span role="img" aria-label="reject">❌</span>
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
