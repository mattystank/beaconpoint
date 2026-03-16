import React from 'react';
import { createRoot } from 'react-dom/client';
import { PlayerApp } from './PlayerApp';

// Get config from query params or environment
const urlParams = new URLSearchParams(window.location.search);
const screenId = urlParams.get('screenId') || 'demo-screen';
const apiBaseUrl = urlParams.get('apiBaseUrl') || 'http://localhost:8000';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <PlayerApp screenId={screenId} apiBaseUrl={apiBaseUrl} />
  </React.StrictMode>
);
