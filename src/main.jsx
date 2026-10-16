import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource/martian-mono/400.css'
import '@fontsource/martian-mono/700.css'
import { App } from './app/App.jsx'
import './styles/tokens.css'
import './styles/base.css'
import './styles/hud.css'
import './styles/sheets.css'
import './styles/modals.css'
import './styles/panels.css'
import './styles/start.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
