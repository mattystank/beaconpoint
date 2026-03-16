import React from 'react';
import { Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, TextField, MenuItem, FormControl, InputLabel, Select } from '@mui/material';

export default function AllCampaignsPage({ campaigns }) {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');

  const filtered = campaigns.filter(c =>
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.business.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || c.status === statusFilter)
  );

  return (
    <Paper elevation={0} sx={{ p: 3, background: '#18181C', borderRadius: 3, border: '0.5px solid rgba(255,255,255,0.07)' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#fff' }}>All Campaigns</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search by name or business..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 220, flex: 1, input: { color: '#fff' } }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)} sx={{ color: '#fff' }}>
            <MenuItem value="">All statuses</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Running">Running</MenuItem>
            <MenuItem value="Ended">Ended</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Campaign</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Business</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Screen</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Slots</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Budget</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Dates</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((c) => (
            <TableRow key={c.id}>
              <TableCell sx={{ color: '#fff', fontWeight: 500 }}>{c.name}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{c.business}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{c.screen}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{c.slots}</TableCell>
              <TableCell sx={{ color: '#fff' }}>${c.budget}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{c.dates}</TableCell>
              <TableCell>
                {c.status === 'Pending' && <span style={{ color: '#FFA726', fontWeight: 700 }}>Pending</span>}
                {c.status === 'Running' && <span style={{ color: '#4CAF50', fontWeight: 700 }}>Running</span>}
                {c.status === 'Ended' && <span style={{ color: '#B0B0C3', fontWeight: 700 }}>Ended</span>}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} sx={{ color: '#B0B0C3', textAlign: 'center', py: 4 }}>
                No campaigns found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
