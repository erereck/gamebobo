import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { reduceGame } from '../game/engine/reducer.js'
import { loadGame, saveGame } from '../game/persistence/storage.js'
import { setDisplayCurrency } from '../game/engine/utils.js'
import { playSound } from './audio.js'
import { syncMusic } from './music.js'

const GameContext = createContext(null)
const scrollHome = () => requestAnimationFrame(() => {
  const from = window.scrollY
  if (!from || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, 0)
    return
  }
  const started = performance.now()
  const duration = 240
  const tick = now => {
    const progress = Math.min(1, (now - started) / duration)
    const eased = 1 - Math.pow(1 - progress, 4)
    window.scrollTo(0, Math.round(from * (1 - eased)))
    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})

export function GameProvider({ children }) {
  const [state, rawDispatch] = useReducer(reduceGame, undefined, loadGame)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [view, rawSetView] = useState('career')
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)

  setDisplayCurrency(state?.settings?.currency ?? 'BRL')

  useEffect(() => {
    if (sessionStarted && state) saveGame(state)
  }, [state, sessionStarted])

  useEffect(() => {
    if (!sessionStarted || !state) return
    syncMusic({
      playing: state.settings.musicPlaying !== false,
      muted: state.settings.musicMuted === true,
      volume: state.settings.musicVolume ?? .18,
    })
  }, [sessionStarted, state?.settings?.musicPlaying, state?.settings?.musicMuted, state?.settings?.musicVolume])

  const dispatch = useCallback(action => {
    const sound = action.type === 'START_PROJECT' ? 'confirm' : action.type === 'RESOLVE_DECISION' ? 'event' : action.type === 'ACK_QUEUE' ? 'confirm' : 'click'
    if (action.type !== 'SET_MUSIC_VOLUME') playSound(sound, state?.settings?.sound ?? true)
    if (action.type === 'TOGGLE_MUSIC_PLAYBACK') syncMusic({ playing: state?.settings?.musicPlaying === false, muted: state?.settings?.musicMuted, volume: state?.settings?.musicVolume ?? .18 })
    if (action.type === 'TOGGLE_MUSIC_MUTE') syncMusic({ playing: state?.settings?.musicPlaying !== false, muted: !state?.settings?.musicMuted, volume: state?.settings?.musicVolume ?? .18 })
    if (action.type === 'SET_MUSIC_VOLUME') syncMusic({ playing: state?.settings?.musicPlaying !== false, muted: state?.settings?.musicMuted, volume: action.volume })
    rawDispatch(action)
    if (['MONTH_ACTION', 'ACK_QUEUE', 'RESOLVE_DECISION'].includes(action.type)) scrollHome()
  }, [state?.settings?.sound, state?.settings?.musicPlaying, state?.settings?.musicMuted, state?.settings?.musicVolume])

  const setView = useCallback(nextView => {
    rawSetView(nextView)
    scrollHome()
  }, [])

  const startCareer = useCallback(options => {
    syncMusic({ playing: true, muted: false, volume: .18 })
    rawDispatch({ type: 'RESET_CAREER', options })
    rawSetView('career')
    setSessionStarted(true)
    scrollHome()
  }, [])

  const continueCareer = useCallback(() => {
    if (state) {
      syncMusic({ playing: state.settings.musicPlaying !== false, muted: state.settings.musicMuted === true, volume: state.settings.musicVolume ?? .18 })
      setSessionStarted(true)
      scrollHome()
    }
  }, [state])

  useEffect(() => {
    const onKeyDown = event => {
      if (!sessionStarted || !state || event.ctrlKey || event.metaKey || event.altKey || event.target.matches('input, textarea, select') || document.querySelector('dialog[open]')) return
      const map = state.currentContract ? { c: 'contract', d: 'rest' } : state.currentProject ? { a: 'develop', m: 'promote', f: 'work', d: 'rest' } : { n: 'new', t: 'work', e: 'study', p: 'research', d: 'rest' }
      const action = map[event.key.toLowerCase()]
      if (!action || state.queue.length) return
      event.preventDefault()
      if (action === 'new') setProjectModalOpen(true)
      else dispatch({ type: 'MONTH_ACTION', payload: { action } })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dispatch, sessionStarted, state])

  const value = useMemo(() => ({
    state,
    sessionStarted,
    startCareer,
    continueCareer,
    dispatch,
    view,
    setView,
    projectModalOpen,
    setProjectModalOpen,
    resetModalOpen,
    setResetModalOpen,
    settingsModalOpen,
    setSettingsModalOpen,
  }), [state, sessionStarted, startCareer, continueCareer, dispatch, view, projectModalOpen, resetModalOpen, settingsModalOpen])

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame precisa estar dentro de GameProvider')
  return context
}
