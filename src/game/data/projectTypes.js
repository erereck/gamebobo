export const PROJECT_TYPES = Object.freeze([
  {
    id: 'original', label: 'Jogo original', short: 'ORIGINAL', description: 'Uma IP nova, sem depender de catálogo anterior.',
    costMultiplier: 1, monthsMultiplier: 1, qualityBonus: 0, reachBonus: 0, innovationMultiplier: 1,
  },
  {
    id: 'sequel', label: 'Sequência', short: 'SEQUÊNCIA', description: 'Continua uma franquia e carrega a expectativa do jogo anterior.',
    costMultiplier: 1.06, monthsMultiplier: 1.02, qualityBonus: 1, reachBonus: .08, innovationMultiplier: .92, requiresFranchise: true,
  },
  {
    id: 'spinoff', label: 'Spinoff', short: 'SPINOFF', description: 'Usa a franquia como ponto de partida, mas aceita outro gênero, tema e escala.',
    costMultiplier: .9, monthsMultiplier: .9, qualityBonus: 0, reachBonus: .12, innovationMultiplier: 1.08, requiresFranchise: true,
  },
  {
    id: 'port', label: 'Port', short: 'PORT', description: 'Leva um jogo lançado a outra plataforma. Barato, mas compatibilidade ainda custa tempo.',
    costMultiplier: .34, monthsMultiplier: .38, qualityBonus: 1, reachBonus: .04, innovationMultiplier: .25, requiresSource: true,
  },
  {
    id: 'remaster', label: 'Remaster', short: 'REMASTER', description: 'Preserva o jogo e melhora apresentação, desempenho e conveniências.',
    costMultiplier: .48, monthsMultiplier: .52, qualityBonus: 2, reachBonus: .1, innovationMultiplier: .35, requiresSource: true,
  },
  {
    id: 'remake', label: 'Remake', short: 'REMAKE', description: 'Reconstrói um jogo antigo. Mais liberdade e mais risco do que um remaster.',
    costMultiplier: .82, monthsMultiplier: .84, qualityBonus: 3, reachBonus: .16, innovationMultiplier: .75, requiresSource: true,
  },
  {
    id: 'collection', label: 'Coletânea', short: 'COLETÂNEA', description: 'Empacota de dois a quatro jogos — inclusive franquias diferentes — num lançamento novo.',
    costMultiplier: .58, monthsMultiplier: .62, qualityBonus: 1, reachBonus: .18, innovationMultiplier: .3, minSources: 2, maxSources: 4,
  },
])

export const projectTypeForId = id => PROJECT_TYPES.find(item => item.id === id) ?? PROJECT_TYPES[0]

export function sourceGamesForPayload(state, payload) {
  const ids = [...new Set(payload.sourceGameIds ?? (payload.sourceGameId ? [payload.sourceGameId] : []))]
  return ids.map(id => state.games.find(game => game.id === id)).filter(Boolean)
}

export function projectTypeValid(state, payload) {
  const type = projectTypeForId(payload.projectType)
  const sources = sourceGamesForPayload(state, payload)
  if (type.requiresSource && sources.length !== 1) return false
  if (type.minSources && sources.length < type.minSources) return false
  if (type.maxSources && sources.length > type.maxSources) return false
  if (type.requiresFranchise && !payload.franchiseId) return false
  return true
}
