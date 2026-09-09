import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/fraunces';
import './index.css';
import App from './App';
import { initTheme } from './lib/themes';

initTheme();

// Ask the browser not to evict our IndexedDB data under storage pressure.
if (navigator.storage?.persist) void navigator.storage.persist();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
