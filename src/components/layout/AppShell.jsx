import { Header } from './Header.jsx'
import { StatStrip } from './StatStrip.jsx'
import { TabNav } from './TabNav.jsx'

export function AppShell({ children }) {
  return (
    <div className="game-shell">
      <Header />
      <TabNav />
      <StatStrip />
      <main>{children}</main>
    </div>
  )
}
