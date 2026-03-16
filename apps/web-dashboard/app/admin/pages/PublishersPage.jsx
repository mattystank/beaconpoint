import React from 'react';
import { Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, TextField, MenuItem, FormControl, InputLabel, Select, Chip } from '@mui/material';

export default function PublishersPage({ publishers }) {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');

  const filtered = publishers.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || p.status === statusFilter)
  );

  return (
    <Paper elevation={0} sx={{ p: 3, background: '#18181C', borderRadius: 3, border: '0.5px solid rgba(255,255,255,0.07)' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#fff' }}>Publishers</Typography>
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
            <MenuItem value="Pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Publisher</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Screens</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Earnings</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Payout</TableCell>
            <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((p) => (
            <TableRow key={p.name}>
              <TableCell sx={{ color: '#fff', fontWeight: 500 }}>{p.name}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{p.screens}</TableCell>
              <TableCell sx={{ color: '#fff' }}>${p.earnings}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{p.payout}</TableCell>
              <TableCell>
                {p.status === 'Active' && <Chip label="Active" color="success" size="small" />}
                {p.status === 'Pending' && <Chip label="Pending" color="warning" size="small" />}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} sx={{ color: '#B0B0C3', textAlign: 'center', py: 4 }}>
                No publishers found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
