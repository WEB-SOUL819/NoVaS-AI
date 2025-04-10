
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initCacheManager } from './utils/cacheManager.ts'

// Initialize cache management
const cacheManager = initCacheManager();

// Add cleanup on window unload
window.addEventListener('beforeunload', () => {
  cacheManager.cleanup();
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

