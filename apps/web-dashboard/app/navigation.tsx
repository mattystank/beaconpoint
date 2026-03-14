import Link from "next/link";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
export default function Navigation() {
  // Placeholder: Assume admin if localStorage.admin === 'true'
  const isAdmin = typeof window !== 'undefined' && window.localStorage?.getItem('admin') === 'true';
  return (
    <AppBar sx={{ border: '1px solid #000'}} position="static" color="transparent" elevation={0}>
      <Toolbar>
        <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 800, letterSpacing: -1, color: '#6f42c1' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#ffffff' }}>Beacon Point</Link>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component={Link} href="/marketplace" variant="contained" sx={{
            background: 'linear-gradient(90deg, #6f42c1 0%, #24292f 100%)',
            color: '#fff',
            borderRadius: 3,
            fontWeight: 700,
            textTransform: 'none',
            px: 2
          }}>Marketplace</Button>
          <Button component={Link} href="/ads" variant="outlined" sx={{
            color: '#FFF',
            borderColor: '#FFF',
            borderRadius: 3,
            fontWeight: 700,
            textTransform: 'none',
            px: 2
          }}>My Ads</Button>
          <Button component={Link} href="/screens" variant="outlined" sx={{
            color: '#FFF',
            borderColor: '#FFF',
            borderRadius: 3,
            fontWeight: 700,
            textTransform: 'none',
            px: 2
          }}>My Screens</Button>
          {isAdmin && (
            <Button component={Link} href="/admin" variant="contained" sx={{
              background: 'linear-gradient(90deg, #24292f 0%, #6f42c1 100%)',
              color: '#FFF',
              borderRadius: 3,
              fontWeight: 700,
              textTransform: 'none',
              px: 2
            }}>Admin</Button>
          )}
          {isAdmin && (
            <Button component={Link} href="/analytics" variant="outlined" sx={{
              color: '#FFF',
              borderColor: '#FFF',
              borderRadius: 3,
              fontWeight: 700,
              textTransform: 'none',
              px: 2
            }}>Analytics</Button>
          )}
          <Button component={Link} href="/login" variant="text" sx={{
            color: '#FFF',
            fontWeight: 700,
            textTransform: 'none',
            px: 2
          }}>Login</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
