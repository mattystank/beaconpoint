"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { apiRequest } from "../../lib/apiClient";
import { getServiceBaseUrl } from "../../lib/auth";

type Device = {
  id: string;
  name: string | null;
  status: string;
  screen_id: string;
  paired_at: string | null;
  last_seen_at: string | null;
  last_playback_state: string | null;
  last_error_code: string | null;
  player_version: string | null;
  previous_player_version: string | null;
  desired_player_version: string | null;
  last_update_status: string | null;
  is_online: boolean;
  pending_command_count: number;
  last_command: {
    id: string;
    command: string;
    status: string;
    acknowledged_at: string | null;
  } | null;
};

type CommandHistoryItem = {
  id: string;
  device_id: string;
  command: string;
  status: string;
  delivery_attempts: number;
  max_delivery_attempts: number;
  created_at: string | null;
  delivered_at: string | null;
  acknowledged_at: string | null;
  result: Record<string, unknown>;
};

type ScreenOption = {
  id: string;
  location_name?: string;
  city?: string;
  state?: string;
};

type RegisterDeviceResponse = {
  device_id: string;
  device_code: string;
  screen_id: string;
  pairing_code: string;
  pairing_code_expires_at: string | null;
};

function inferCompanionPlayerPort(): number {
  return 3000;
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AdminDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [screens, setScreens] = useState<ScreenOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetVersion, setTargetVersion] = useState<string>("");
  const [history, setHistory] = useState<CommandHistoryItem[]>([]);
  const [registering, setRegistering] = useState(false);
  const [registerScreenId, setRegisterScreenId] = useState<string>("");
  const [registerName, setRegisterName] = useState<string>("");
  const [registerResult, setRegisterResult] = useState<RegisterDeviceResponse | null>(null);
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>("all");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; severity: "success" | "error"; message: string }>({
    open: false,
    severity: "success",
    message: "",
  });

  const sorted = useMemo(() => [...devices].sort((a, b) => (a.name || "").localeCompare(b.name || "")), [devices]);
  const allSelected = sorted.length > 0 && selectedIds.length === sorted.length;

  const load = async () => {
    setLoading(true);
    setHistoryLoading(true);
    try {
      const data = await apiRequest<Device[]>("/devices");
      setDevices(data);

      const screenData = await apiRequest<ScreenOption[]>("/screens");
      setScreens(screenData);
      if (!registerScreenId && screenData.length > 0) {
        setRegisterScreenId(screenData[0].id);
      }

      const query = historyStatusFilter === "all" ? "" : `?status_filter=${encodeURIComponent(historyStatusFilter)}`;
      const historyData = await apiRequest<CommandHistoryItem[]>(`/devices/commands/history${query}`);
      setHistory(historyData);
    } catch (error: any) {
      setToast({ open: true, severity: "error", message: error?.message || "Failed to load devices." });
    } finally {
      setLoading(false);
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [historyStatusFilter]);

  const reconcileCommands = async () => {
    setBusyId("reconcile");
    try {
      const result = await apiRequest<{ requeued: number; failed: number }>("/devices/commands/reconcile", {
        method: "POST",
      });
      setToast({
        open: true,
        severity: "success",
        message: `Reconciled stale commands: ${result.requeued} requeued, ${result.failed} failed.`,
      });
      await load();
    } catch (error: any) {
      setToast({ open: true, severity: "error", message: error?.message || "Failed to reconcile commands." });
    } finally {
      setBusyId(null);
    }
  };

  const sendCommand = async (deviceId: string, command: "sync_now" | "restart") => {
    setBusyId(deviceId);
    try {
      await apiRequest(`/devices/${deviceId}/commands`, {
        method: "POST",
        body: { command },
      });
      setToast({ open: true, severity: "success", message: `Queued ${command} for device ${deviceId}.` });
    } catch (error: any) {
      setToast({ open: true, severity: "error", message: error?.message || "Failed to queue command." });
    } finally {
      setBusyId(null);
    }
  };

  const bulkCommand = async (command: "sync_now" | "restart") => {
    if (selectedIds.length === 0) {
      setToast({ open: true, severity: "error", message: "Select at least one device." });
      return;
    }

    setBusyId("bulk");
    try {
      const res = await apiRequest<{ queued: number }>("/devices/commands/bulk", {
        method: "POST",
        body: { device_ids: selectedIds, command },
      });
      setToast({ open: true, severity: "success", message: `Queued ${command} for ${res.queued} devices.` });
      await load();
    } catch (error: any) {
      setToast({ open: true, severity: "error", message: error?.message || "Failed to queue bulk command." });
    } finally {
      setBusyId(null);
    }
  };

  const updateDevice = async (deviceId: string, version: string) => {
    if (!version.trim()) {
      setToast({ open: true, severity: "error", message: "Enter a target release version first." });
      return;
    }

    setBusyId(deviceId);
    try {
      await apiRequest(`/devices/${deviceId}/ota/update`, {
        method: "POST",
        body: { version: version.trim() },
      });
      setToast({ open: true, severity: "success", message: `Queued update ${version} for ${deviceId}.` });
      await load();
    } catch (error: any) {
      setToast({ open: true, severity: "error", message: error?.message || "Failed to queue update." });
    } finally {
      setBusyId(null);
    }
  };

  const bulkUpdate = async () => {
    if (selectedIds.length === 0) {
      setToast({ open: true, severity: "error", message: "Select at least one device." });
      return;
    }
    if (!targetVersion.trim()) {
      setToast({ open: true, severity: "error", message: "Enter a target release version." });
      return;
    }

    setBusyId("bulk-update");
    try {
      const res = await apiRequest<{ queued: number }>("/devices/ota/update/bulk", {
        method: "POST",
        body: { device_ids: selectedIds, version: targetVersion.trim() },
      });
      setToast({ open: true, severity: "success", message: `Queued update ${targetVersion} for ${res.queued} devices.` });
      await load();
    } catch (error: any) {
      setToast({ open: true, severity: "error", message: error?.message || "Failed to queue bulk update." });
    } finally {
      setBusyId(null);
    }
  };

  const rollbackDevice = async (deviceId: string) => {
    setBusyId(deviceId);
    try {
      await apiRequest(`/devices/${deviceId}/ota/rollback`, {
        method: "POST",
      });
      setToast({ open: true, severity: "success", message: `Queued rollback for ${deviceId}.` });
      await load();
    } catch (error: any) {
      setToast({ open: true, severity: "error", message: error?.message || "Failed to queue rollback." });
    } finally {
      setBusyId(null);
    }
  };

  const unpair = async (deviceId: string) => {
    setBusyId(deviceId);
    try {
      await apiRequest(`/devices/${deviceId}/unpair`, { method: "POST" });
      setToast({ open: true, severity: "success", message: "Device unpaired." });
      await load();
    } catch (error: any) {
      setToast({ open: true, severity: "error", message: error?.message || "Failed to unpair device." });
    } finally {
      setBusyId(null);
    }
  };

  const registerDevice = async () => {
    if (!registerScreenId) {
      setToast({ open: true, severity: "error", message: "Select a screen first." });
      return;
    }

    setRegistering(true);
    try {
      const created = await apiRequest<RegisterDeviceResponse>("/devices/register", {
        method: "POST",
        body: {
          screen_id: registerScreenId,
          name: registerName.trim() || null,
        },
      });
      setRegisterResult(created);
      setToast({ open: true, severity: "success", message: "Device codes generated." });
      await load();
    } catch (error: any) {
      setToast({ open: true, severity: "error", message: error?.message || "Failed to register device." });
    } finally {
      setRegistering(false);
    }
  };

  const playerPort = inferCompanionPlayerPort();
  const pairUrl = registerResult
    ? `${getServiceBaseUrl(playerPort)}/r/${encodeURIComponent(registerResult.device_code)}/${encodeURIComponent(registerResult.pairing_code)}`
    : "";

  const copyPairUrl = async () => {
    if (!pairUrl) return;
    try {
      await navigator.clipboard.writeText(pairUrl);
      setToast({ open: true, severity: "success", message: "Player URL copied to clipboard." });
    } catch {
      setToast({ open: true, severity: "error", message: "Failed to copy URL. Please copy manually." });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Fleet Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Device online/offline status, runtime state, and remote commands.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <input
            value={targetVersion}
            onChange={(event) => setTargetVersion(event.target.value)}
            placeholder="Release version (e.g. 1.2.0)"
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: "8px 10px",
              minWidth: 210,
            }}
          />
          <Button variant="contained" onClick={bulkUpdate} disabled={loading || busyId === "bulk-update"}>Bulk Update</Button>
          <Button variant="outlined" onClick={() => bulkCommand("sync_now")} disabled={loading || busyId === "bulk"}>Bulk Sync</Button>
          <Button variant="outlined" onClick={() => bulkCommand("restart")} disabled={loading || busyId === "bulk"}>Bulk Restart</Button>
          <Button variant="outlined" onClick={load} disabled={loading}>Refresh</Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
          Quick Device Registration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Generate two pairing codes from admin, then open the player URL and it will connect automatically.
        </Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel>Screen</InputLabel>
            <Select
              value={registerScreenId}
              label="Screen"
              onChange={(event) => setRegisterScreenId(event.target.value)}
            >
              {screens.map((screen) => (
                <MenuItem key={screen.id} value={screen.id}>
                  {screen.location_name || "Screen"} ({screen.city || "-"}, {screen.state || "-"})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Device Name"
            placeholder="Living Room TV"
            value={registerName}
            onChange={(event) => setRegisterName(event.target.value)}
            sx={{ minWidth: 240 }}
          />
          <Button variant="contained" onClick={registerDevice} disabled={registering || !registerScreenId}>
            {registering ? "Generating..." : "Generate Codes"}
          </Button>
        </Stack>

        {registerResult && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Device Code: <strong>{registerResult.device_code}</strong> | Pairing Code: <strong>{registerResult.pairing_code}</strong>
            <br />
            Open Player URL: {pairUrl}
            <br />
            <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={copyPairUrl}>
              Copy URL
            </Button>
          </Alert>
        )}
      </Paper>

      <Paper sx={{ overflowX: "auto" }}>
        {loading ? (
          <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Device ID</TableCell>
                <TableCell>Screen</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Online</TableCell>
                <TableCell>Playback</TableCell>
                <TableCell>Last Seen</TableCell>
                <TableCell>Error</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>Update</TableCell>
                <TableCell>Cmd Queue</TableCell>
                <TableCell>Last Cmd</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={14}>
                  <Button
                    size="small"
                    onClick={() => setSelectedIds(allSelected ? [] : sorted.map((d) => d.id))}
                  >
                    {allSelected ? "Clear Selection" : "Select All"}
                  </Button>
                  <Typography variant="caption" sx={{ ml: 2 }}>
                    {selectedIds.length} selected
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((device) => (
                <TableRow key={device.id} hover>
                  <TableCell>{device.name || "(Unnamed)"}</TableCell>
                  <TableCell>{device.id}</TableCell>
                  <TableCell>{device.screen_id}</TableCell>
                  <TableCell>
                    <Chip size="small" label={device.status} color={device.status === "active" ? "success" : "default"} />
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={device.is_online ? "Online" : "Offline"} color={device.is_online ? "success" : "default"} />
                  </TableCell>
                  <TableCell>{device.last_playback_state || "-"}</TableCell>
                  <TableCell>{formatDate(device.last_seen_at)}</TableCell>
                  <TableCell>{device.last_error_code || "-"}</TableCell>
                  <TableCell>{device.player_version || "-"}</TableCell>
                  <TableCell>{device.desired_player_version || "-"}</TableCell>
                  <TableCell>{device.last_update_status || "-"}</TableCell>
                  <TableCell>{device.pending_command_count}</TableCell>
                  <TableCell>
                    {device.last_command ? `${device.last_command.command} (${device.last_command.status})` : "-"}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant={selectedIds.includes(device.id) ? "contained" : "outlined"}
                        onClick={() => {
                          setSelectedIds((prev) =>
                            prev.includes(device.id)
                              ? prev.filter((id) => id !== device.id)
                              : [...prev, device.id]
                          );
                        }}
                        disabled={busyId === device.id}
                      >
                        {selectedIds.includes(device.id) ? "Selected" : "Select"}
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => sendCommand(device.id, "sync_now")} disabled={busyId === device.id}>Sync Now</Button>
                      <Button size="small" variant="outlined" onClick={() => sendCommand(device.id, "restart")} disabled={busyId === device.id}>Restart</Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => updateDevice(device.id, targetVersion)}
                        disabled={busyId === device.id}
                      >
                        Update
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        onClick={() => rollbackDevice(device.id)}
                        disabled={busyId === device.id}
                      >
                        Rollback
                      </Button>
                      <Button size="small" color="error" variant="outlined" onClick={() => unpair(device.id)} disabled={busyId === device.id}>Unpair</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={14} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No devices registered yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Paper sx={{ overflowX: "auto", mt: 3, p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Command History</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <select
              value={historyStatusFilter}
              onChange={(event) => setHistoryStatusFilter(event.target.value)}
              style={{ border: "1px solid #ccc", borderRadius: 8, padding: "7px 10px" }}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="delivered">Delivered</option>
              <option value="executed">Executed</option>
              <option value="failed">Failed</option>
            </select>
            <Button variant="outlined" onClick={reconcileCommands} disabled={busyId === "reconcile"}>Reconcile Stale</Button>
            <Button variant="outlined" onClick={load} disabled={historyLoading}>Refresh History</Button>
          </Stack>
        </Stack>

        {historyLoading ? (
          <Box sx={{ py: 5, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={22} />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Created</TableCell>
                <TableCell>Device</TableCell>
                <TableCell>Command</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Attempts</TableCell>
                <TableCell>Delivered</TableCell>
                <TableCell>Acked</TableCell>
                <TableCell>Result</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{formatDate(row.created_at)}</TableCell>
                  <TableCell>{row.device_id}</TableCell>
                  <TableCell>{row.command}</TableCell>
                  <TableCell>
                    <Chip size="small" label={row.status} color={row.status === "failed" ? "error" : row.status === "executed" ? "success" : "default"} />
                  </TableCell>
                  <TableCell>{row.delivery_attempts}/{row.max_delivery_attempts}</TableCell>
                  <TableCell>{formatDate(row.delivered_at)}</TableCell>
                  <TableCell>{formatDate(row.acknowledged_at)}</TableCell>
                  <TableCell>{Object.keys(row.result || {}).length ? JSON.stringify(row.result) : "-"}</TableCell>
                </TableRow>
              ))}
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No command records for this filter.
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
