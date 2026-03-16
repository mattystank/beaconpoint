import React from 'react';
import { Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, TextField, MenuItem, FormControl, InputLabel, Select } from '@mui/material';

export default function BusinessesPage({ businesses }) {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');

  const filtered = businesses.filter(b =>
    (!search || b.name.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || b.status === statusFilter)
  );

  return (
    <Paper elevation={0} sx={{ p: 3, background: '#18181C', borderRadius: 3, border: '0.5px solid rgba(255,255,255,0.07)' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#fff' }}>Businesses</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 220, flex: 1, input: { color: '#fff' } }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)} sx={{ color: '#fff' }}>
            <MenuItem value="">All statuses</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Under review">Under review</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Business</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Status</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Campaigns</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Spend</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((b) => (
            <TableRow key={b.name}>
              <TableCell sx={{ color: '#fff', fontWeight: 500 }}>{b.name}</TableCell>
              <TableCell sx={{ color: b.status === 'Active' ? '#4CAF50' : '#FFA726', fontWeight: 700 }}>{b.status}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{b.campaigns}</TableCell>
              <TableCell sx={{ color: '#fff' }}>${b.spend}</TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} sx={{ color: '#B0B0C3', textAlign: 'center', py: 4 }}>
                No businesses found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
