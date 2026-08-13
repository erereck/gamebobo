import { AWARD_CATEGORIES } from '../data/awards.js'
import { makeId, randomInt } from './utils.js'

export function processAwards(state, year, random = Math.random) {
  if (state.awards.processedYears.includes(year)) return null
  const games = state.games.filter(game => Number(game.released?.split(' ')[1]) === year)
  state.awards.processedYears.push(year)
  if (!games.length) return null
  const results = AWARD_CATEGORIES.map(category => {
    const ranked = games.map(game => ({ game, value: category.score(game) + randomInt(-8, 8, random) })).sort((a, b) => b.value - a.value)
    const nominee = ranked[0]
    const industryThreshold = category.id === 'goty' ? 102 : 82
    const nominated = nominee.value >= industryThreshold
    const won = nominated && nominee.value >= industryThreshold + randomInt(3, 16, random)
    return { categoryId: category.id, category: category.name, gameId: nominee.game.id, gameTitle: nominee.game.title, nominated, won }
  }).filter(item => item.nominated)
  results.forEach(result => {
    state.awards.nominations.push({ ...result, id: makeId('nomination'), year })
    if (result.won) state.awards.trophies.push({ ...result, id: makeId('trophy'), year })
  })
  return results
}
