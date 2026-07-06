import React from 'react';
import { createRoot } from 'react-dom/client';
import { PlayerApp } from './PlayerApp';
import { bootstrapOrResumeDevice, getPlayerRuntimeConfig } from './index';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

async function start() {
  const config = getPlayerRuntimeConfig();
  try {
    const session = await bootstrapOrResumeDevice(config);

    root.render(
      <React.StrictMode>
        <PlayerApp
          screenId={session.screenId}
          backendBaseUrl={config.backendBaseUrl}
          deviceToken={session.deviceToken}
          syncIntervalSeconds={session.syncIntervalSeconds}
        />
      </React.StrictMode>
    );
  } catch (error: any) {
    root.render(
      <div style={{ color: 'red', padding: 24, fontFamily: 'sans-serif' }}>
        {error?.message || 'Failed to initialize player device session.'}
      </div>
    );
  }
}

start();
