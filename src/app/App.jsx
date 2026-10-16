import { useCallback, useEffect, useRef, useState } from 'react'
import { dispatch, store, useGame, writeSave } from './store.js'
import { setSoundEnabled, sfx, vibrate } from './audio.js'
import { syncMusic } from './music.js'
import { isBlocked } from '../game/engine/tick.js'
import { eraAt } from '../game/data/economy.js'
import { OfficeView } from '../features/office/OfficeView.jsx'
import { StaffBadge } from '../features/office/StaffBadge.jsx'
import { TopBar } from '../features/hud/TopBar.jsx'
import { Dock } from '../features/hud/Dock.jsx'
import { Cartridge } from '../features/hud/Cartridge.jsx'
import { Toasts } from '../features/hud/Toasts.jsx'
import { QueueModal } from '../features/modals/QueueModal.jsx'
import { NewGameFlow } from '../features/create/NewGameFlow.jsx'
import { FreelaSheet } from '../features/create/FreelaSheet.jsx'
import { CameloShop } from '../features/camelo/CameloShop.jsx'
import { Panel } from '../features/panels/Panel.jsx'
import { StartScreen } from '../features/start/StartScreen.jsx'

const SPEED_MS = { 1: 1500, 2: 750, 3: 320 }

function useClock(paused, speed) {
  useEffect(() => {
    if (paused || !speed) return undefined
    const id = setInterval(() => {
      if (document.hidden) return
      const state = store.getState()
      if (!state || isBlocked(state)) return
      dispatch({ type: 'TICK' })
      if (state.week % 4 === 3) writeSave(store.getState())
    }, SPEED_MS[speed] ?? 1500)
    return () => clearInterval(id)
  }, [paused, speed])
}

// Sons para acontecimentos do motor.
function useFxSounds() {
  useEffect(() => store.onFx(list => {
    for (const item of list) {
      if (item.type === 'sale' && Math.random() < .2) sfx.coin()
      if (item.type === 'event') sfx.alert()
      if (item.type === 'idea') sfx.pop()
      if (item.type === 'ready') sfx.chime()
      if (item.type === 'visitor') sfx.alert()
      if (item.type === 'cheer') sfx.fanfare()
      if (item.type === 'expense' && Math.random() < .3) sfx.tick()
    }
  }), [])
}

export function App() {
  const state = useGame()
  if (!state) return <StartScreen />
  return <Game />
}

function Game() {
  const state = useGame()
  const [panel, setPanel] = useState(null)
  const [sheet, setSheet] = useState(null)
  const [badge, setBadge] = useState(null)
  const era = eraAt(state.year)
  const speed = state.settings.speed
  const night = state.projects.some(project => !project.ready && project.pace === 'crunch')
  const paused = Boolean(panel || sheet)
  useClock(paused, speed)
  useFxSounds()

  useEffect(() => setSoundEnabled(state.settings.sound), [state.settings.sound])
  useEffect(() => {
    const start = () => syncMusic(state.settings.music, state.settings.musicVolume)
    start()
    window.addEventListener('pointerdown', start, { once: true })
    return () => window.removeEventListener('pointerdown', start)
  }, [state.settings.music, state.settings.musicVolume])
  useEffect(() => {
    const save = () => writeSave(store.getState())
    window.addEventListener('beforeunload', save)
    document.addEventListener('visibilitychange', save)
    return () => {
      window.removeEventListener('beforeunload', save)
      document.removeEventListener('visibilitychange', save)
    }
  }, [])

  const lastPick = useRef(0)
  const onPick = useCallback((id, screen) => {
    const current = store.getState()
    if (!id) return setBadge(null)
    if (id === 'visitor') {
      sfx.select()
      return setSheet('camelo')
    }
    if (id === 'cat') return
    if (current.ideas.some(idea => idea.staffId === id)) {
      sfx.pop()
      vibrate(14)
      setBadge(null)
      return dispatch({ type: 'OPEN_IDEA', staffId: id })
    }
    lastPick.current = Date.now()
    sfx.click()
    setBadge({ id, screen })
  }, [])

  const openPanel = name => {
    sfx.click()
    setBadge(null)
    setPanel(current => (current === name ? null : name))
  }

  return (
    <div className={`game era-${era.id} ${night ? 'is-night' : ''}`} style={{ '--sky-a': era.sky[0], '--sky-b': era.sky[1] }}>
      <div className="sky" aria-hidden="true" />
      <OfficeView onPick={onPick} />
      <TopBar onSettings={() => openPanel('settings')} paused={paused} />
      <Dock active={panel} onOpen={openPanel} />
      <Cartridge onNew={() => { sfx.select(); setSheet('new') }} onFreela={() => { sfx.select(); setSheet('freela') }} />
      <Toasts />
      {badge && <StaffBadge id={badge.id} screen={badge.screen} onClose={() => setBadge(null)} />}
      {panel && <Panel name={panel} onClose={() => setPanel(null)} />}
      {sheet === 'new' && <NewGameFlow onClose={() => setSheet(null)} />}
      {sheet === 'freela' && <FreelaSheet onClose={() => setSheet(null)} />}
      {sheet === 'camelo' && <CameloShop onClose={() => setSheet(null)} />}
      <QueueModal />
    </div>
  )
}
