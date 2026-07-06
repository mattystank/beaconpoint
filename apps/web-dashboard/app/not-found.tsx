import Link from "next/link";
import { Box, Button, Container, Typography } from "@mui/material";

export default function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Page not found
        </Typography>
        <Typography sx={{ opacity: 0.8, mb: 4 }}>
          The page you requested does not exist or has moved.
        </Typography>
        <Button component={Link} href="/" variant="contained">
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}