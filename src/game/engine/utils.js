export const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export const randomInt = (min, max, random = Math.random) =>
  Math.floor(random() * (max - min + 1)) + min

export const randomChoice = (items, random = Math.random) =>
  items[randomInt(0, items.length - 1, random)]

export const makeId = (prefix = 'id') => {
  const value = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}-${value}`
}

export const clone = value => structuredClone(value)

export const formatMoney = value => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
}).format(Math.round(value))

export const formatNumber = value => new Intl.NumberFormat('pt-BR', {
  notation: Math.abs(value) >= 100_000 ? 'compact' : 'standard',
  maximumFractionDigits: 1,
}).format(Math.round(value))
