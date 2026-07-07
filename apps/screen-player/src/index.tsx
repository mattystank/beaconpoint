import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PlayerApp } from './PlayerApp';
import { bootstrapOrResumeDevice, getPlayerRuntimeConfig, type DeviceSession, type PlayerRuntimeConfig } from './runtime';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

function PairingScreen({
  backendBaseUrl,
  setBackendBaseUrl,
  deviceCode,
  setDeviceCode,
  pairingCode,
  setPairingCode,
  loading,
  error,
  onSubmit,
  onUseExisting,
}: {
  backendBaseUrl: string;
  setBackendBaseUrl: (value: string) => void;
  deviceCode: string;
  setDeviceCode: (value: string) => void;
  pairingCode: string;
  setPairingCode: (value: string) => void;
  loading: boolean;
  error: string | null;
  onSubmit: () => void;
  onUseExisting: () => void;
}) {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1220' }}>
      <div style={{ width: 'min(520px, 92vw)', background: '#111827', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, padding: 24, color: '#fff' }}>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Register Screen Player</h2>
        <p style={{ marginTop: 0, marginBottom: 16, opacity: 0.85 }}>
          Enter codes from Admin Devices to activate this screen.
        </p>

        <label style={{ display: 'block', marginBottom: 6 }}>Device code (6 digits)</label>
        <input
          value={deviceCode}
          onChange={(event) => setDeviceCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="123456"
          style={{ width: '100%', marginBottom: 14, padding: '10px 12px', borderRadius: 10, border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
        />

        <label style={{ display: 'block', marginBottom: 6 }}>Pairing code (6 digits)</label>
        <input
          value={pairingCode}
          onChange={(event) => setPairingCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="654321"
          style={{ width: '100%', marginBottom: 14, padding: '10px 12px', borderRadius: 10, border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
        />

        <label style={{ display: 'block', marginBottom: 6 }}>Backend URL</label>
        <input
          value={backendBaseUrl}
          onChange={(event) => setBackendBaseUrl(event.target.value)}
          placeholder="https://...-8010.app.github.dev"
          style={{ width: '100%', marginBottom: 16, padding: '10px 12px', borderRadius: 10, border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
        />

        {error ? <div style={{ color: '#fda4af', marginBottom: 12 }}>{error}</div> : null}

        <button
          onClick={onSubmit}
          disabled={loading || deviceCode.length !== 6 || pairingCode.length !== 6}
          style={{
            width: '100%',
            padding: '11px 14px',
            border: 'none',
            borderRadius: 10,
            background: loading ? '#334155' : '#0ea5e9',
            color: '#fff',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Registering...' : 'Register & Start'}
        </button>
        <button
          onClick={onUseExisting}
          disabled={loading}
          style={{
            width: '100%',
            marginTop: 10,
            padding: '11px 14px',
            border: '1px solid #334155',
            borderRadius: 10,
            background: '#0f172a',
            color: '#cbd5e1',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          Use Existing Session
        </button>
      </div>
    </div>
  );
}

function PlayerBootstrapApp() {
  const initial = useMemo(() => getPlayerRuntimeConfig(), []);
  const [backendBaseUrl, setBackendBaseUrl] = useState(initial.backendBaseUrl);
  const [deviceCode, setDeviceCode] = useState(initial.deviceCode || '');
  const [pairingCode, setPairingCode] = useState(initial.pairingCode || '');
  const [session, setSession] = useState<DeviceSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tryBootstrap = async (config: PlayerRuntimeConfig) => {
    setLoading(true);
    setError(null);
    try {
      const nextSession = await bootstrapOrResumeDevice(config);
      setSession(nextSession);
    } catch (err: any) {
      setSession(null);
      setError(err?.message || 'Failed to register player');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <PairingScreen
        backendBaseUrl={backendBaseUrl}
        setBackendBaseUrl={setBackendBaseUrl}
        deviceCode={deviceCode}
        setDeviceCode={setDeviceCode}
        pairingCode={pairingCode}
        setPairingCode={setPairingCode}
        loading={loading}
        error={error}
        onSubmit={() => {
          tryBootstrap({
            deviceId: initial.deviceId,
            deviceCode,
            pairingCode,
            backendBaseUrl,
          });
        }}
        onUseExisting={() => {
          tryBootstrap({
            deviceId: initial.deviceId,
            backendBaseUrl,
          });
        }}
      />
    );
  }

  return (
    <PlayerApp
      screenId={session.screenId}
      backendBaseUrl={backendBaseUrl}
      deviceToken={session.deviceToken}
      syncIntervalSeconds={session.syncIntervalSeconds}
    />
  );
}

root.render(
  <React.StrictMode>
    <PlayerBootstrapApp />
  </React.StrictMode>
);
