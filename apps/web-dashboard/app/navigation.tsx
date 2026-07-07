"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import Logo from "./Logo";
import { clearAuth, getStoredUser } from "./lib/auth";

export default function Navigation() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const syncRole = () => {
      const user = getStoredUser();
      setRole(user?.role || null);
    };

    syncRole();
    window.addEventListener("storage", syncRole);
    window.addEventListener("bp-auth-changed", syncRole);

    return () => {
      window.removeEventListener("storage", syncRole);
      window.removeEventListener("bp-auth-changed", syncRole);
    };
  }, []);

  const isAdmin = role === "admin";

  const handleLogout = () => {
    clearAuth();
    setRole(null);
    router.push("/login");
    router.refresh();
  };

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
          {isAdmin && (
            <Button component={Link} href="/admin" variant="outlined" sx={{
              color: '#FFF',
              borderColor: '#FFF',
              borderRadius: 3,
              fontWeight: 700,
              textTransform: 'none',
              px: 2
            }}>Booking Ops</Button>
          )}
          {isAdmin && (
            <Button component={Link} href="/admin/devices" variant="outlined" sx={{
              color: '#FFF',
              borderColor: '#FFF',
              borderRadius: 3,
              fontWeight: 700,
              textTransform: 'none',
              px: 2
            }}>Devices</Button>
          )}
          <Button component={Link} href="/login" variant="text" sx={{
            color: '#FFF',
            fontWeight: 700,
            textTransform: 'none',
            px: 2
          }}>{role ? "Switch Account" : "Login"}</Button>
          {role && (
            <Button onClick={handleLogout} variant="outlined" sx={{
              color: '#FFF',
              borderColor: '#FFF',
              fontWeight: 700,
              textTransform: 'none',
              px: 2
            }}>Logout</Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
