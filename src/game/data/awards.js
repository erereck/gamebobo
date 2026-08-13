export const AWARD_CATEGORIES = [
  { id: 'goty', name: 'Jogo do Ano', score: game => game.score * 1.2 + Math.log10(game.sales + 1) * 6 },
  { id: 'indie', name: 'Melhor Indie', score: game => game.score + (game.scale === 'micro' ? 10 : game.scale === 'small' ? 5 : 0) },
  { id: 'design', name: 'Melhor Design', score: game => game.score + (game.focus === 'gameplay' ? 11 : 0) },
  { id: 'narrative', name: 'Melhor Narrativa', score: game => game.score + (game.focus === 'story' ? 13 : 0) },
  { id: 'innovation', name: 'Prêmio de Inovação', score: game => game.score + game.innovation * 1.7 },
  { id: 'community', name: 'Escolha do Público', score: game => Math.log10(game.sales + 1) * 14 + game.trust * 0.35 },
]
