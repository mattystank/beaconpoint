"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { apiRequest } from "../lib/apiClient";

type BookingStatus = "draft" | "pending" | "approved" | "running" | "completed" | "canceled";

type Booking = {
  id: string;
  advertiser_id: string;
  screen_id: string;
  ad_id: string;
  start_date: string | null;
  end_date: string | null;
  total_price: number;
  status: BookingStatus;
};

const STATUS_COLORS: Record<BookingStatus, "default" | "warning" | "success" | "info" | "error"> = {
  draft: "default",
  pending: "warning",
  approved: "success",
  running: "info",
  completed: "success",
  canceled: "error",
};

const STATUS_ACTIONS: Record<BookingStatus, Array<{ label: string; next: BookingStatus }>> = {
  draft: [{ label: "Submit", next: "pending" }, { label: "Cancel", next: "canceled" }],
  pending: [{ label: "Approve", next: "approved" }, { label: "Cancel", next: "canceled" }],
  approved: [{ label: "Start", next: "running" }, { label: "Cancel", next: "canceled" }],
  running: [{ label: "Complete", next: "completed" }, { label: "Cancel", next: "canceled" }],
  completed: [],
  canceled: [],
};

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ open: boolean; severity: "success" | "error"; message: string }>({
    open: false,
    severity: "success",
    message: "",
  });

  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => (a.start_date || "").localeCompare(b.start_date || "")),
    [bookings]
  );

  const allSelected = sortedBookings.length > 0 && sortedBookings.every((booking) => selectedIds.has(booking.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(sortedBookings.map((booking) => booking.id)));
  };

  const toggleSelectOne = (bookingId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookingId)) {
        next.delete(bookingId);
      } else {
        next.add(bookingId);
      }
      return next;
    });
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<Booking[]>("/bookings");
      setBookings(data);
    } catch (error: any) {
      setToast({
        open: true,
        severity: "error",
        message: error?.message || "Failed to load bookings.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const transitionBooking = async (bookingId: string, nextStatus: BookingStatus) => {
    setBusyId(bookingId);
    try {
      await apiRequest<{ id: string; status: BookingStatus }>(`/bookings/${bookingId}/status`, {
        method: "PUT",
        body: { status: nextStatus },
      });

      setBookings((prev) => prev.map((booking) => (booking.id === bookingId ? { ...booking, status: nextStatus } : booking)));
      setToast({
        open: true,
        severity: "success",
        message: `Booking moved to ${nextStatus}.`,
      });
    } catch (error: any) {
      setToast({
        open: true,
        severity: "error",
        message: error?.message || "Failed to update booking status.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const bulkTransition = async (nextStatus: BookingStatus) => {
    const selected = sortedBookings.filter((booking) => selectedIds.has(booking.id));
    if (selected.length === 0) {
      setToast({ open: true, severity: "error", message: "Select at least one booking first." });
      return;
    }

    const applicable = selected.filter((booking) => STATUS_ACTIONS[booking.status].some((action) => action.next === nextStatus));
    const skipped = selected.length - applicable.length;

    if (applicable.length === 0) {
      setToast({ open: true, severity: "error", message: "No selected bookings can transition to that status." });
      return;
    }

    const succeeded: string[] = [];
    const failed: string[] = [];

    for (const booking of applicable) {
      try {
        await apiRequest<{ id: string; status: BookingStatus }>(`/bookings/${booking.id}/status`, {
          method: "PUT",
          body: { status: nextStatus },
        });
        succeeded.push(booking.id);
      } catch {
        failed.push(booking.id);
      }
    }

    if (succeeded.length > 0) {
      setBookings((prev) =>
        prev.map((booking) => (succeeded.includes(booking.id) ? { ...booking, status: nextStatus } : booking))
      );
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      succeeded.forEach((id) => next.delete(id));
      return next;
    });

    setToast({
      open: true,
      severity: failed.length > 0 ? "error" : "success",
      message: `Batch result: ${succeeded.length} updated, ${failed.length} failed, ${skipped} skipped.`,
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Admin Booking Operations</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage lifecycle transitions: approve, run, complete, and cancel.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={Link} href="/admin/devices" variant="contained">Devices</Button>
          <Button variant="outlined" onClick={() => bulkTransition("approved")} disabled={loading || selectedIds.size === 0}>Batch Approve</Button>
          <Button variant="outlined" onClick={() => bulkTransition("running")} disabled={loading || selectedIds.size === 0}>Batch Start</Button>
          <Button variant="outlined" onClick={() => bulkTransition("completed")} disabled={loading || selectedIds.size === 0}>Batch Complete</Button>
          <Button color="error" variant="outlined" onClick={() => bulkTransition("canceled")} disabled={loading || selectedIds.size === 0}>Batch Cancel</Button>
          <Button variant="outlined" onClick={loadBookings} disabled={loading}>Refresh</Button>
        </Stack>
      </Stack>

      <Paper sx={{ overflowX: "auto" }}>
        {loading ? (
          <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Booking</TableCell>
                <TableCell>Screen</TableCell>
                <TableCell>Ad</TableCell>
                <TableCell>Range</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={!allSelected && selectedIds.size > 0}
                    onChange={toggleSelectAll}
                    inputProps={{ "aria-label": "select all bookings" }}
                  />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedBookings.map((booking) => (
                <TableRow key={booking.id} hover>
                  <TableCell>{booking.id}</TableCell>
                  <TableCell>{booking.screen_id}</TableCell>
                  <TableCell>{booking.ad_id}</TableCell>
                  <TableCell>{formatDate(booking.start_date)} to {formatDate(booking.end_date)}</TableCell>
                  <TableCell>${Number(booking.total_price || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip size="small" color={STATUS_COLORS[booking.status]} label={booking.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {STATUS_ACTIONS[booking.status].length === 0 && <Typography variant="caption">No actions</Typography>}
                      {STATUS_ACTIONS[booking.status].map((action) => (
                        <Button
                          key={action.next}
                          size="small"
                          variant="contained"
                          onClick={() => transitionBooking(booking.id, action.next)}
                          disabled={busyId === booking.id}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.has(booking.id)}
                      onChange={() => toggleSelectOne(booking.id)}
                      inputProps={{ "aria-label": `select booking ${booking.id}` }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {sortedBookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No bookings available.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast((prev) => ({ ...prev, open: false }))}>
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Container>
  );
}
