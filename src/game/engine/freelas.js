import { FREELAS } from '../data/content/freelas.js'
import { eraBar } from '../data/economy.js'
import { sample } from './rng.js'

export function generateFreelas(state, random = Math.random) {
  const year = state.year
  const pool = FREELAS.filter(item => (item.minYear ?? 0) <= year && (item.maxYear ?? 9999) >= year)
  return sample(pool, 3, random).map(item => ({ ...item, need: { ...item.need } }))
}

// Pontos exigidos crescem com a régua da época, como num jogo de verdade.
export function freelaNeed(item, year) {
  const unit = eraBar(year) * 10
  return Object.fromEntries(Object.entries(item.need).map(([key, value]) => [key, Math.round(value * unit)]))
}

export function freelaProgress(project) {
  const keys = Object.keys(project.need)
  if (!keys.length) return 1
  return keys.reduce((sum, key) => sum + Math.min(1, (project.pts[key] ?? 0) / project.need[key]), 0) / keys.length
}
