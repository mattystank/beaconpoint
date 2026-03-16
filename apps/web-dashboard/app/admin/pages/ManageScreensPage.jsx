import React from "react";
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Tooltip, IconButton } from "@mui/material";

export function ManageScreensPage({
  screens,
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  handleDelete,
  handleCalendar,
  icons,
  StatusPill
}) {
  const filteredScreens = screens.filter(s =>
    (!search || s.name.toLowerCase().includes(search.toLowerCase())) &&
    (!typeFilter || s.type === typeFilter) &&
    (!statusFilter || (statusFilter === 'Offline' ? s.offline : !s.offline))
  );

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
}
