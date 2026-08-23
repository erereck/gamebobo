function gotyPrestigeScore(game) {
  const score = Number(game.score) || 0
  const sales = Math.max(0, Number(game.sales) || 0)
  const criticalBase = score * 1.45
  const excellence = Math.max(0, score - 84) * 1.2
  const commercialImpact = Math.min(24, Math.log10(sales + 1) * 3.2)
  const sub80Penalty = score < 80 ? 10 + (80 - score) * 2.5 : 0
  return criticalBase + excellence + commercialImpact - sub80Penalty
}

export const AWARD_CATEGORIES = [
  { id: 'goty', name: 'Jogo do Ano', minScore: 80, variance: 3, nominationWindow: 10, score: gotyPrestigeScore },
  { id: 'indie', name: 'Melhor Indie', fromYear: 2004, score: game => game.score + (game.scale === 'micro' ? 10 : game.scale === 'small' ? 5 : 0) },
  { id: 'design', name: 'Melhor Design', score: game => game.score + (game.focus === 'gameplay' ? 11 : 0) },
  { id: 'narrative', name: 'Melhor Narrativa', score: game => game.score + (game.focus === 'story' ? 13 : 0) },
  { id: 'innovation', name: 'Prêmio de Inovação', score: game => game.score + game.innovation * 1.7 },
  { id: 'community', name: 'Escolha do Público', score: game => Math.log10(game.sales + 1) * 14 + game.trust * 0.35 },
]
