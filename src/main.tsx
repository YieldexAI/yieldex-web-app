import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './app/globals.css';
import Home from './app/page';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Home />
  </StrictMode>
);