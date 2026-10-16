import { modeById } from '../data/modes.js'

// Regras de cada modo de carreira, consultadas pelo motor e pela interface.
export const modeOf = state => state?.mode?.id ?? 'tradicional'
export const currentMode = state => modeById(modeOf(state))

export function allowsPlatform(state, platform) {
  const mode = modeOf(state)
  if (mode === 'portatil') return platform?.type === 'portatil'
  if (mode === 'arcade') return platform?.id === 'arcade'
  return Boolean(platform)
}

export const allowsSize = (state, sizeId) => modeOf(state) !== 'indie' || ['micro', 'pequeno'].includes(sizeId)

export function allowsType(state, typeId) {
  const mode = modeOf(state)
  if (mode === 'antologia') return typeId === 'original'
  if (mode === 'franquia') return state.mode?.franchise ? typeId !== 'original' : typeId === 'original'
  return true
}

export const allowsHiring = state => modeOf(state) !== 'solo'
export const allowsTeams = state => modeOf(state) !== 'solo'
export const allowsAcquire = state => !['solo', 'indie'].includes(modeOf(state))
export const comboBlocked = (state, genre, theme) => modeOf(state) === 'antologia' && state.combos[`${genre}:${theme}`] !== undefined
export const franchiseFatigue = state => modeOf(state) !== 'franquia'

export const modeCost = state => ({ solo: .78, indie: .72 })[modeOf(state)] ?? 1
export const modeSpeed = state => ({ solo: 1.38, indie: 1.08 })[modeOf(state)] ?? 1
export const modeXp = state => (modeOf(state) === 'solo' ? 1.3 : 1)
export const modeFans = state => (modeOf(state) === 'indie' ? 1.25 : 1)
// Quanto da receita fica com você: o Realista aperta a margem, a dona leva 30%.
export const modeRevenue = state => ({ realista: .7, adquirido: .7 })[modeOf(state)] ?? 1
export const modeAwardPenalty = state => (modeOf(state) === 'realista' ? .6 : 0)

export function modeQuality(state, quality) {
  if (modeOf(state) !== 'realista' || quality <= 84) return quality
  return 84 + (quality - 84) * .68
}

export const modeStartMoney = modeId => ({ realista: .75, solo: 1.2, indie: 1.2, adquirido: 2.5 })[modeId] ?? 1
