import { ACHIEVEMENTS } from '../data/content/achievements.js'
import { LEGACY_TITLES, AWARDS } from '../data/staff.js'
import { comboRating } from '../data/genres.js'
import { moneyScale } from '../data/economy.js'
import { applyEffects } from './effects.js'
import { toast, yearFloat, log } from './state.js'
import { gauss } from './rng.js'
import { modeAwardPenalty } from './modes.js'
import { RIVALS, rivalTierAt } from '../data/content/rivals.js'

export function liveStats(state) {
  const combos = Object.keys(state.combos)
  return {
    ...state.stats,
    fans: state.fans,
    money: state.money / moneyScale(yearFloat(state)),
    staffCount: state.staff.length,
    officeLevel: state.office,
    combosDiscovered: combos.length,
    greatCombos: combos.filter(key => state.combos[key] === 3).length,
    yearsActive: state.year - state.startYear,
    decorOwned: state.decor.length,
    genresTried: new Set(state.games.map(game => game.genre)).size,
    platformsUsed: new Set(state.games.map(game => game.platform)).size,
    idealsAccepted: state.stats.ideasAccepted,
  }
}

const RARITY_TEXT = { comum: 'Comum', raro: 'Raro', epico: 'Épico', lendario: 'Lendário' }

export function checkAchievements(state) {
  const stats = liveStats(state)
  for (const achievement of ACHIEVEMENTS) {
    if (state.achievements.includes(achievement.id)) continue
    const value = stats[achievement.cond.stat]
    if (value === undefined || value < achievement.cond.gte) continue
    state.achievements.push(achievement.id)
    const chips = applyEffects(state, achievement.reward)
    toast(state, { kind: 'achievement', icon: achievement.icon, title: achievement.label, sub: RARITY_TEXT[achievement.rarity] ?? '', rarity: achievement.rarity, chips })
  }
}

const SIZE_WEIGHT = { micro: .5, pequeno: 1, medio: 1.6, grande: 2.4, aaa: 3.5 }

export function computeLegacy(state) {
  const fromGames = state.games.reduce((sum, game) => sum + Math.max(0, game.score - 5) ** 2 * (SIZE_WEIGHT[game.size] ?? 1), 0)
  return Math.round(fromGames + state.trophies.length * 30 + state.stats.chartNumberOnes * 12 + state.stats.hallOfFame * 60 + Math.sqrt(state.fans) / 4)
}

export const legacyTitle = legacy => [...LEGACY_TITLES].reverse().find(item => legacy >= item.min) ?? LEGACY_TITLES[0]
export const nextLegacyTitle = legacy => LEGACY_TITLES.find(item => item.min > legacy) ?? null

export function updateLegacy(state) {
  const before = legacyTitle(state.legacy)
  state.legacy = computeLegacy(state)
  const after = legacyTitle(state.legacy)
  if (after.label !== before.label && state.legacy > before.min) {
    toast(state, { kind: 'legacy', icon: 'crown', title: after.label, sub: 'Novo título' })
    log(state, 'crown', `Virou "${after.label}"`)
  }
}

export function registerCombo(state, genre, theme) {
  const key = `${genre}:${theme}`
  const isNew = state.combos[key] === undefined
  state.combos[key] = comboRating(genre, theme)
  return isNew
}

// Prêmios do ano: só vira cerimônia quando o jogador concorre em alguma categoria.
export function runAwards(state, year, random = Math.random) {
  const mine = state.games.filter(game => game.year === year).map(game => ({
    title: game.title, studio: state.studio.name, mine: true, gameId: game.id, score: game.score, copies: game.copies,
    pillars: game.pillars ?? game.share,
  }))
  const theirs = state.rivalGames.filter(game => game.year === year).map(game => ({
    title: game.title, studio: game.studio, mine: false, score: game.score, copies: game.copies,
    indie: rivalTierAt(RIVALS.find(rival => rival.id === game.rivalId), year) <= 1,
    pillars: { fun: .25, art: .25, sound: .25, idea: .25, [game.pillar]: .4 },
  }))
  const pool = [...mine, ...theirs]
  if (!pool.length) return null
  // O Jogo do Ano da indústria fica registrado mesmo quando você não concorre.
  const penalty = modeAwardPenalty(state)
  const goty = [...pool].sort((a, b) => (b.score - (b.mine ? penalty : 0)) - (a.score - (a.mine ? penalty : 0)))[0]
  state.goty ??= []
  state.goty.push({ year, title: goty.title, studio: goty.studio, mine: goty.mine, score: goty.score })
  if (!mine.length || pool.length < 3) return null
  const categories = []
  for (const award of AWARDS) {
    const field = award.id === 'indie' ? pool.filter(entry => (entry.mine ? state.office <= 2 : entry.indie)) : pool
    if (field.length < 2) continue
    const rank = entry => {
      if (award.id === 'vendas') return entry.copies
      const handicap = entry.mine ? penalty : 0
      if (award.pillar) return entry.score - handicap + (entry.pillars?.[award.pillar] ?? .25) * 6 + gauss(random) * .35
      if (award.id === 'goty') return entry === goty ? 99 : entry.score - handicap
      return entry.score - handicap + gauss(random) * .15
    }
    const ranked = field.map(entry => ({ entry, value: rank(entry) })).sort((a, b) => b.value - a.value).slice(0, 3)
    if (!ranked.some(item => item.entry.mine)) continue
    categories.push({ id: award.id, label: award.label, icon: award.icon, finalists: ranked.map(item => item.entry), winner: 0 })
  }
  if (!categories.length) return null
  for (const category of categories) {
    const winner = category.finalists[0]
    if (winner.mine) {
      state.trophies.push({ award: category.id, label: category.label, year, title: winner.title })
      state.stats.awardsWon += 1
      category.chips = applyEffects(state, { fansPct: .06, money: 2500 })
    }
  }
  return { kind: 'awards', year, categories }
}
