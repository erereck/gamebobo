import { SCALES } from './catalog.js'

export const PROJECT_PROMISES = [
  { id: 'easy-to-learn', label: 'Fácil de pegar', pitch: 'A graça aparece antes do manual.', fromYear: 1980, genres: ['action', 'puzzle', 'racing', 'sports'], focuses: ['gameplay'], audience: 'casual', complexity: 0, reach: .08, quality: 1, innovation: 0, bugRisk: 0 },
  { id: 'precise-controls', label: 'Controle preciso', pitch: 'Cada comando responde como deveria.', fromYear: 1980, genres: ['action', 'fighting', 'racing', 'puzzle'], focuses: ['gameplay'], audience: 'balanced', complexity: 1, reach: .02, quality: 2, innovation: 0, bugRisk: 1 },
  { id: 'interlocking-systems', label: 'Sistemas que se cruzam', pitch: 'Uma decisão mexe em todo o resto.', fromYear: 1980, genres: ['strategy', 'simulation', 'rpg'], focuses: ['systems', 'innovation'], audience: 'hardcore', complexity: 2, reach: 0, quality: 2, innovation: 3, bugRisk: 2 },
  { id: 'meaningful-choices', label: 'História com escolhas', pitch: 'O jogador deixa marcas no caminho.', fromYear: 1980, genres: ['rpg', 'adventure', 'horror'], focuses: ['story'], audience: 'balanced', complexity: 2, reach: .03, quality: 2, innovation: 1, bugRisk: 1 },
  { id: 'couch-game', label: 'Melhor com companhia', pitch: 'Feito para disputar o mesmo sofá.', fromYear: 1980, genres: ['sports', 'fighting', 'racing', 'action'], focuses: ['multiplayer'], audience: 'casual', complexity: 1, reach: .07, quality: 1, innovation: 1, bugRisk: 1 },
  { id: 'new-every-run', label: 'Cada partida é diferente', pitch: 'O jogo sempre encontra outro caminho.', fromYear: 1980, genres: ['puzzle', 'strategy', 'rpg', 'simulation'], focuses: ['innovation', 'systems'], audience: 'hardcore', complexity: 2, reach: .03, quality: 1, innovation: 2, bugRisk: 2 },
  { id: 'world-to-explore', label: 'Um mundo para explorar', pitch: 'Sempre há alguma coisa depois da curva.', fromYear: 1984, genres: ['rpg', 'adventure', 'action'], focuses: ['atmosphere', 'gameplay'], audience: 'balanced', complexity: 2, reach: .06, quality: 1, innovation: 2, bugRisk: 2 },
  { id: 'visual-hook', label: 'Visual que vende a cena', pitch: 'Uma imagem basta para reconhecer o jogo.', fromYear: 1983, genres: ['action', 'racing', 'fighting', 'horror'], focuses: ['visual', 'atmosphere'], audience: 'casual', complexity: 2, reach: .08, quality: 1, innovation: 1, bugRisk: 1 },
  { id: 'cinematic', label: 'Cara de filme', pitch: 'Cenas grandes, ritmo e espetáculo.', fromYear: 1993, genres: ['action', 'adventure', 'horror', 'rpg'], focuses: ['story', 'visual'], audience: 'casual', complexity: 3, reach: .1, quality: 2, innovation: 1, bugRisk: 2 },
  { id: 'player-tools', label: 'Ferramentas para jogadores', pitch: 'O público também cria parte da diversão.', fromYear: 1993, genres: ['simulation', 'strategy', 'puzzle'], focuses: ['systems', 'innovation'], audience: 'hardcore', complexity: 3, reach: .12, quality: 2, innovation: 3, bugRisk: 2 },
  { id: 'online-community', label: 'Comunidade online', pitch: 'O jogo continua quando você sai.', fromYear: 1996, genres: ['sports', 'action', 'rpg', 'simulation'], focuses: ['multiplayer'], audience: 'balanced', complexity: 3, reach: .16, quality: 1, innovation: 2, bugRisk: 3 },
]

export const PROJECT_PHASES = [
  { id: 'prototype', label: 'PROTÓTIPO', action: 'Fechar o protótipo', detail: 'Provar a promessa central', effect: '+IDEIA · +PROG' },
  { id: 'production', label: 'PRODUÇÃO', action: 'Produzir o jogo', detail: 'Construir sistemas e conteúdo', effect: '+PROG · +PEND.' },
  { id: 'polish', label: 'POLIMENTO', action: 'Polir e fechar', detail: 'Cortar problemas antes da nota', effect: '−PEND. · +PROG' },
]

const CAPACITY = { micro: 1, small: 2, medium: 3, large: 4, blockbuster: 5 }
const SCALE_COST_RISK = { micro: 1, small: 1.12, medium: 1.65, large: 2.45, blockbuster: 3.8 }

export const promiseForId = id => PROJECT_PROMISES.find(item => item.id === id) ?? PROJECT_PROMISES[0]

export function promiseFit(promise, genre, focus) {
  return Number(promise.genres.includes(genre)) + Number(promise.focuses.includes(focus))
}

export function promiseScopeMonths(promiseId, scaleId) {
  const promise = promiseForId(promiseId)
  return Math.max(0, promise.complexity - (CAPACITY[scaleId] ?? 1))
}

export function projectPromiseCost(baseCost, baseMonths, promiseId, scaleId) {
  const extraMonths = promiseScopeMonths(promiseId, scaleId)
  return Math.round(baseCost * (SCALE_COST_RISK[scaleId] ?? 1) * ((baseMonths + extraMonths) / baseMonths))
}

export function promiseOptionsFor({ genre, focus, year, scaleId }, limit = 5, selectedId = null) {
  const available = PROJECT_PROMISES.filter(item => year >= item.fromYear)
    .sort((a, b) => promiseFit(b, genre, focus) - promiseFit(a, genre, focus) || promiseScopeMonths(a.id, scaleId) - promiseScopeMonths(b.id, scaleId) || a.complexity - b.complexity)
  const options = available.slice(0, limit)
  const selected = available.find(item => item.id === selectedId)
  if (selected && !options.includes(selected)) options[options.length - 1] = selected
  return options
}

export function projectPhase(project) {
  if (!project || project.progress <= 0) return 'prototype'
  const ratio = project.progress / Math.max(1, project.totalMonths)
  return ratio < .67 ? 'production' : 'polish'
}

export function phaseForId(id) {
  return PROJECT_PHASES.find(item => item.id === id) ?? PROJECT_PHASES[0]
}

export function baseScaleMonths(scaleId) {
  return SCALES[scaleId]?.months ?? 3
}
