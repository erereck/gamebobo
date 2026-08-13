import { SALES_DECADES, SALES_HISTORY } from '../data/salesHistory.js'

const MONTH_INDEX = { JAN: 0, FEV: 1, MAR: 2, ABR: 3, MAI: 4, JUN: 5, JUL: 6, AGO: 7, SET: 8, OUT: 9, NOV: 10, DEZ: 11 }
const million = value => Math.max(0, Number(value) || 0) / 1000000

export const decadeOf = year => Math.floor(Number(year) / 10) * 10

const dateFromLabel = label => {
  const [month, year] = String(label ?? '').split(' ')
  return { year: Number(year) || 0, month: MONTH_INDEX[month] ?? 0 }
}

const elapsedMonths = (now, then) => (now.year - then.year) * 12 + now.month - then.month

// Evita que um lifetime de dez anos apareça inteiro no mês de lançamento.
const archiveSalesAtDate = (record, date) => {
  const elapsed = elapsedMonths(date, record)
  if (elapsed < 0) return 0
  const firstYear = Math.min(1, (elapsed + 1) / 12) * .55
  const longTail = Math.min(.45, Math.max(0, elapsed - 11) / 60 * .45)
  return record.sales * Math.min(1, firstYear + longTail)
}

export function getSalesEntries(state) {
  const archive = SALES_HISTORY
    .map(record => ({ ...record, salesNow: archiveSalesAtDate(record, state.date) }))
    .filter(record => record.salesNow > 0)
  const player = state.games.map(item => {
    const released = dateFromLabel(item.released)
    return { id: item.id, title: item.title, studio: state.studio.name, year: released.year, month: released.month, sales: million(item.sales), salesNow: million(item.sales), platform: item.platform, figureType: 'exact', source: 'player' }
  })
  const rivals = state.competitors.flatMap(studio => studio.games.map(item => {
    const released = dateFromLabel(item.released)
    return { id: item.id, title: item.title, studio: studio.name, year: released.year, month: released.month, sales: million(item.sales), salesNow: million(item.sales), platform: 'Linha alternativa', figureType: 'simulation', source: studio.cohort ? 'cohort' : 'rival', breakout: item.breakout }
  }))
  return [...archive, ...player, ...rivals]
}

export function getDecadeChart(state, decade = decadeOf(state.date.year), limit = 20) {
  return getSalesEntries(state)
    .filter(item => decadeOf(item.year) === decade && item.year <= state.date.year)
    .sort((a, b) => b.salesNow - a.salesNow)
    .slice(0, limit)
    .map((item, index) => ({ ...item, rank: index + 1 }))
}

export function getAllTimeChart(state, limit = 20) {
  return getSalesEntries(state).sort((a, b) => b.salesNow - a.salesNow).slice(0, limit).map((item, index) => ({ ...item, rank: index + 1 }))
}

export const availableSalesDecades = state => SALES_DECADES.filter(decade => decade <= decadeOf(state.date.year))

export function getChartSummary(state) {
  const all = getSalesEntries(state)
  const sorted = [...all].sort((a, b) => b.salesNow - a.salesNow)
  const playerBest = sorted.findIndex(item => item.source === 'player')
  const cohortBest = sorted.findIndex(item => item.source === 'cohort')
  return {
    millionSellers: all.filter(item => item.salesNow >= 1).length,
    playerBest: playerBest < 0 ? null : playerBest + 1,
    cohortBest: cohortBest < 0 ? null : cohortBest + 1,
    champion: sorted[0] ?? null,
  }
}
