import { RIVALS } from '../data/content/rivals.js'
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
  1: { q: 60, spread: 12, reach: .7, fans: 1.15, gap: [20, 32] },
  2: { q: 67, spread: 10, reach: 1.8, fans: 1.5, gap: [15, 26] },
  3: { q: 73, spread: 9, reach: 3.8, fans: 2.1, gap: [11, 20] },
  4: { q: 79, spread: 8, reach: 7.5, fans: 2.8, gap: [8, 15] },
}

export const rivalById = id => RIVALS.find(item => item.id === id)
export const activeRivals = year => RIVALS.filter(rival => rival.foundedYear <= year && (!rival.closedYear || rival.closedYear > year))

function rivalGame(rival, state, tw, random) {
  const tier = TIER[rival.tier] ?? TIER[2]
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
  for (const slot of state.rivals) {
    const rival = rivalById(slot.id)
    if (!rival || rival.foundedYear > state.year || (rival.closedYear && rival.closedYear <= state.year)) continue
    slot.next -= 1
    if (slot.next <= 0) {
      const tier = TIER[rival.tier] ?? TIER[2]
      slot.next = int(tier.gap[0], tier.gap[1], random)
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

export function computeChart(state) {
  const entries = [
    ...state.rivalGames.filter(game => game.weekly > 0).map(game => ({ id: game.id, title: game.title, studio: game.studio, weekly: game.weekly, color: game.color, mine: false, score: game.score })),
    ...state.games.filter(game => game.onMarket && game.weekly > 0).map(game => ({ id: game.id, title: game.title, studio: state.studio.name, weekly: game.weekly, color: '#ff5d3a', mine: true, score: game.score })),
  ]
  entries.sort((a, b) => b.weekly - a.weekly)
  return entries.slice(0, 10).map((entry, index) => ({ ...entry, rank: index + 1 }))
}
