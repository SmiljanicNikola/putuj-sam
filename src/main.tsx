import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/dm-sans/latin-400.css'
import '@fontsource/dm-sans/latin-500.css'
import '@fontsource/dm-sans/latin-600.css'
import '@fontsource/dm-sans/latin-700.css'
import '@fontsource/dm-sans/latin-ext-400.css'
import '@fontsource/dm-sans/latin-ext-500.css'
import '@fontsource/dm-sans/latin-ext-600.css'
import '@fontsource/dm-sans/latin-ext-700.css'
import '@fontsource/instrument-serif/latin-ext-400.css'
import '@fontsource/instrument-serif/latin-ext-400-italic.css'
import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import 'leaflet/dist/leaflet.css'
import './styles.css'
import './place-page.css'
import './accommodation.css'
import App from './App'

const root = document.getElementById('root')!
const app = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// Filtered URLs differ from the unfiltered build-time HTML. Mount them directly;
// all clean public URLs hydrate their existing content without replacing it.
const params = new URLSearchParams(window.location.search)
const filteredUrl = ['q', 'region', 'kategorija', 'mesto'].some((key) => params.has(key))
if (root.hasChildNodes() && !filteredUrl) ReactDOM.hydrateRoot(root, app)
else ReactDOM.createRoot(root).render(app)
