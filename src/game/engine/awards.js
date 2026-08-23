import { AWARD_CATEGORIES } from '../data/awards.js'
import { SALES_HISTORY } from '../data/salesHistory.js'
import { realAwardCandidate } from '../data/awardBenchmarks.js'
import { makeId, randomInt } from './utils.js'

const releaseYear = game => Number(game.released?.split(' ')[1])

function realCandidates(year) {
  const headline = realAwardCandidate(year)
  const archive = SALES_HISTORY.filter(game => game.year === year).slice(0, 6).map((game, index) => ({
    id: `archive-${game.id}`,
    title: game.title,
    studio: game.studio,
    source: 'real',
    released: `DEZ ${year}`,
    score: Math.min(94, 79 + Math.round(Math.log10(game.sales * 1_000_000 + 1) * 1.55) + (index === 0 ? 2 : 0)),
    sales: Math.round(game.sales * 1_000_000),
    scale: 'large',
    focus: index % 3 === 0 ? 'gameplay' : index % 3 === 1 ? 'story' : 'innovation',
    innovation: 7 + index,
    trust: 76 + (index % 5) * 3,
  }))
  const unique = new Map([[headline.title, headline]])
  archive.forEach(game => { if (!unique.has(game.title)) unique.set(game.title, game) })
  return [...unique.values()]
}

function competitorCandidates(state, year) {
  return state.competitors.flatMap(studio => studio.games.filter(game => releaseYear(game) === year).map(game => ({
    ...game,
    studio: studio.name,
    source: 'competitor',
    scale: game.scale ?? 'medium',
    focus: game.focus ?? 'gameplay',
    innovation: game.innovation ?? 5,
    trust: game.trust ?? 65,
  })))
}

export function processAwards(state, year, random = Math.random) {
  if (state.awards.processedYears.includes(year)) return null
  const playerGames = state.games.filter(game => releaseYear(game) === year).map(game => ({ ...game, studio: state.studio.name, source: 'player' }))
  state.awards.processedYears.push(year)
  state.awards.yearlyWinners ??= []

  const results = []
  AWARD_CATEGORIES.filter(category => year >= (category.fromYear ?? 1980)).forEach(category => {
    if (category.id === 'goty') {
      const pool = [...playerGames, ...competitorCandidates(state, year), ...realCandidates(year)]
      const ranked = pool.map(game => ({ game, value: category.score(game) + randomInt(-7, 7, random) })).sort((a, b) => b.value - a.value)
      const winner = ranked[0]
      const bestPlayer = ranked.find(item => item.game.source === 'player')
      const playerNominated = Boolean(bestPlayer && bestPlayer.value >= winner.value - 13)
      const won = winner.game.source === 'player'
      const result = {
        categoryId: category.id,
        category: category.name,
        gameId: bestPlayer?.game.id ?? null,
        gameTitle: bestPlayer?.game.title ?? null,
        nominated: playerNominated,
        won,
        winnerTitle: winner.game.title,
        winnerStudio: winner.game.studio,
        winnerSource: winner.game.source,
      }
      results.push(result)
      state.awards.yearlyWinners.push({ id: makeId('goty'), year, gameId: winner.game.id, gameTitle: winner.game.title, studio: winner.game.studio, source: winner.game.source })
      if (playerNominated) state.awards.nominations.push({ ...result, id: makeId('nomination'), year })
      if (won) state.awards.trophies.push({ ...result, id: makeId('trophy'), year })
      return
    }

    if (!playerGames.length) return
    const ranked = playerGames.map(game => ({ game, value: category.score(game) + randomInt(-8, 8, random) })).sort((a, b) => b.value - a.value)
    const nominee = ranked[0]
    const industryThreshold = 82
    const nominated = nominee.value >= industryThreshold
    const won = nominated && nominee.value >= industryThreshold + randomInt(3, 16, random)
    if (!nominated) return
    const result = { categoryId: category.id, category: category.name, gameId: nominee.game.id, gameTitle: nominee.game.title, nominated, won, winnerTitle: won ? nominee.game.title : null, winnerStudio: won ? state.studio.name : null }
    results.push(result)
    state.awards.nominations.push({ ...result, id: makeId('nomination'), year })
    if (won) state.awards.trophies.push({ ...result, id: makeId('trophy'), year })
  })
  return results
}
