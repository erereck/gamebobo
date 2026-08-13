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

export const CURRENCIES = Object.freeze({
  BRL: { code: 'BRL', label: 'Real', short: 'R$', locale: 'pt-BR', rate: 1 },
  USD: { code: 'USD', label: 'Dólar', short: '$', locale: 'pt-BR', rate: .18 },
  EUR: { code: 'EUR', label: 'Euro', short: '€', locale: 'pt-BR', rate: .16 },
})

let displayCurrency = 'BRL'

export const setDisplayCurrency = currency => {
  displayCurrency = CURRENCIES[currency] ? currency : 'BRL'
}

export const formatMoney = (value, currency = displayCurrency) => {
  const selected = CURRENCIES[currency] ?? CURRENCIES.BRL
  return new Intl.NumberFormat(selected.locale, {
  style: 'currency',
  currency: selected.code,
  maximumFractionDigits: 0,
  }).format(Math.round(value * selected.rate))
}

export const formatCurrencyCopy = (copy, currency = displayCurrency) => {
  if (!copy || currency === 'BRL') return copy
  return copy.replace(/R\$\s?(\d{1,3}(?:\.\d{3})+|\d+)/g, (_, rawValue) => formatMoney(Number(rawValue.replaceAll('.', '')), currency))
}

export const formatNumber = value => new Intl.NumberFormat('pt-BR', {
  notation: Math.abs(value) >= 100_000 ? 'compact' : 'standard',
  maximumFractionDigits: 1,
}).format(Math.round(value))
