import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { reduceGame } from '../game/engine/reducer.js'
import { loadGame, saveGame } from '../game/persistence/storage.js'
import { setDisplayCurrency } from '../game/engine/utils.js'
import { playSound } from './audio.js'

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [state, rawDispatch] = useReducer(reduceGame, undefined, loadGame)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [view, setView] = useState('career')
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)

  setDisplayCurrency(state?.settings?.currency ?? 'BRL')

  useEffect(() => {
    if (sessionStarted && state) saveGame(state)
  }, [state, sessionStarted])

  const dispatch = useCallback(action => {
    const sound = action.type === 'START_PROJECT' ? 'confirm' : action.type === 'RESOLVE_DECISION' ? 'event' : action.type === 'ACK_QUEUE' ? 'confirm' : 'click'
    playSound(sound, state?.settings?.sound ?? true)
    rawDispatch(action)
  }, [state?.settings?.sound])

  const startCareer = useCallback(options => {
    rawDispatch({ type: 'RESET_CAREER', options })
    setView('career')
    setSessionStarted(true)
  }, [])

  const continueCareer = useCallback(() => {
    if (state) setSessionStarted(true)
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
  }), [state, sessionStarted, startCareer, continueCareer, dispatch, view, projectModalOpen, resetModalOpen])

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame precisa estar dentro de GameProvider')
  return context
}
