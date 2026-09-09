import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-sans/700.css';
import '@fontsource/geist-sans/800.css';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/500.css';
import '@fontsource/geist-mono/600.css';
import '@fontsource/geist-mono/700.css';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register a basic service worker for PWA/offline support in production builds.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL ?? '/';
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;
    const swUrl = `${normalizedBase}sw.js`;
    navigator.serviceWorker
      .register(swUrl)
      .catch(err => console.warn('Service worker registration failed', err));
  });
}
