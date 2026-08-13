import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App.jsx'
import { GameProvider } from './app/GameContext.jsx'
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/onboarding.css'
import './styles/features.css'
import './styles/responsive.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </StrictMode>,
)
