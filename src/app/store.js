import { useSyncExternalStore } from 'react'
import { reducer, afterLoad } from '../game/engine/reducer.js'
import { SAVE_SCHEMA } from '../game/engine/state.js'

const SAVE_KEY = 'gamebobo-3d-save'

let saveTimer = 0

function createStore() {
  let state = null
  const listeners = new Set()
  const fxListeners = new Set()
  return {
    getState: () => state,
    dispatch(action) {
      const next = reducer(state, action)
      if (next === state) return
      state = next
      if (state?.fx?.length) for (const listener of fxListeners) listener(state.fx, state)
      for (const listener of listeners) listener()
      if (state && action.type !== 'TICK' && action.type !== 'DISMISS_TOAST') {
        clearTimeout(saveTimer)
        saveTimer = setTimeout(() => writeSave(state), 400)
      }
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    onFx(listener) {
      fxListeners.add(listener)
      return () => fxListeners.delete(listener)
    },
  }
}

export const store = createStore()

export function useGame() {
  return useSyncExternalStore(store.subscribe, store.getState)
}

export const dispatch = action => store.dispatch(action)

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.schema !== SAVE_SCHEMA) return null
    return afterLoad(parsed)
  } catch {
    return null
  }
}

export function writeSave(state) {
  if (!state) return
  try {
    const { fx, toasts, ...rest } = state
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...rest, fx: [], toasts: [], savedAt: Date.now() }))
  } catch {
    // Sem armazenamento (aba anônima, cota cheia): o jogo continua na memória.
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    // nada a fazer
  }
}

export function peekSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.schema !== SAVE_SCHEMA) return null
    return { studio: parsed.studio?.name, year: parsed.year, games: parsed.games?.length ?? 0, founder: parsed.staff?.find(p => p.founder)?.name, look: parsed.staff?.find(p => p.founder)?.look }
  } catch {
    return null
  }
}

export const hasLegacySave = () => {
  try {
    return Boolean(localStorage.getItem('gamebobo-save'))
  } catch {
    return false
  }
}

// Atalho de depuração apenas no modo de desenvolvimento.
if (import.meta.env?.DEV && typeof window !== 'undefined') window.__gb = { store, dispatch }
