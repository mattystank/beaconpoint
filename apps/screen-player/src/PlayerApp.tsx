import React, { useEffect, useMemo, useState } from 'react';
import { sendDeviceHeartbeat } from './index';

// Import shared types
import { Advertisement, AdSchedule } from '../../../packages/api/types';

interface PlayerAppProps {
  screenId: string;
  backendBaseUrl: string;
  deviceToken: string;
  syncIntervalSeconds: number;
}

interface ScheduledAd {
  ad: Advertisement;
  schedule: AdSchedule;
}

interface DevicePlaylistResponse {
  screenId: string;
  checksum: string;
  generatedAt: string;
  items: ScheduledAd[];
}

interface DeviceCommandEnvelope {
  command: {
    id: string;
    command: 'restart' | 'sync_now' | 'apply_release';
    payload: Record<string, unknown>;
    created_at: string | null;
  } | null;
}

const CACHE_KEY_PREFIX = 'bp-player-cache:';
const PLAYER_VERSION_KEY = 'bp-player-version';
const PLAYER_PREVIOUS_VERSION_KEY = 'bp-player-previous-version';

function getPlayerVersion(): string {
  return localStorage.getItem(PLAYER_VERSION_KEY) || 'dev-local';
}

function getPreviousPlayerVersion(): string | undefined {
  return localStorage.getItem(PLAYER_PREVIOUS_VERSION_KEY) || undefined;
}

function applyPlayerVersion(nextVersion: string): { previous: string; current: string } {
  const current = getPlayerVersion();
  localStorage.setItem(PLAYER_PREVIOUS_VERSION_KEY, current);
  localStorage.setItem(PLAYER_VERSION_KEY, nextVersion);
  return { previous: current, current: nextVersion };
}

function getCacheKey(screenId: string): string {
  return `${CACHE_KEY_PREFIX}${screenId}`;
}

async function fetchWithRetry<T>(url: string, attempts: number, delayMs: number, headers?: Record<string, string>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      return (await res.json()) as T;
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Unknown request error');
}

export const PlayerApp: React.FC<PlayerAppProps> = ({ screenId, backendBaseUrl, deviceToken, syncIntervalSeconds }) => {
  const [ads, setAds] = useState<ScheduledAd[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [checksum, setChecksum] = useState<string | null>(null);
  const [syncNonce, setSyncNonce] = useState(0);
  const [playerVersion, setPlayerVersion] = useState<string>(() => getPlayerVersion());
  const [previousPlayerVersion, setPreviousPlayerVersion] = useState<string | undefined>(() => getPreviousPlayerVersion());
  const [updateStatus, setUpdateStatus] = useState<string | undefined>(undefined);

  const currentContentHash = useMemo(() => (ads[currentIdx] as any)?.ad?.contentHash || ads[currentIdx]?.ad?.mediaUrl || undefined, [ads, currentIdx]);

  // Fetch scheduled ads for this screen
  useEffect(() => {
    let mounted = true;
    const authHeaders = { Authorization: `Bearer ${deviceToken}` };

    async function fetchSchedule() {
      try {
        const playlist = await fetchWithRetry<DevicePlaylistResponse>(`${backendBaseUrl}/devices/playlist`, 3, 700, authHeaders);
        const scheduledAds = playlist.items || [];

        if (mounted) {
          if (playlist.checksum !== checksum) {
            setAds(scheduledAds);
            setChecksum(playlist.checksum);
          }
          setError(null);
        }

        localStorage.setItem(getCacheKey(screenId), JSON.stringify({
          checksum: playlist.checksum,
          items: scheduledAds,
        }));
      } catch (err: any) {
        const cached = localStorage.getItem(getCacheKey(screenId));
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as { checksum: string; items: ScheduledAd[] };
            if (mounted) {
              setAds(parsed.items || []);
              setChecksum(parsed.checksum || null);
              setError('Using cached playlist due to network issue.');
            }
            return;
          } catch {
            // continue to error state
          }
        }

        if (mounted) {
          setError('Failed to fetch schedule or ads.');
        }
      }
    }

    fetchSchedule();
    const poll = setInterval(fetchSchedule, Math.max(5000, syncIntervalSeconds * 1000));

    return () => {
      mounted = false;
      clearInterval(poll);
    };
  }, [screenId, backendBaseUrl, deviceToken, syncIntervalSeconds, checksum, syncNonce]);

  // Loop through ads
  useEffect(() => {
    if (ads.length === 0) return;
    const duration = ads[currentIdx].ad.durationSec * 1000;
    const timer = setTimeout(() => {
      setCurrentIdx((idx) => (idx + 1) % ads.length);
    }, duration);
    return () => clearTimeout(timer);
  }, [ads, currentIdx]);

  // Heartbeat with playback details.
  useEffect(() => {
    const playbackState = error ? 'error' : ads.length > 0 ? 'playing' : 'idle';
    const errorCode = error ? 'PLAYBACK_ERROR' : undefined;

    const send = () => {
      sendDeviceHeartbeat(
        { backendBaseUrl, deviceToken },
        {
          playbackState,
          lastContentHash: currentContentHash,
          errorCode,
            playerVersion,
            previousPlayerVersion,
            updateStatus,
        }
      ).catch(() => {
        // Best effort: keep UI running even if heartbeat endpoint is unavailable.
      });
    };

    send();
    const interval = setInterval(send, 15000);
    return () => clearInterval(interval);
  }, [backendBaseUrl, deviceToken, ads.length, currentContentHash, error, playerVersion, previousPlayerVersion, updateStatus]);

  // Emit proof-of-play when an ad begins display.
  useEffect(() => {
    if (ads.length === 0) return;
    const current = ads[currentIdx];
    if (!current) return;

    fetch(`${backendBaseUrl}/devices/proof-of-play`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${deviceToken}`,
      },
      body: JSON.stringify({
        ad_id: current.ad.id,
        booking_id: current.schedule.id,
        content_hash: (current.ad as any).contentHash || current.ad.mediaUrl,
        duration_seconds: current.ad.durationSec,
        played_at: new Date().toISOString(),
      }),
    }).catch(() => {
      // Non-blocking telemetry.
    });
  }, [ads, currentIdx, backendBaseUrl, deviceToken]);

  // Poll remote commands queued by fleet dashboard.
  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`${backendBaseUrl}/devices/commands/next`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${deviceToken}`,
          },
        });

        if (!res.ok) {
          return;
        }

        const body = (await res.json()) as DeviceCommandEnvelope;
        const cmd = body.command;
        if (!cmd || cancelled) {
          return;
        }

        let ackStatus: 'executed' | 'failed' = 'executed';
        let ackResult: Record<string, unknown> = {};

        try {
          if (cmd.command === 'sync_now') {
            setSyncNonce((prev) => prev + 1);
            ackResult = { message: 'sync triggered' };
          } else if (cmd.command === 'restart') {
            ackResult = { message: 'restart scheduled' };
            } else if (cmd.command === 'apply_release') {
              const nextVersion = typeof cmd.payload.version === 'string' ? cmd.payload.version : '';
              if (!nextVersion) {
                throw new Error('Missing target version');
              }
              const versionState = applyPlayerVersion(nextVersion);
              setPlayerVersion(versionState.current);
              setPreviousPlayerVersion(versionState.previous);
              setUpdateStatus('executed');
              ackResult = {
                message: 'release applied',
                fromVersion: versionState.previous,
                toVersion: versionState.current,
                manifestUrl: cmd.payload.manifest_url,
              };
          }
        } catch (err: any) {
          ackStatus = 'failed';
            setUpdateStatus('failed');
          ackResult = { message: err?.message || 'command failed' };
        }

        await fetch(`${backendBaseUrl}/devices/commands/${cmd.id}/ack`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${deviceToken}`,
          },
          body: JSON.stringify({ status: ackStatus, result: ackResult }),
        });

        if (cmd.command === 'restart' && ackStatus === 'executed') {
          window.setTimeout(() => window.location.reload(), 200);
        }
      } catch {
        // ignore polling errors
      }
    };

    poll();
    const interval = window.setInterval(poll, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [backendBaseUrl, deviceToken]);

  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (ads.length === 0) return <div>Loading ads...</div>;

  const currentAd = ads[currentIdx].ad;

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {currentAd.mediaType.startsWith('image') ? (
        <img src={currentAd.mediaUrl} alt={currentAd.title} style={{ maxWidth: '100%', maxHeight: '100%' }} />
      ) : currentAd.mediaType.startsWith('video') ? (
        <video src={currentAd.mediaUrl} autoPlay controls={false} style={{ maxWidth: '100%', maxHeight: '100%' }} />
      ) : (
        <div style={{ color: 'white' }}>Unsupported media type</div>
      )}
    </div>
  );
};
