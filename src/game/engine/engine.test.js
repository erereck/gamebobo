import test from 'node:test'
import assert from 'node:assert/strict'
import { afterLoad, reducer } from './reducer.js'
import { mulberry32 } from './rng.js'
import { qualityCurve } from './sales.js'
import { isBlocked } from './tick.js'
import { ICONS } from '../../ui/icons.js'
import { EVENTS } from './events.js'
import { IDEAS } from '../data/content/ideas.js'
import { HOOKS } from '../data/content/hooks.js'
import { CAMELO_ITEMS } from '../data/content/camelo.js'
import { ACHIEVEMENTS } from '../data/content/achievements.js'
import { FREELAS } from '../data/content/freelas.js'
import { GENRES, THEMES } from '../data/genres.js'
import { DECOR, TECHS, MARKETING, START_ERAS } from '../data/economy.js'
import { PLATFORMS, availablePlatforms } from '../data/platforms.js'
import { liveStats } from './progress.js'
import { PRESS_BANDS, PRESS_HEADLINES, PRESS_MEDIUMS, PRESS_QUESTIONS, PRESS_TONES, pressMediumFor, pressQuestionById } from '../data/content/press.js'
import { answerEffects, pickPressQuestions, wantsPress } from './press.js'

const newGame = (seed = 1, startYear = 1980, modeId = 'tradicional') => {
  const random = mulberry32(seed)
  const state = reducer(null, { type: 'NEW_GAME', options: { founderName: 'Teste', studioName: 'Estúdio Teste', startYear, profileId: 'programador', modeId } }, random)
  return { state, random }
}

// Avança o tempo resolvendo qualquer janela com a primeira opção.
function runUntil(state, random, predicate, limit = 400) {
  for (let i = 0; i < limit && !predicate(state); i += 1) {
    const item = state.queue[0]
    if (!item) state = reducer(state, { type: 'TICK' }, random)
    else if (item.kind === 'phase') state = reducer(state, { type: 'SET_FOCUS', focus: item.phase === 1 ? 'conteudo' : 'cacabugs' }, random)
    else if (item.kind === 'expo') state = reducer(state, { type: 'EXPO_PICK', targetId: null }, random)
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
  assert.equal(state.projects.length, 1, 'projeto criado')
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
        else if (item.kind === 'expo') state = reducer(state, { type: 'EXPO_PICK', targetId: null }, random)
        else state = reducer(state, { type: 'CLOSE' }, random)
        continue
      }
      if (!state.projects.length) {
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

const ready = state => state.queue[0]?.kind === 'ready'

test('modos restringem plataformas, tamanhos, contratação e combinações', () => {
  let { state, random } = newGame(11, 1990, 'portatil')
  assert.equal(reducer(state, { type: 'START_GAME', choice: { genre: 'puzzle', theme: 'animais', platform: 'pc', size: 'micro', hook: HOOKS[0].id, title: 'X' } }, random), state, 'portátil não aceita PC')
  assert.notEqual(reducer(state, { type: 'START_GAME', choice: { genre: 'puzzle', theme: 'animais', platform: 'gameboy', size: 'micro', hook: HOOKS[0].id, title: 'X' } }, random), state)
  ;({ state, random } = newGame(12, 1990, 'indie'))
  assert.equal(reducer(state, { type: 'START_GAME', choice: { genre: 'acao', theme: 'ninja', platform: 'pc', size: 'medio', hook: HOOKS[0].id, title: 'X' } }, random), state, 'indie não faz médio')
  ;({ state, random } = newGame(13, 1990, 'solo'))
  state.money = 1e9
  assert.equal(reducer(state, { type: 'HIRE', id: state.candidates[0].id }, random), state, 'solo não contrata')
  ;({ state, random } = newGame(14, 1980, 'arcade'))
  assert.notEqual(reducer(state, { type: 'START_GAME', choice: { genre: 'acao', theme: 'espaco', platform: 'arcade', size: 'micro', hook: HOOKS[0].id, title: 'X' } }, random), state, 'arcade usa fliperama')
  ;({ state, random } = newGame(15, 1990, 'antologia'))
  state.money = 1e9
  state = reducer(state, { type: 'START_GAME', choice: { genre: 'rpg', theme: 'fantasia', platform: 'pc', size: 'micro', hook: HOOKS[0].id, title: 'Um' } }, random)
  state = runUntil(state, random, ready)
  state = reducer(state, { type: 'RELEASE' }, random)
  state = reducer(state, { type: 'CLOSE' }, random)
  assert.equal(reducer(state, { type: 'START_GAME', choice: { genre: 'rpg', theme: 'fantasia', platform: 'pc', size: 'micro', hook: HOOKS[0].id, title: 'Dois' } }, random), state, 'antologia não repete combinação')
})

test('estúdio adquirido começa com equipe, dona e encomenda', () => {
  const { state } = newGame(21, 1995, 'adquirido')
  assert.equal(state.staff.length, 4)
  assert.ok(state.mode.parent?.name)
  assert.ok(state.mode.brief?.genre)
  assert.equal(state.office, 2)
})

test('franquia única trava a série depois do primeiro jogo', () => {
  let { state, random } = newGame(31, 1990, 'franquia')
  state.money = 1e9
  state = reducer(state, { type: 'START_GAME', choice: { genre: 'plataforma', theme: 'animais', platform: 'pc', size: 'micro', hook: HOOKS[0].id, title: 'Saga' } }, random)
  assert.ok(state.mode.franchise)
  state = runUntil(state, random, ready)
  state = reducer(state, { type: 'RELEASE' }, random)
  state = reducer(state, { type: 'CLOSE' }, random)
  assert.equal(reducer(state, { type: 'START_GAME', choice: { genre: 'rpg', theme: 'fantasia', platform: 'pc', size: 'micro', hook: HOOKS[0].id, title: 'Outra' } }, random), state, 'nada de IP nova')
  const port = reducer(state, { type: 'START_GAME', choice: { type: 'port', sources: [state.games[0].id], platforms: ['nes'], title: 'Saga NES' } }, random)
  assert.notEqual(port, state, 'porte da própria série é permitido')
})

test('porte e coletânea são rápidos e saem com nota', () => {
  let { state, random } = newGame(41, 1995)
  state.money = 1e9
  for (const title of ['A', 'B']) {
    state = reducer(state, { type: 'START_GAME', choice: { genre: 'acao', theme: 'ninja', platform: 'pc', size: 'micro', hook: HOOKS[0].id, title } }, random)
    state = runUntil(state, random, ready)
    state = reducer(state, { type: 'RELEASE' }, random)
    state = reducer(state, { type: 'CLOSE' }, random)
  }
  assert.equal(reducer(state, { type: 'START_GAME', choice: { type: 'port', sources: [state.games[0].id], platforms: ['pc'], title: 'Mesmo PC' } }, random), state, 'porte precisa de outra plataforma')
  state = reducer(state, { type: 'START_GAME', choice: { type: 'collection', sources: state.games.map(game => game.id), platforms: ['playstation'], title: 'Coletânea' } }, random)
  assert.equal(state.projects.length, 1)
  assert.ok(state.projects[0].totalWeeks <= 6, 'coletânea é curta')
  state = runUntil(state, random, ready)
  state = reducer(state, { type: 'RELEASE' }, random)
  assert.equal(state.games.at(-1).type, 'collection')
  assert.ok(state.games.at(-1).score >= 1)
})

test('duas equipes tocam dois projetos ao mesmo tempo', () => {
  let { state, random } = newGame(51, 1995)
  state.money = 1e9
  state.office = 2
  for (let i = 0; i < 2; i += 1) state = reducer(state, { type: 'HIRE', id: state.candidates[0].id }, random)
  state = reducer(state, { type: 'CREATE_TEAM' }, random)
  const team = state.teams[1]
  state = reducer(state, { type: 'MOVE_STAFF', staffId: state.staff[1].id, teamId: team.id }, random)
  state = reducer(state, { type: 'START_GAME', choice: { genre: 'rpg', theme: 'fantasia', platform: 'pc', size: 'micro', hook: HOOKS[0].id, title: 'Um', teamId: 'main' } }, random)
  state = reducer(state, { type: 'START_GAME', choice: { genre: 'puzzle', theme: 'escola', platform: 'pc', size: 'micro', hook: HOOKS[0].id, title: 'Dois', teamId: team.id } }, random)
  assert.equal(state.projects.length, 2)
  state = runUntil(state, random, s => s.week > 3)
  assert.ok(state.projects.every(project => project.week > 0), 'os dois avançam')
})

test('comprar um estúdio cria equipe remota e cancela os clássicos dele', () => {
  let { state, random } = newGame(61, 1992)
  state.money = 1e12
  state = reducer(state, { type: 'ACQUIRE', rivalId: 'id' }, random)
  assert.ok(state.acquired.includes('id'))
  assert.ok(state.teams.some(team => team.remote && team.rivalId === 'id'))
  state = runUntil(state, random, s => s.year >= 1994, 3000)
  assert.ok(!state.rivalGames.some(game => game.title === 'Doom'), 'Doom não sai mais pela id')
})

test('o Jogo do Ano da indústria fica registrado', () => {
  let { state, random } = newGame(71, 1990)
  state = runUntil(state, random, s => s.year >= 1993, 3000)
  assert.ok(state.goty.length >= 2)
  assert.ok(state.goty.every(entry => entry.title && entry.year))
})

// ---------- coletiva de imprensa ----------

const words = text => text.trim().split(/\s+/).length

// Lança um micro com a nota empurrada para o alto (bonus > 0) ou para o chão (bonus < 0).
function releaseWith(seed, bonus, choice = {}) {
  let { state, random } = newGame(seed, 1995)
  state.money = 1e9
  state = reducer(state, { type: 'START_GAME', choice: { genre: 'rpg', theme: 'fantasia', platform: 'pc', size: 'micro', hook: HOOKS[0].id, title: 'Entrevistado', ...choice } }, random)
  state = runUntil(state, random, ready)
  state.buffs.score = bonus
  state = reducer(state, { type: 'RELEASE' }, random)
  return { state, random }
}

test('coletiva: conteúdo curto, com três tons e condições válidas', () => {
  const genreIds = new Set(GENRES.map(g => g.id))
  const themeIds = new Set(THEMES.map(t => t.id))
  const mediumIds = new Set(PRESS_MEDIUMS.map(m => m.id))
  const flags = new Set(['sequel', 'crunch', 'bugs', 'letdown', 'viral', 'first', 'solo', 'big', 'publisher', 'hybrid', 'multi', 'trend', 'demo', 'combo'])
  const ids = new Set()
  assert.ok(PRESS_QUESTIONS.length >= 40, `${PRESS_QUESTIONS.length} perguntas`)
  for (const question of PRESS_QUESTIONS) {
    assert.ok(!ids.has(question.id), `id repetido ${question.id}`)
    ids.add(question.id)
    assert.ok(words(question.q) <= 12, `pergunta longa: ${question.q}`)
    assert.deepEqual(question.answers.map(answer => answer.tone).sort(), ['confiante', 'humilde', 'polemico'], question.id)
    for (const answer of question.answers) {
      assert.ok(words(answer.label) <= 6, `resposta longa: ${answer.label}`)
      const reactions = answer.tone === 'polemico' ? [answer.win, answer.lose] : [answer.reaction]
      for (const text of reactions) {
        assert.ok(text, `${question.id} sem reação`)
        assert.ok(words(text) <= 9, `reação longa: ${text}`)
      }
    }
    const when = question.when ?? {}
    for (const band of when.band ?? []) assert.ok(PRESS_BANDS[band], `faixa ${band} em ${question.id}`)
    for (const g of when.genre ?? []) assert.ok(genreIds.has(g), `gênero ${g} em ${question.id}`)
    for (const t of when.theme ?? []) assert.ok(themeIds.has(t), `tema ${t} em ${question.id}`)
    for (const m of when.medium ?? []) assert.ok(mediumIds.has(m), `meio ${m} em ${question.id}`)
    for (const f of when.flags ?? []) assert.ok(flags.has(f), `condição ${f} em ${question.id}`)
  }
  for (const list of Object.values(PRESS_HEADLINES)) for (const line of list) assert.ok(words(line) <= 7, line)
  for (const tone of Object.values(PRESS_TONES)) assert.ok(ICONS[tone.icon], tone.icon)
  for (const medium of PRESS_MEDIUMS) assert.ok(ICONS[medium.icon] && medium.hosts.length >= 3, medium.id)
  for (let year = 1980; year <= 2045; year += 1) assert.ok(pressMediumFor(year), `sem meio em ${year}`)
  // Qualquer faixa, em qualquer época, sempre rende três perguntas.
  const { state } = newGame(1)
  for (const band of Object.keys(PRESS_BANDS)) {
    for (const medium of PRESS_MEDIUMS) {
      const ctx = { band, score: 7, genre: 'acao', genre2: null, theme: 'ninja', type: 'original', year: medium.minYear, medium: medium.id, flags: [] }
      const picked = pickPressQuestions(state, ctx, mulberry32(band.length + medium.minYear))
      assert.equal(picked.length, 3, `${band}/${medium.id}`)
      assert.ok(picked[0].when?.band?.includes(band), 'abre falando da nota')
      assert.equal(new Set(picked).size, 3)
    }
  }
})

test('coletiva: nota extrema sempre chama, relançamento nunca', () => {
  assert.equal(wantsPress(9, 'original', () => .99), true)
  assert.equal(wantsPress(8.5, 'sequel', () => .99), true)
  assert.equal(wantsPress(4.5, 'original', () => .99), true)
  assert.equal(wantsPress(7, 'original', () => .2), true)
  assert.equal(wantsPress(7, 'original', () => .8), false)
  for (const type of ['port', 'remaster', 'collection']) {
    assert.equal(wantsPress(9.8, type, () => 0), false, type)
    assert.equal(wantsPress(2, type, () => 0), false, type)
  }
  const random = mulberry32(5)
  let hits = 0
  for (let i = 0; i < 2000; i += 1) if (wantsPress(6.5, 'original', random)) hits += 1
  assert.ok(hits > 850 && hits < 1150, `meio a meio: ${hits}`)
})

test('coletiva: entra logo depois da revelação e segura o tempo', () => {
  let { state, random } = releaseWith(81, 200)
  const game = state.games.at(-1)
  assert.ok(game.score >= 8.5, `nota ${game.score}`)
  assert.equal(state.queue[0].kind, 'review')
  assert.equal(state.queue[1].kind, 'press')
  const press = state.queue[1]
  assert.equal(press.gameId, game.id)
  assert.equal(press.band, 'top')
  assert.equal(press.questions.length, 3)
  assert.ok(press.host && press.medium === 'tv', 'em 1995 a entrevista é na TV')
  state = reducer(state, { type: 'CLOSE' }, random)
  assert.equal(state.queue[0].kind, 'press')
  assert.ok(isBlocked(state), 'coletiva pausa o tempo')
  const week = state.week
  assert.equal(reducer(state, { type: 'TICK' }, random).week, week, 'semana não anda com a coletiva aberta')
  assert.equal(reducer(state, { type: 'PRESS_ANSWER', index: 7 }, random), state, 'resposta inexistente não muda nada')
  const once = reducer(state, { type: 'PRESS_ANSWER', index: 0, at: 0 }, random)
  assert.equal(once.queue[0].answers.length, 1)
  assert.equal(reducer(once, { type: 'PRESS_ANSWER', index: 0, at: 0 }, random), once, 'clique duplo não responde a próxima')
  ;({ state } = releaseWith(82, -200))
  assert.ok(state.games.at(-1).score <= 4.5, `nota ${state.games.at(-1).score}`)
  assert.equal(state.queue[1]?.kind, 'press', 'desastre também chama a imprensa')
  assert.equal(state.queue[1].band, 'flop')
})

test('coletiva: respostas aplicam efeitos, manchete fecha e hype vai pro próximo jogo', () => {
  let { state, random } = releaseWith(83, 200)
  state = reducer(state, { type: 'CLOSE' }, random)
  const founder = () => state.staff.find(person => person.founder)
  founder().mood = 50
  const item = () => state.queue[0]
  const plan = index => answerEffects(pressQuestionById(item().questions[item().answers.length]).answers[index], item().band)
  const toneIndex = tone => pressQuestionById(item().questions[item().answers.length]).answers.findIndex(answer => answer.tone === tone)

  const humble = toneIndex('humilde')
  const humbleFx = plan(humble).effects
  state = reducer(state, { type: 'PRESS_ANSWER', index: humble }, random)
  assert.equal(item().answers.length, 1)
  assert.ok(item().answers[0].chips.length > 0, 'resposta vira fichinhas')
  assert.ok(item().answers[0].text, 'reação preenchida')
  if (humbleFx.mood) assert.equal(founder().mood, 50 + humbleFx.mood, 'humildade mexe no humor da equipe')

  const confident = toneIndex('confiante')
  const confidentFx = plan(confident).effects
  const hypeBefore = state.buffs.hype ?? 0
  const fansBefore = state.fans
  state = reducer(state, { type: 'PRESS_ANSWER', index: confident }, random)
  if (confidentFx.nextHype) assert.equal(state.buffs.hype, hypeBefore + confidentFx.nextHype, 'confiança guarda hype')
  if (confidentFx.fansPct > 0) assert.ok(state.fans > fansBefore, 'fãs sobem')

  const spicy = toneIndex('polemico')
  assert.ok(plan(spicy).gamble.chance > 0 && plan(spicy).gamble.chance < 1)
  state = reducer(state, { type: 'PRESS_ANSWER', index: spicy }, random)
  const done = item()
  assert.equal(done.answers.length, 3)
  assert.equal(typeof done.answers[2].win, 'boolean', 'polêmica é aposta')
  assert.ok(done.headline?.text, 'manchete pronta')
  assert.equal(state.log[0].text, done.headline.text, 'manchete vai pra história')
  assert.equal(state.stats.interviews, 1)
  assert.equal(reducer(state, { type: 'PRESS_ANSWER', index: 0 }, random), state, 'nada depois da terceira')

  state = reducer(state, { type: 'CLOSE' }, random)
  assert.ok(!isBlocked(state))
  const week = state.week
  state = reducer(state, { type: 'TICK' }, random)
  assert.notEqual(state.week, week, 'o tempo volta a andar')

  state.buffs.hype = 12
  const plain = reducer(structuredClone(state), { type: 'START_GAME', choice: { genre: 'puzzle', theme: 'escola', platform: 'pc', size: 'micro', hook: HOOKS[0].id, title: 'Sem buff' } }, mulberry32(1))
  plain.buffs.hype = 0
  const boosted = reducer(state, { type: 'START_GAME', choice: { genre: 'puzzle', theme: 'escola', platform: 'pc', size: 'micro', hook: HOOKS[0].id, title: 'Com buff' } }, mulberry32(1))
  assert.equal(boosted.buffs.hype, 0, 'buff consumido')
  assert.ok(boosted.projects[0].hype > 0 && boosted.projects[0].hype >= Math.min(100, plain.projects[0].hype), 'próximo jogo nasce com hype')
})

test('coletiva: relançamento não chama a imprensa', () => {
  let { state, random } = releaseWith(84, 0)
  state.queue = []
  state = reducer(state, { type: 'START_GAME', choice: { type: 'port', sources: [state.games[0].id], platforms: ['playstation'], title: 'Porte' } }, random)
  state = runUntil(state, random, ready)
  state.buffs.score = 200
  state = reducer(state, { type: 'RELEASE' }, random)
  assert.equal(state.games.at(-1).type, 'port')
  assert.ok(!state.queue.some(entry => entry.kind === 'press'))
})

test('coletiva: "sem comentários" fecha no meio, sem efeito e com registro', () => {
  let { state, random } = releaseWith(85, 200)
  state = reducer(state, { type: 'CLOSE' }, random)
  state = reducer(state, { type: 'PRESS_ANSWER', index: 0 }, random)
  const fans = state.fans
  const money = state.money
  state = reducer(state, { type: 'CLOSE' }, random)
  assert.ok(!state.queue.some(entry => entry.kind === 'press'))
  assert.equal(state.fans, fans)
  assert.equal(state.money, money)
  assert.match(state.log[0].text, /Sem comentários/)
  assert.equal(state.stats.interviews ?? 0, 0, 'entrevista pela metade não conta')
})

test('coletiva: save antigo, sem os campos novos, ainda carrega e joga', () => {
  let { state, random } = releaseWith(86, 200)
  const old = JSON.parse(JSON.stringify(state))
  old.buffs = { score: 0, sales: 1 }
  delete old.stats.interviews
  for (const key of Object.keys(old.seenEvents)) if (key.startsWith('press:')) delete old.seenEvents[key]
  old.queue = old.queue.filter(entry => entry.kind !== 'press')
  const loaded = afterLoad(old)
  assert.equal(loaded.buffs.hype, 0)
  assert.equal(loaded.buffs.sales, 1)
  // Projeto começado antes da coletiva existir: sem crunchWeeks, sem bônus de hype.
  let next = reducer(loaded, { type: 'CLOSE' }, random)
  next = reducer(next, { type: 'START_GAME', choice: { genre: 'acao', theme: 'ninja', platform: 'pc', size: 'micro', hook: HOOKS[0].id, title: 'Depois' } }, random)
  delete next.projects[0].crunchWeeks
  next = runUntil(next, random, ready)
  assert.equal(next.queue[0]?.kind, 'ready')
  next = reducer(next, { type: 'RELEASE' }, random)
  assert.equal(next.games.at(-1).title, 'Depois')
  // Coletiva salva no meio com uma pergunta que não existe mais: resposta não quebra nada.
  const stale = afterLoad(JSON.parse(JSON.stringify(state)))
  stale.queue = stale.queue.filter(entry => entry.kind === 'press')
  stale.queue[0].questions = ['pergunta-apagada', ...stale.queue[0].questions.slice(1)]
  assert.equal(reducer(stale, { type: 'PRESS_ANSWER', index: 0 }, random), stale)
  assert.equal(reducer(stale, { type: 'CLOSE' }, random).queue.length, 0)
})

test('coletiva: o meio da entrevista acompanha a época', () => {
  assert.equal(pressMediumFor(1984).id, 'revista')
  assert.equal(pressMediumFor(1999).id, 'tv')
  assert.equal(pressMediumFor(2008).id, 'portal')
  assert.equal(pressMediumFor(2021).id, 'stream')
  let { state, random } = newGame(87, 2020)
  state.money = 1e9
  state = reducer(state, { type: 'START_GAME', choice: { genre: 'puzzle', theme: 'escola', platform: 'pc', size: 'micro', hook: HOOKS[0].id, title: 'Ao vivo' } }, random)
  state = runUntil(state, random, ready)
  state.buffs.score = 200
  state = reducer(state, { type: 'RELEASE' }, random)
  const press = state.queue.find(entry => entry.kind === 'press')
  assert.equal(press?.medium, 'stream', 'em 2020 a entrevista é podcast')
  assert.ok(PRESS_MEDIUMS.find(medium => medium.id === 'stream').hosts.includes(press.host))
})
