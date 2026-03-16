import React from "react";
import { Box, Grid, Paper, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

export function DashboardPage({ statCards, recentActivity, screensAttention, icons, StatusPill }) {
  return (
    <Box>
      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Paper elevation={0} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, background: '#1C1C20', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 3 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, background: card.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontFamily: 'DM Serif Display, serif', fontWeight: 700, fontSize: 28, color: '#fff', mb: 0.5 }}>{card.value}</Typography>
                <Typography sx={{ color: '#B0B0C3', fontWeight: 500, fontSize: 15 }}>{card.label}</Typography>
                {card.change && <Typography sx={{ color: card.color, fontWeight: 700, fontSize: 13 }}>{card.change}</Typography>}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity Table */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#fff', fontSize: 20 }}>Recent activity</Typography>
      <TableContainer component={Paper} elevation={0} sx={{ background: '#1C1C20', borderRadius: 3, border: '0.5px solid rgba(255,255,255,0.07)', mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Event</TableCell>
              <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Screen</TableCell>
              <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Actor</TableCell>
              <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Time</TableCell>
              <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentActivity.map((row, i) => (
              <TableRow key={i}>
                <TableCell sx={{ color: '#fff' }}>{row.event}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{row.screen}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{row.actor}</TableCell>
                <TableCell sx={{ color: '#B0B0C3' }}>{row.time}</TableCell>
                <TableCell>
                  {row.status === 'Success' && <StatusPill label="Success" color="#4CAF50" />}
                  {row.status === 'Warning' && <StatusPill label="Warning" color="#FFA726" />}
                  {row.status === 'Error' && <StatusPill label="Error" color="#E24B4A" />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Screens Needing Attention Table */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#fff', fontSize: 20 }}>Screens needing attention</Typography>
      <TableContainer component={Paper} elevation={0} sx={{ background: '#1C1C20', borderRadius: 3, border: '0.5px solid rgba(255,255,255,0.07)' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Issue</TableCell>
              <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Screen</TableCell>
              <TableCell sx={{ color: '#B0B0C3', fontWeight: 700 }}>Priority</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {screensAttention.map((row, i) => (
              <TableRow key={i}>
                <TableCell sx={{ color: '#fff' }}>{row.issue}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{row.screen}</TableCell>
                <TableCell>
                  {row.priority === 'High' && <StatusPill label="High" color="#E24B4A" />}
                  {row.priority === 'Medium' && <StatusPill label="Medium" color="#FFA726" />}
                  {row.priority === 'Low' && <StatusPill label="Low" color="#7C4DFF" />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
