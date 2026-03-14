"use client";
import React, { useEffect, useState } from "react";
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, TextField, MenuItem, Box } from "@mui/material";

interface ScreenListing {
  id: string;
  title: string;
  description: string;
  price_per_hour: number;
  price_per_day: number;
  active: boolean;
  screen: {
    city: string;
    venue_type: string;
    estimated_daily_views: number;
    screen_size: string;
    resolution: string;
  };
}

const filtersInitial = {
  city: "",
  venue_type: "",
  min_views: "",
  screen_size: "",
  price: "",
  resolution: ""
};

export default function MarketplacePage() {
  const [listings, setListings] = useState<ScreenListing[]>([]);
  const [filters, setFilters] = useState(filtersInitial);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    // TODO: Replace with real backend call
    setListings([
      {
        id: "1",
        title: "Coffee Shop Screen — Baltimore",
        description: "Estimated Daily Views: 1,200\nScreen Size: 55\"",
        price_per_hour: 10,
        price_per_day: 60,
        active: true,
        screen: {
          city: "Baltimore",
          venue_type: "Coffee Shop",
          estimated_daily_views: 1200,
          screen_size: "55\"",
          resolution: "1920x1080"
        }
      },
      {
        id: "2",
        title: "Gym Lobby Display — Baltimore",
        description: "Estimated Daily Views: 3,000\nScreen Size: 75\"",
        price_per_hour: 18,
        price_per_day: 100,
        active: true,
        screen: {
          city: "Baltimore",
          venue_type: "Gym",
          estimated_daily_views: 3000,
          screen_size: "75\"",
          resolution: "3840x2160"
        }
      },
      {
        id: "3",
        title: "Apartment Lobby Screen",
        description: "Estimated Daily Views: 800",
        price_per_hour: 7,
        price_per_day: 40,
        active: true,
        screen: {
          city: "Baltimore",
          venue_type: "Apartment",
          estimated_daily_views: 800,
          screen_size: "50\"",
          resolution: "1920x1080"
        }
      }
    ]);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredListings = listings.filter((listing) => {
    const { city, venue_type, min_views, screen_size, price, resolution } = filters;
    return (
      (!city || listing.screen.city.toLowerCase().includes(city.toLowerCase())) &&
      (!venue_type || listing.screen.venue_type.toLowerCase().includes(venue_type.toLowerCase())) &&
      (!min_views || listing.screen.estimated_daily_views >= parseInt(min_views)) &&
      (!screen_size || listing.screen.screen_size.includes(screen_size)) &&
      (!price || listing.price_per_hour <= parseFloat(price)) &&
      (!resolution || listing.screen.resolution.includes(resolution))
    );
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      <Typography variant="h2" align="center" gutterBottom>
        Screen Marketplace
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        <TextField label="City" name="city" value={filters.city} onChange={handleFilterChange} size="small" />
        <TextField label="Venue Type" name="venue_type" value={filters.venue_type} onChange={handleFilterChange} size="small" />
        <TextField label="Min Views" name="min_views" value={filters.min_views} onChange={handleFilterChange} size="small" type="number" />
        <TextField label="Screen Size" name="screen_size" value={filters.screen_size} onChange={handleFilterChange} size="small" />
        <TextField label="Max Price/hr" name="price" value={filters.price} onChange={handleFilterChange} size="small" type="number" />
        <TextField label="Resolution" name="resolution" value={filters.resolution} onChange={handleFilterChange} size="small" />
      </Box>
      <Grid container spacing={4}>
        {filteredListings.map((listing) => (
          <Grid item xs={12} md={4} key={listing.id}>
            <Card sx={{ minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>{listing.title}</Typography>
                <Typography variant="body1">{listing.description}</Typography>
                <Typography variant="body2" color="primary">${listing.price_per_hour}/hour</Typography>
              </CardContent>
              <CardActions>
                <Button variant="contained" color="primary" fullWidth>Book Now</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
