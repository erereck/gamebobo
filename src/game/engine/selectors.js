import { FOCUSES, labelOf } from '../data/catalog.js'
import { TRAITS } from '../data/traits.js'

export function reputationLabel(value) {
  if (value >= 80) return 'Lendário'
  if (value >= 50) return 'Respeitado'
  if (value >= 25) return 'Promessa'
  if (value >= 8) return 'Conhecido'
  return 'Desconhecido'
}

export function getTrait(state) {
  return TRAITS.find(item => item.id === state.player.traitId)
}

export function getPhilosophy(state) {
  if (state.games.length < 2) return { name: 'Sem rótulo', description: 'Um lançamento ainda não vira reputação.' }
  const focusCounts = Object.fromEntries(FOCUSES.map(item => [item.id, 0]))
  const genreCounts = Object.fromEntries(state.world.knownGenres.map(item => [item.id, 0]))
  state.games.forEach(game => {
    focusCounts[game.focus] = (focusCounts[game.focus] ?? 0) + 1
    genreCounts[game.genre] = (genreCounts[game.genre] ?? 0) + 1
  })
  const [focus, focusCount] = Object.entries(focusCounts).sort((a, b) => b[1] - a[1])[0]
  const [genre, genreCount] = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]
  if (focusCount / state.games.length >= 0.55) {
    const names = { story: 'Autor', innovation: 'Inventor', gameplay: 'Artesão', visual: 'Estilista', multiplayer: 'Anfitrião', systems: 'Sistemista', atmosphere: 'Diretor de clima' }
    return { name: names[focus], description: `Seus jogos são associados a ${labelOf(FOCUSES, focus).toLowerCase()}.` }
  }
  if (genreCount / state.games.length >= 0.6) return { name: `Especialista em ${labelOf(state.world.knownGenres, genre)}`, description: 'Seu público já chega com uma expectativa.' }
  return { name: 'Eclético', description: 'Ainda não conseguiram prever seu próximo projeto.' }
}

export function getFranchises(state) {
  const groups = new Map()
  state.games.forEach(game => {
    if (!game.franchiseId) return
    const current = groups.get(game.franchiseId) ?? { id: game.franchiseId, name: game.franchiseName, games: [], sales: 0, score: 0 }
    current.games.push(game)
    current.sales += game.sales
    current.score += game.score
    groups.set(game.franchiseId, current)
  })
  return [...groups.values()].map(item => ({
    ...item,
    average: Math.round(item.score / item.games.length),
    heat: Math.max(0, 100 - Math.max(0, item.games.length - 2) * 18),
  })).sort((a, b) => b.sales - a.sales)
}

export function getCareerRecords(state) {
  const sortedScore = [...state.games].sort((a, b) => b.score - a.score)
  const sortedSales = [...state.games].sort((a, b) => b.sales - a.sales)
  const sortedProfit = [...state.games].sort((a, b) => (a.revenue - a.costSpent) - (b.revenue - b.costSpent))
  return {
    best: sortedScore[0] ?? null,
    seller: sortedSales[0] ?? null,
    failure: sortedProfit[0] ? sortedProfit.at(-1) : null,
    goty: state.games.filter(game => game.score >= 92).length,
    totalSales: state.games.reduce((sum, game) => sum + game.sales, 0),
  }
}
