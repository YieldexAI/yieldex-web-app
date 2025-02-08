import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './app/globals.css';
import Home from './app/page';
import { WagmiProvider } from 'wagmi'
import { config } from './config/wagmi'

function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) return null

  return (
    <WagmiProvider config={config}>
      <Home />
    </WagmiProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);