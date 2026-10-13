import test from 'node:test'
import assert from 'node:assert/strict'
import { reducer } from './reducer.js'
import { mulberry32 } from './rng.js'
import { qualityCurve } from './sales.js'
import { isBlocked } from './tick.js'
import { ICONS } from '../../ui/icons.js'
import { EVENTS } from '../data/content/events.js'
import { IDEAS } from '../data/content/ideas.js'
import { HOOKS } from '../data/content/hooks.js'
import { CAMELO_ITEMS } from '../data/content/camelo.js'
import { ACHIEVEMENTS } from '../data/content/achievements.js'
import { FREELAS } from '../data/content/freelas.js'
import { GENRES, THEMES } from '../data/genres.js'
import { DECOR, TECHS, MARKETING, START_ERAS } from '../data/economy.js'
import { PLATFORMS, availablePlatforms } from '../data/platforms.js'
import { liveStats } from './progress.js'

const newGame = (seed = 1, startYear = 1980) => {
  const random = mulberry32(seed)
  const state = reducer(null, { type: 'NEW_GAME', options: { founderName: 'Teste', studioName: 'Estúdio Teste', startYear, profileId: 'programador' } }, random)
  return { state, random }
}

// Avança o tempo resolvendo qualquer janela com a primeira opção.
function runUntil(state, random, predicate, limit = 400) {
  for (let i = 0; i < limit && !predicate(state); i += 1) {
    const item = state.queue[0]
    if (!item) state = reducer(state, { type: 'TICK' }, random)
    else if (item.kind === 'phase') state = reducer(state, { type: 'SET_FOCUS', focus: item.phase === 1 ? 'conteudo' : 'cacabugs' }, random)
    else if ((item.kind === 'event' || item.kind === 'idea') && !item.result) state = reducer(state, { type: 'CHOOSE', index: 0 }, random)
    else if (item.kind === 'ready') return state
    else if (item.kind === 'bankrupt') state = reducer(state, { type: 'BANKRUPT', choice: 'home' }, random)
    else state = reducer(state, { type: 'CLOSE' }, random)
  }
  return state
}

test('toda era inicial cria uma carreira válida', () => {
  for (const era of START_ERAS) {
    const { state } = newGame(7, era.year)
    assert.equal(state.year, era.year)
    assert.equal(state.staff.length, 1)
    assert.ok(state.money > 0)
    assert.equal(state.candidates.length, 3)
    assert.ok(state.freelas.length > 0)
    assert.ok(availablePlatforms(era.year).length > 0)
  }
})

test('um jogo micro vai do início ao lançamento', () => {
  let { state, random } = newGame(42)
  const before = state.money
  state = reducer(state, { type: 'START_GAME', choice: { genre: 'acao', theme: 'ninja', platform: 'pc', size: 'micro', hook: HOOKS[0].id, title: 'Ninja Teste' } }, random)
  assert.ok(state.project, 'projeto criado')
  assert.ok(state.money < before, 'custo cobrado')
  state = runUntil(state, random, s => s.queue[0]?.kind === 'ready')
  assert.equal(state.queue[0]?.kind, 'ready')
  assert.ok(isBlocked(state), 'pronto para lançar pausa o tempo')
  state = reducer(state, { type: 'RELEASE' }, random)
  const game = state.games.at(-1)
  assert.equal(game.title, 'Ninja Teste')
  assert.equal(game.scores.length, 4)
  for (const score of game.scores) assert.ok(score >= 1 && score <= 10)
  assert.equal(state.queue[0].kind, 'review')
  assert.equal(state.combos['acao:ninja'], 3)
  state = reducer(state, { type: 'CLOSE' }, random)
  const money = state.money
  state = runUntil(state, random, s => s.games[0].sold > 0, 20)
  assert.ok(state.games[0].sold > 0, 'vendas começam')
  assert.ok(state.money >= money - 2000, 'receita entra no caixa')
})

test('mesma semente, mesmo resultado', () => {
  const play = () => {
    let { state, random } = newGame(99)
    state = reducer(state, { type: 'START_GAME', choice: { genre: 'rpg', theme: 'fantasia', platform: 'pc', size: 'micro', hook: HOOKS[1].id, title: 'Det' } }, random)
    state = runUntil(state, random, s => s.queue[0]?.kind === 'ready')
    state = reducer(state, { type: 'RELEASE' }, random)
    return state.games[0].scores.join(',')
  }
  assert.equal(play(), play())
})

test('curva de qualidade só cresce', () => {
  let last = -1
  for (let q = 0; q <= 100; q += 5) {
    const value = qualityCurve(q)
    assert.ok(value >= last)
    last = value
  }
})

test('o save sobrevive a JSON', () => {
  let { state, random } = newGame(5)
  state = reducer(state, { type: 'START_GAME', choice: { genre: 'puzzle', theme: 'animais', platform: 'pc', size: 'micro', hook: HOOKS[2].id, title: 'Save' } }, random)
  state = runUntil(state, random, s => s.week >= 6)
  const copy = JSON.parse(JSON.stringify(state))
  const next = reducer(copy, { type: 'TICK' }, random)
  assert.ok(next.week !== copy.week || next.queue.length)
})

test('ações inválidas não mudam o estado', () => {
  const { state, random } = newGame(3)
  assert.equal(reducer(state, { type: 'HIRE', id: 'nada' }, random), state)
  assert.equal(reducer(state, { type: 'RELEASE' }, random), state)
  assert.equal(reducer(state, { type: 'UPGRADE_OFFICE' }, random), state, 'sem dinheiro para a garagem')
})

test('conteúdo só usa ícones, gêneros e temas que existem', () => {
  const genreIds = new Set(GENRES.map(g => g.id))
  const themeIds = new Set(THEMES.map(t => t.id))
  const icons = [
    ...GENRES, ...THEMES, ...EVENTS, ...IDEAS, ...HOOKS, ...CAMELO_ITEMS, ...ACHIEVEMENTS, ...FREELAS, ...DECOR, ...TECHS, ...MARKETING,
  ].map(item => item.icon).filter(Boolean)
  for (const icon of icons) assert.ok(ICONS[icon], `ícone ${icon}`)
  for (const hook of HOOKS) for (const g of hook.genres ?? []) assert.ok(genreIds.has(g), `gênero ${g} em ${hook.id}`)
  for (const platform of PLATFORMS) for (const g of Object.keys(platform.fit ?? {})) assert.ok(genreIds.has(g), `gênero ${g} em ${platform.id}`)
  assert.ok(themeIds.size >= 20)
})

test('toda escolha tem efeito ou aposta coerente', () => {
  for (const item of [...EVENTS, ...IDEAS]) {
    assert.ok(item.choices.length >= 2, item.id)
    for (const choice of item.choices) {
      if (choice.gamble) assert.ok(choice.gamble.chance > 0 && choice.gamble.chance < 1, item.id)
      else assert.ok(choice.effects, item.id)
    }
  }
})

test('conquistas usam estatísticas que o jogo calcula', () => {
  const { state } = newGame(1)
  const stats = liveStats(state)
  for (const achievement of ACHIEVEMENTS) assert.ok(achievement.cond.stat in stats, achievement.cond.stat)
})

// Robô simples: faz jogos micro e pequenos, contrata e pesquisa quando sobra dinheiro.
test('balanceamento: carreira de dez anos não explode nem afunda', () => {
  const scores = []
  for (let seed = 1; seed <= 3; seed += 1) {
    let { state, random } = newGame(seed * 101, 1988)
    const end = state.year + 10
    let guard = 0
    while (state.year < end && guard < 20000) {
      guard += 1
      const item = state.queue[0]
      if (item) {
        if (item.kind === 'ready') state = reducer(state, { type: 'RELEASE' }, random)
        else if (item.kind === 'phase') state = reducer(state, { type: 'SET_FOCUS', focus: item.phase === 1 ? 'conteudo' : 'acabamento' }, random)
        else if ((item.kind === 'event' || item.kind === 'idea') && !item.result) state = reducer(state, { type: 'CHOOSE', index: 0 }, random)
        else if (item.kind === 'bankrupt') state = reducer(state, { type: 'BANKRUPT', choice: 'home' }, random)
        else state = reducer(state, { type: 'CLOSE' }, random)
        continue
      }
      if (!state.project) {
        const known = Object.entries(state.combos).find(([, rating]) => rating === 3)
        const [genre, theme] = known && random() < .6 ? known[0].split(':') : ['acao', ['ninja', 'herois', 'mitologia', 'zumbi'][seed % 4]]
        const size = state.money > 300000 && state.office >= 1 && state.staff.length >= 3 ? 'medio' : state.money > 90000 ? 'pequeno' : 'micro'
        const next = reducer(state, { type: 'START_GAME', choice: { genre, theme, platform: 'pc', size, hook: HOOKS[seed].id, title: `J${state.games.length}` } }, random)
        if (next !== state) { state = next; continue }
      }
      if (state.games.length >= 3 && state.staff.length < 3 && state.candidates.length && state.money > 120000) {
        const next = reducer(state, { type: state.office === 0 ? 'UPGRADE_OFFICE' : 'HIRE', id: state.candidates[0].id }, random)
        if (next !== state) { state = next; continue }
      }
      state = reducer(state, { type: 'TICK' }, random)
    }
    scores.push(...state.games.map(game => game.score))
    assert.ok(state.games.length >= 8, `lançou ${state.games.length} jogos`)
  }
  scores.sort((a, b) => a - b)
  const median = scores[Math.floor(scores.length / 2)]
  assert.ok(median >= 5.5 && median <= 8.6, `mediana ${median}`)
  assert.ok(scores.filter(s => s >= 9.5).length / scores.length < .1, 'notas 9,5+ continuam raras')
})
