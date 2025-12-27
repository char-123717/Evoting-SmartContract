import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Import global styles (Tailwind + Custom)
import App from './App.jsx'

// ==========================================
// Frontend Entry Point
// ==========================================
// This is the first file executed by the browser (bundled by Vite).
// It sets up the React environment and mounts the app to the DOM.

// 1. Find the HTML element with id 'root' (in index.html)
// 2. Create a React Root for that element
// 3. Render the <App /> component inside it
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Main Application Component */}
    <App />
  </StrictMode>,
)
