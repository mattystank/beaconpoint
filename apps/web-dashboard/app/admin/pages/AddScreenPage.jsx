import React from 'react';
import { Box, Paper, Typography, TextField, MenuItem, Button, Grid, FormControl, InputLabel, Select } from '@mui/material';

export default function AddScreenPage({
  addScreenForm,
  setAddScreenForm,
  onAddScreen,
  publishers
}) {
  const [errors, setErrors] = React.useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddScreenForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!addScreenForm.name) newErrors.name = 'Screen name is required';
    if (!addScreenForm.publisher) newErrors.publisher = 'Publisher is required';
    if (!addScreenForm.location) newErrors.location = 'Location is required';
    if (!addScreenForm.type) newErrors.type = 'Type is required';
    if (!addScreenForm.rate) newErrors.rate = 'Rate is required';
    if (!addScreenForm.totalSlots) newErrors.totalSlots = 'Total slots required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onAddScreen();
  };

  return (
    <Paper elevation={0} sx={{ maxWidth: 600, mx: 'auto', p: 4, background: '#18181C', borderRadius: 3, border: '0.5px solid rgba(255,255,255,0.07)' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#fff' }}>Add New Screen</Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Screen Name"
              name="name"
              value={addScreenForm.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              required
              sx={{ input: { color: '#fff' } }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required error={!!errors.publisher}>
              <InputLabel>Publisher</InputLabel>
              <Select
                name="publisher"
                value={addScreenForm.publisher}
                label="Publisher"
                onChange={handleChange}
                sx={{ color: '#fff' }}
              >
                {publishers.map((p) => (
                  <MenuItem key={p.name} value={p.name}>{p.name}</MenuItem>
                ))}
              </Select>
              {errors.publisher && <Typography color="error" variant="caption">{errors.publisher}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Location"
              name="location"
              value={addScreenForm.location || ''}
              onChange={handleChange}
              error={!!errors.location}
              helperText={errors.location}
              fullWidth
              required
              sx={{ input: { color: '#fff' } }}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth required error={!!errors.type}>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={addScreenForm.type || ''}
                label="Type"
                onChange={handleChange}
                sx={{ color: '#fff' }}
              >
                <MenuItem value="Indoor">Indoor</MenuItem>
                <MenuItem value="Outdoor">Outdoor</MenuItem>
              </Select>
              {errors.type && <Typography color="error" variant="caption">{errors.type}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Rate ($/hr)"
              name="rate"
              type="number"
              value={addScreenForm.rate}
              onChange={handleChange}
              error={!!errors.rate}
              helperText={errors.rate}
              fullWidth
              required
              sx={{ input: { color: '#fff' } }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Total Slots"
              name="totalSlots"
              type="number"
              value={addScreenForm.totalSlots}
              onChange={handleChange}
              error={!!errors.totalSlots}
              helperText={errors.totalSlots}
              fullWidth
              required
              sx={{ input: { color: '#fff' } }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Daily Traffic"
              name="dailyTraffic"
              type="number"
              value={addScreenForm.dailyTraffic}
              onChange={handleChange}
              fullWidth
              sx={{ input: { color: '#fff' } }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Size (inches)"
              name="size"
              value={addScreenForm.size}
              onChange={handleChange}
              fullWidth
              sx={{ input: { color: '#fff' } }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Resolution"
              name="resolution"
              value={addScreenForm.resolution}
              onChange={handleChange}
              fullWidth
              sx={{ input: { color: '#fff' } }}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Orientation</InputLabel>
              <Select
                name="orientation"
                value={addScreenForm.orientation || ''}
                label="Orientation"
                onChange={handleChange}
                sx={{ color: '#fff' }}
              >
                <MenuItem value="Landscape">Landscape</MenuItem>
                <MenuItem value="Portrait">Portrait</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Traffic Tier</InputLabel>
              <Select
                name="trafficTier"
                value={addScreenForm.trafficTier || ''}
                label="Traffic Tier"
                onChange={handleChange}
                sx={{ color: '#fff' }}
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Notes"
              name="notes"
              value={addScreenForm.notes}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
              sx={{ input: { color: '#fff' }, textarea: { color: '#fff' } }}
            />
          </Grid>
        </Grid>
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 3, fontWeight: 700, borderRadius: 2 }}>
          Add Screen
        </Button>
      </Box>
    </Paper>
  );
}
