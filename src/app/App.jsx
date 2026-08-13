import { AppShell } from '../components/layout/AppShell.jsx'
import { DecisionModal } from '../features/events/DecisionModal.jsx'
import { NewProjectModal } from '../features/project/NewProjectModal.jsx'
import { ReleaseModal } from '../features/release/ReleaseModal.jsx'
import { ResetModal } from '../features/settings/ResetModal.jsx'
import { InfoModal } from '../features/events/InfoModal.jsx'
import { AwardsModal } from '../features/awards/AwardsModal.jsx'
import { CareerScreen } from '../screens/CareerScreen.jsx'
import { HistoryScreen } from '../screens/HistoryScreen.jsx'
import { MarketScreen } from '../screens/MarketScreen.jsx'
import { ProjectsScreen } from '../screens/ProjectsScreen.jsx'
import { StudioScreen } from '../screens/StudioScreen.jsx'
import { IndustryScreen } from '../screens/IndustryScreen.jsx'
import { LicensesScreen } from '../screens/LicensesScreen.jsx'
import { ChartsScreen } from '../screens/ChartsScreen.jsx'
import { useGame } from './GameContext.jsx'
import { StartScreen } from '../features/onboarding/StartScreen.jsx'
import { SettingsModal } from '../features/settings/SettingsModal.jsx'

const screens = {
  career: CareerScreen,
  projects: ProjectsScreen,
  studio: StudioScreen,
  market: MarketScreen,
  licenses: LicensesScreen,
  industry: IndustryScreen,
  charts: ChartsScreen,
  history: HistoryScreen,
}

export function App() {
  const { state, view, sessionStarted } = useGame()
  if (!sessionStarted) return <StartScreen />
  const Screen = screens[view] ?? CareerScreen
  const queueItem = state.queue[0]

  return (
    <AppShell>
      <Screen />
      <NewProjectModal />
      <ResetModal />
      <SettingsModal />
      {queueItem?.kind === 'decision' && <DecisionModal decision={queueItem} />}
      {queueItem?.kind === 'release' && <ReleaseModal gameId={queueItem.gameId} />}
      {queueItem?.kind === 'info' && <InfoModal item={queueItem} />}
      {queueItem?.kind === 'awards' && <AwardsModal item={queueItem} />}
    </AppShell>
  )
}
