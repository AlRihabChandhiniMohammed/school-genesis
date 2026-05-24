import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: { background: '#fff', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '12px' },
      }} />
    </BrowserRouter>
  </StrictMode>
)
