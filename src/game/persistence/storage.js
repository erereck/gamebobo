import { VERSION_INFO as versionInfo } from '../../version.js'
import { migrateV1, migrateV2, migrateV3, migrateV4, migrateV5 } from './migrate.js'
import { hydrateV7, migrateV6 } from './migrateV7.js'

const SAVE_KEY = 'gamebobo-save'
const LEGACY_KEY = 'gamebobo-save-v1'
const SLOT_PREFIX = 'gamebobo-save-slot-'
const ACTIVE_SLOT_KEY = 'gamebobo-active-save-slot'

export const MAX_SAVE_SLOTS = 10

const validSlotId = slotId => {
  const value = Number(slotId)
  return Number.isInteger(value) && value >= 1 && value <= MAX_SAVE_SLOTS ? value : 1
}

const slotKey = slotId => `${SLOT_PREFIX}${validSlotId(slotId)}`

function hydrateSave(current) {
  if (!current) return null
  if (current.schema === versionInfo.saveSchema) return hydrateV7(current)
  if (current.schema === 6) return migrateV6(current)
  if (current.schema === 5) return migrateV6(migrateV5(current))
  if (current.schema === 4) return migrateV6(migrateV5(migrateV4(current)))
  if (current.schema === 3) return migrateV6(migrateV5(migrateV4(migrateV3(current))))
  if (current.schema === 2) return migrateV6(migrateV5(migrateV4(migrateV3(migrateV2(current)))))
  if (current.version === 1) return migrateV6(migrateV1(current))
  return null
}

function readJson(key) {
  const raw = localStorage.getItem(key)
  return raw ? JSON.parse(raw) : null
}

function savedPayload(state) {
  return {
    ...state,
    meta: { ...state.meta, lastSavedAt: new Date().toISOString(), version: versionInfo.version },
  }
}

function ensureLegacySaveMigrated() {
  const hasAnySlot = Array.from({ length: MAX_SAVE_SLOTS }, (_, index) => localStorage.getItem(slotKey(index + 1))).some(Boolean)
  if (hasAnySlot) return

  try {
    const current = readJson(SAVE_KEY)
    if (current) {
      localStorage.setItem(slotKey(1), JSON.stringify(current))
      localStorage.setItem(ACTIVE_SLOT_KEY, '1')
      localStorage.removeItem(SAVE_KEY)
      return
    }

    const legacy = readJson(LEGACY_KEY)
    if (legacy?.version === 1) {
      const migrated = hydrateSave(legacy)
      if (migrated) {
        localStorage.setItem(slotKey(1), JSON.stringify(savedPayload(migrated)))
        localStorage.setItem(ACTIVE_SLOT_KEY, '1')
        localStorage.removeItem(LEGACY_KEY)
      }
    }
  } catch (error) {
    console.warn('Save antigo não pôde ser migrado para os slots.', error)
  }
}

export function getActiveSaveSlot() {
  ensureLegacySaveMigrated()
  return validSlotId(localStorage.getItem(ACTIVE_SLOT_KEY) ?? 1)
}

export function setActiveSaveSlot(slotId) {
  const id = validSlotId(slotId)
  localStorage.setItem(ACTIVE_SLOT_KEY, String(id))
  return id
}

export function loadGame(slotId = getActiveSaveSlot()) {
  ensureLegacySaveMigrated()
  try {
    return hydrateSave(readJson(slotKey(slotId)))
  } catch (error) {
    console.warn(`Save do slot ${validSlotId(slotId)} ignorado porque não pôde ser lido.`, error)
    return null
  }
}

export function saveGame(state, slotId = getActiveSaveSlot()) {
  if (!state) return
  const id = setActiveSaveSlot(slotId)
  localStorage.setItem(slotKey(id), JSON.stringify(savedPayload(state)))
  if (state.meta.migratedFrom === 1) localStorage.removeItem(LEGACY_KEY)
}

export function deleteSaveSlot(slotId) {
  const id = validSlotId(slotId)
  localStorage.removeItem(slotKey(id))
  if (getActiveSaveSlot() === id) {
    const next = Array.from({ length: MAX_SAVE_SLOTS }, (_, index) => index + 1).find(candidate => localStorage.getItem(slotKey(candidate))) ?? 1
    setActiveSaveSlot(next)
  }
}

export function listSaveSlots() {
  ensureLegacySaveMigrated()
  return Array.from({ length: MAX_SAVE_SLOTS }, (_, index) => {
    const id = index + 1
    try {
      const raw = readJson(slotKey(id))
      if (!raw) return { id, empty: true }
      const state = hydrateSave(raw)
      if (!state) return { id, empty: true, invalid: true }
      return {
        id,
        empty: false,
        studioName: state.studio.name,
        playerName: state.player.name,
        year: state.date.year,
        month: state.date.month,
        games: state.games.length,
        money: state.player.money,
        reputation: state.player.reputation,
        currency: state.settings.currency,
        startYear: state.meta.startYear,
        lastSavedAt: raw.meta?.lastSavedAt ?? null,
        version: raw.meta?.version ?? null,
      }
    } catch {
      return { id, empty: true, invalid: true }
    }
  })
}

export function firstEmptySaveSlot() {
  return listSaveSlots().find(slot => slot.empty)?.id ?? null
}
