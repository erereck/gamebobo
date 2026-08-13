import { VERSION_INFO as versionInfo } from '../../version.js'
import { hydrateV6, migrateV1, migrateV2, migrateV3, migrateV4, migrateV5 } from './migrate.js'

const SAVE_KEY = 'gamebobo-save'
const LEGACY_KEY = 'gamebobo-save-v1'

export function loadGame() {
  try {
    const current = JSON.parse(localStorage.getItem(SAVE_KEY))
    if (current?.schema === versionInfo.saveSchema) return hydrateV6(current)
    if (current?.schema === 5) return migrateV5(current)
    if (current?.schema === 4) return migrateV5(migrateV4(current))
    if (current?.schema === 3) return migrateV5(migrateV4(migrateV3(current)))
    if (current?.schema === 2) return migrateV5(migrateV4(migrateV3(migrateV2(current))))

    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY))
    if (legacy?.version === 1) return migrateV1(legacy)
  } catch (error) {
    console.warn('Save ignorado porque não pôde ser lido.', error)
  }
  return null
}

export function saveGame(state) {
  if (!state) return
  const saved = {
    ...state,
    meta: { ...state.meta, lastSavedAt: new Date().toISOString(), version: versionInfo.version },
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(saved))
  if (state.meta.migratedFrom === 1) localStorage.removeItem(LEGACY_KEY)
}
