import Link from "next/link";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import Logo from "./Logo";
export default function Navigation() {
  // Placeholder: Assume admin if localStorage.admin === 'true'
  const isAdmin = typeof window !== 'undefined' && window.localStorage?.getItem('admin') === 'true';
  return (
    <AppBar sx={{ border: '1px solid #000'}} position="static" color="transparent" elevation={0}>
      <Toolbar>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexGrow: 1 }}>
          <Logo style={{ marginRight: 12 }} />
        </Link>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component={Link} href="/marketplace" variant="contained" sx={{
            background: 'linear-gradient(90deg, #6f42c1 0%, #24292f 100%)',
            color: '#fff',
            borderRadius: 3,
            fontWeight: 700,
            textTransform: 'none',
            px: 2
          }}>Marketplace</Button>
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
