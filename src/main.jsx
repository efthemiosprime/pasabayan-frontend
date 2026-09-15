import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/site.css';
import { Site } from './site/Site.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Site />
  </StrictMode>,
);
