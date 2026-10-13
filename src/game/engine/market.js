import { RIVALS, rivalTierAt } from '../data/content/rivals.js'
import { ALL_HISTORIC_GAMES } from '../data/history.js'
import { unlockedGenres, unlockedThemes } from '../data/genres.js'
import { availablePlatforms } from '../data/platforms.js'
import { WEEKS_PER_YEAR, demandAt } from '../data/economy.js'
import { qualityCurve, tailWeeks, weeklyShare } from './sales.js'
import { generateTitle } from './titles.js'
import { clamp, gauss, int, pick } from './rng.js'

export function rollTrend(year, random = Math.random, techs = ['online']) {
  return {
    genre: pick(unlockedGenres(year, techs), random).id,
    theme: pick(unlockedThemes(year), random).id,
  }
}

const TIER = {
  1: { q: 60, spread: 12, reach: .6, fans: 1.1, gap: [20, 32] },
  2: { q: 66, spread: 10, reach: 1.2, fans: 1.3, gap: [15, 26] },
  3: { q: 71, spread: 9, reach: 2.2, fans: 1.6, gap: [11, 20] },
  4: { q: 75, spread: 8, reach: 3.5, fans: 2, gap: [8, 15] },
}

export const rivalById = id => RIVALS.find(item => item.id === id)
export const activeRivals = year => RIVALS.filter(rival => rival.foundedYear <= year && (!rival.closedYear || rival.closedYear > year))

function rivalGame(rival, state, tw, random) {
  const tier = TIER[rivalTierAt(rival, state.year)] ?? TIER[2]
  const year = state.year
  const genres = unlockedGenres(year, ['online'])
  const preferred = genres.filter(genre => rival.genres?.includes(genre.id))
  const genre = (preferred.length && random() < .7 ? pick(preferred, random) : pick(genres, random)).id
  const theme = pick(unlockedThemes(year), random).id
  const quality = clamp(tier.q + gauss(random) * tier.spread, 25, 99)
  const trendBoost = (state.market.trend.genre === genre ? 1.25 : 1)
  const copies = Math.round(demandAt(year) * qualityCurve(quality) * tier.reach * tier.fans * trendBoost * Math.exp(gauss(random) * .25))
  const platform = pick(availablePlatforms(state.year + state.week / WEEKS_PER_YEAR), random)
  return {
    id: `rg-${tw}-${rival.id}`,
    title: generateTitle(genre, theme, random),
    studio: rival.name,
    rivalId: rival.id,
    color: rival.color,
    genre,
    theme,
    platform: platform?.id ?? 'pc',
    quality,
    score: Math.round(clamp(quality / 10 + gauss(random) * .4, 1, 10) * 10) / 10,
    copies,
    sold: 0,
    weekly: 0,
    age: 0,
    tau: tailWeeks(quality),
    year,
    pillar: pick(['fun', 'art', 'sound', 'idea'], random),
  }
}

// Avança os rivais uma semana: lançamentos novos e vendas dos que estão na prateleira.
export function stepRivals(state, random = Math.random) {
  const tw = (state.year - 1980) * WEEKS_PER_YEAR + state.week
  const releases = []
  // Com mais empresas no mercado, cada uma lança um pouco menos de jogo inventado.
  const crowd = Math.max(1, activeRivals(state.year).length / 12) * 1.3
  releases.push(...releaseHistoric(state, tw))
  for (const slot of state.rivals) {
    const rival = rivalById(slot.id)
    if (!rival || rival.foundedYear > state.year || (rival.closedYear && rival.closedYear <= state.year)) continue
    slot.next -= 1
    if (slot.next <= 0) {
      const tier = TIER[rivalTierAt(rival, state.year)] ?? TIER[2]
      slot.next = Math.round(int(tier.gap[0], tier.gap[1], random) * crowd)
      const game = rivalGame(rival, state, tw, random)
      state.rivalGames.push(game)
      releases.push(game)
    }
  }
  for (const game of state.rivalGames) {
    game.weekly = Math.round(game.copies * weeklyShare(game.age, game.tau))
    game.sold += game.weekly
    game.age += 1
  }
  // Mantém só o que ainda vende ou que pode concorrer aos prêmios do ano.
  state.rivalGames = state.rivalGames.filter(game => game.age < 40 || game.year === state.year)
  return releases
}

export const historicWeek = entry => (entry.year - 1980) * WEEKS_PER_YEAR + entry.month * 4

// Primeiro jogo histórico que ainda vai sair a partir de uma semana absoluta.
export function historyCursorFor(tw) {
  const index = ALL_HISTORIC_GAMES.findIndex(entry => historicWeek(entry) > tw)
  return index < 0 ? ALL_HISTORIC_GAMES.length : index
}

function releaseHistoric(state, tw) {
  const out = []
  state.historyCursor ??= historyCursorFor(tw)
  while (state.historyCursor < ALL_HISTORIC_GAMES.length && historicWeek(ALL_HISTORIC_GAMES[state.historyCursor]) <= tw) {
    const entry = ALL_HISTORIC_GAMES[state.historyCursor]
    state.historyCursor += 1
    const rival = rivalById(entry.studio)
    const quality = entry.score * 10
    const game = {
      id: `hist-${entry.id}`,
      title: entry.title,
      studio: rival?.name ?? entry.studio,
      rivalId: entry.studio,
      color: rival?.color ?? '#555',
      genre: entry.genre,
      theme: entry.theme,
      platform: entry.platform,
      quality,
      score: entry.score,
      copies: Math.round(entry.copies * 1e6 * .6),
      sold: 0,
      weekly: 0,
      age: 0,
      tau: tailWeeks(quality) + 2,
      year: state.year,
      pillar: entry.genre === 'ritmo' ? 'sound' : ['aventura', 'rpg', 'terror'].includes(entry.genre) ? 'art' : entry.genre === 'puzzle' || entry.genre === 'sandbox' ? 'idea' : 'fun',
      historic: true,
      annual: /^(fifa|pes|cod)-/.test(entry.id),
      trend: entry.trend,
    }
    state.rivalGames.push(game)
    out.push(game)
  }
  return out
}

export function computeChart(state) {
  const entries = [
    ...state.rivalGames.filter(game => game.weekly > 0).map(game => ({ id: game.id, title: game.title, studio: game.studio, weekly: game.weekly, color: game.color, mine: false, score: game.score })),
    ...state.games.filter(game => game.onMarket && game.weekly > 0).map(game => ({ id: game.id, title: game.title, studio: state.studio.name, weekly: game.weekly, color: '#ff5d3a', mine: true, score: game.score })),
  ]
  entries.sort((a, b) => b.weekly - a.weekly)
  return entries.slice(0, 10).map((entry, index) => ({ ...entry, rank: index + 1 }))
}
