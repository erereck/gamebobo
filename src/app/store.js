import { useSyncExternalStore } from 'react'
import { reducer, afterLoad } from '../game/engine/reducer.js'
import { SAVE_SCHEMA } from '../game/engine/state.js'

// Dez carreiras independentes, cada uma no seu espaço do navegador.
export const SLOT_COUNT = 10
const slotKey = slot => `gamebobo-3d-slot-${slot}`
const LEGACY_3D_KEY = 'gamebobo-3d-save'

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
      if (!state) clearTimeout(saveTimer)
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

const read = key => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.schema === SAVE_SCHEMA ? parsed : null
  } catch {
    return null
  }
}

// O save único das primeiras builds 3D vira o espaço 1.
function migrateSingleSave() {
  try {
    const old = localStorage.getItem(LEGACY_3D_KEY)
    if (old && !localStorage.getItem(slotKey(1))) localStorage.setItem(slotKey(1), old)
    if (old) localStorage.removeItem(LEGACY_3D_KEY)
  } catch {
    // sem armazenamento
  }
}

export function loadSave(slot) {
  const parsed = read(slotKey(slot))
  if (!parsed) return null
  parsed.slot = slot
  return afterLoad(parsed)
}

export function writeSave(state) {
  if (!state) return
  try {
    const { fx, toasts, ...rest } = state
    localStorage.setItem(slotKey(state.slot ?? 1), JSON.stringify({ ...rest, fx: [], toasts: [], savedAt: Date.now() }))
  } catch {
    // Sem armazenamento (aba anônima, cota cheia): o jogo continua na memória.
  }
}

export function deleteSlot(slot) {
  try {
    localStorage.removeItem(slotKey(slot))
  } catch {
    // nada a fazer
  }
}

export function listSlots() {
  migrateSingleSave()
  return Array.from({ length: SLOT_COUNT }, (_, i) => {
    const slot = i + 1
    const parsed = read(slotKey(slot))
    if (!parsed) return { slot, empty: true }
    const founder = parsed.staff?.find(person => person.founder)
    return {
      slot,
      studio: parsed.studio?.name,
      year: parsed.year,
      games: parsed.games?.length ?? 0,
      founder: founder?.name,
      look: founder?.look,
      mode: parsed.mode?.id ?? 'tradicional',
      savedAt: parsed.savedAt ?? 0,
    }
  })
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
