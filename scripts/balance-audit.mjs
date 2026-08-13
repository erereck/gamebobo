import { createInitialState } from '../src/game/engine/state.js'
import { reduceGame } from '../src/game/engine/reducer.js'
import { calculateRelease } from '../src/game/engine/scoring.js'
import { GENRES, FOCUSES } from '../src/game/data/catalog.js'
import { PROJECT_PROMISES, projectPhase } from '../src/game/data/projectPromises.js'

const runs = Math.max(20, Number(process.argv[2]) || 100)
const seedStart = Number(process.argv[3]) || 11037

function seeded(seed) {
  let value = seed >>> 0
  return () => {
    value += 0x6D2B79F5
    let next = value
    next = Math.imul(next ^ next >>> 15, next | 1)
    next ^= next + Math.imul(next ^ next >>> 7, next | 61)
    return ((next ^ next >>> 14) >>> 0) / 4294967296
  }
}

const average = values => values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length)
const percentile = (values, ratio) => [...values].sort((a, b) => a - b)[Math.min(values.length - 1, Math.floor(values.length * ratio))] ?? 0
const number = value => Math.round(value).toLocaleString('pt-BR')

function summarize(label, rows) {
  const scores = rows.map(item => item.score)
  const money = rows.map(item => item.net)
  return {
    grupo: label,
    n: rows.length,
    nota: average(scores).toFixed(1),
    P10: percentile(scores, .1),
    P90: percentile(scores, .9),
    '<60': `${(rows.filter(item => item.score < 60).length / rows.length * 100).toFixed(1)}%`,
    '80+': `${(rows.filter(item => item.score >= 80).length / rows.length * 100).toFixed(1)}%`,
    '90+': `${(rows.filter(item => item.score >= 90).length / rows.length * 100).toFixed(1)}%`,
    vendas: number(percentile(rows.map(item => item.sales), .5)),
    resultado: number(percentile(money, .5)),
    prejuízo: `${(rows.filter(item => item.net < 0).length / rows.length * 100).toFixed(1)}%`,
    meses: average(rows.map(item => item.months)).toFixed(1),
    stressP90: percentile(rows.map(item => item.peakStress), .9),
  }
}

function runProject(seed, { year, scale = 'micro', promise, trait = 'visionary', culture = 'balanced', aligned = true, profile = 'starter', playtest = false, plan = 'shadow', funded = false }) {
  const random = seeded(seed)
  let state = createInitialState({ startYear: year, traitId: trait }, random)
  state.competitors = state.competitors.slice(0, 1)
  state.queue = []
  state.studio.cultureId = culture
  if (funded) state.player.money = 50000
  if (profile === 'advanced') {
    const level = { medium: 1, large: 2, blockbuster: 3 }[scale] ?? 0
    const count = { medium: 2, large: 5, blockbuster: 11 }[scale] ?? 0
    state.player.money = { medium: 150000, large: 750000, blockbuster: 4000000 }[scale] ?? 50000
    state.player.followers = { medium: 2500, large: 18000, blockbuster: 90000 }[scale] ?? 300
    state.player.stats = { programming: 64, design: 62, art: 58, marketing: 48, charisma: 50 }
    state.studio.officeLevel = level
    state.player.equipmentLevel = year >= 2012 ? Math.min(4, level + 1) : year >= 2003 ? Math.min(3, level + 1) : 0
    state.studio.team = Array.from({ length: count }, (_, index) => ({ id: `p${index}`, name: `Pessoa ${index}`, roleId: ['programmer', 'artist', 'designer', 'producer', 'marketer', 'writer'][index % 6], personalityId: 'calm', skill: 58, potential: 72, salary: 3600, morale: 75, energy: 100, loyalty: 70, months: 0, projects: 0, awards: 0 }))
  }
  const genre = aligned ? promise.genres[0] : GENRES.find(item => !promise.genres.includes(item.id)).id
  const focus = aligned ? promise.focuses[0] : FOCUSES.find(item => !promise.focuses.includes(item.id)).id
  const startingMoney = state.player.money
  const startingMonth = state.date.year * 12 + state.date.month
  let peakStress = state.player.stress
  state = reduceGame(state, { type: 'START_PROJECT', payload: { title: 'Auditoria', genre, theme: 'fantasy', focus, platform: 'pc', scale, promiseId: promise.id } }, random)
  if (state.currentProject && plan !== 'shadow') state = reduceGame(state, { type: 'SET_LAUNCH_PLAN', plan }, random)
  let safety = 0
  let tested = false
  while (!state.games.length && state.currentProject && safety++ < 60) {
    state.queue = []
    if (playtest && !tested && projectPhase(state.currentProject) !== 'prototype') {
      const before = state.player.money
      state = reduceGame(state, { type: 'RUN_PLAYTEST' }, random)
      tested = state.player.money < before
    }
    const action = state.player.energy < 22 || state.player.stress > 74 ? 'rest' : 'develop'
    state = reduceGame(state, { type: 'MONTH_ACTION', payload: { action } }, random)
    peakStress = Math.max(peakStress, state.player.stress)
  }
  const game = state.games[0]
  return game ? { score: game.score, sales: game.sales, net: state.player.money - startingMoney, bugs: game.launchBugs ?? 0, months: state.date.year * 12 + state.date.month - startingMonth, peakStress } : null
}

let seed = seedStart
console.log(`Auditoria geral Gamebobo · ${runs} repetições por célula`)

const starters = []
for (const year of [1980, 1990, 2000, 2010, 2020]) {
  const rows = []
  const available = PROJECT_PROMISES.filter(item => item.fromYear <= year)
  for (let index = 0; index < runs * 2; index += 1) {
    const promise = available[index % available.length]
    const result = runProject(seed++, { year, promise, trait: ['visionary', 'workaholic', 'perfectionist', 'communicator', 'prodigy'][index % 5], aligned: index % 3 !== 0 })
    if (result) rows.push(result)
  }
  starters.push(summarize(`primeiro jogo ${year}`, rows))
}
console.log('\nPRIMEIRO JOGO')
console.table(starters)

const scales = []
for (const scale of ['micro', 'small', 'medium', 'large', 'blockbuster']) {
  const rows = []
  for (let index = 0; index < runs; index += 1) {
    const promise = PROJECT_PROMISES[index % PROJECT_PROMISES.length]
    const result = runProject(seed++, { year: 2020, scale, promise, aligned: true, profile: scale === 'micro' || scale === 'small' ? 'starter' : 'advanced' })
    if (result) rows.push(result)
  }
  scales.push(summarize(`2020 ${scale}`, rows))
}
console.log('\nESCALAS')
console.table(scales)

const promises = []
for (const promise of PROJECT_PROMISES) {
  const rows = []
  for (let index = 0; index < runs; index += 1) {
    const result = runProject(seed++, { year: 2000, scale: 'small', promise, aligned: true })
    if (result) rows.push(result)
  }
  promises.push(summarize(promise.label, rows))
}
console.log('\nPROMESSAS · PEQUENO EM 2000')
console.table(promises)

const factors = []
for (const trait of ['visionary', 'workaholic', 'perfectionist', 'communicator', 'prodigy']) {
  const rows = []
  for (let index = 0; index < runs; index += 1) {
    const result = runProject(seed++, { year: 2000, scale: 'small', promise: PROJECT_PROMISES[1], trait, aligned: true })
    if (result) rows.push(result)
  }
  factors.push(summarize(`traço ${trait}`, rows))
}
for (const culture of ['balanced', 'craft', 'experimental', 'commercial', 'crunch']) {
  const rows = []
  for (let index = 0; index < runs; index += 1) {
    const result = runProject(seed++, { year: 2010, scale: 'medium', promise: PROJECT_PROMISES[2], culture, aligned: true, profile: 'advanced' })
    if (result) rows.push(result)
  }
  factors.push(summarize(`cultura ${culture}`, rows))
}
for (const playtest of [false, true]) {
  const rows = []
  for (let index = 0; index < runs; index += 1) {
    const result = runProject(seed++, { year: 2000, scale: 'small', promise: PROJECT_PROMISES[1], playtest, aligned: true })
    if (result) rows.push(result)
  }
  factors.push(summarize(playtest ? 'com playtest' : 'sem playtest', rows))
}
console.log('\nTRAÇOS, CULTURAS E PLAYTEST')
console.table(factors)

const plans = []
for (const [year, plan] of [[2003, 'shadow'], [2003, 'standard'], [2003, 'campaign'], [2003, 'early'], [2020, 'creator']]) {
  const rows = []
  for (let index = 0; index < runs; index += 1) {
    const result = runProject(seed++, { year, scale: 'micro', promise: PROJECT_PROMISES[1], aligned: true, plan, funded: true })
    if (result) rows.push(result)
  }
  plans.push(summarize(`${year} ${plan}`, rows))
}
console.log('\nPLANOS DE LANÇAMENTO')
console.table(plans)

const rareRandom = seeded(seed++)
const rareState = createInitialState({ startYear: 2020, traitId: 'visionary' }, rareRandom)
rareState.player.followers = 90000
rareState.player.stats = { programming: 70, design: 70, art: 64, marketing: 62, charisma: 55 }
rareState.studio.officeLevel = 3
rareState.player.equipmentLevel = 4
rareState.studio.team = []
const rareProject = { title: 'Impossível', genre: rareState.market.genre, theme: 'fantasy', focus: 'innovation', platform: 'pc', scale: 'blockbuster', quality: 54, innovation: 22, pressure: 28, hype: 65, reach: .2, promiseId: 'new-every-run', promiseFit: 2, bugs: 1, launchPlan: 'campaign', franchiseId: null, licenseIds: [], licenseRoyalty: 0, eventIds: [] }
const rareRuns = runs * 1000
const rare = Array.from({ length: rareRuns }, () => calculateRelease(rareState, rareProject, rareRandom))
console.log('\nCAUDA RARA · BLOCKBUSTER FORTE EM 2020')
console.table([{
  amostras: number(rareRuns),
  nota: average(rare.map(item => item.score)).toFixed(1),
  estouros: `${(rare.filter(item => item.breakout).length / rare.length * 100).toFixed(3)}%`,
  fenômenos: `${(rare.filter(item => item.phenomenon).length / rare.length * 100).toFixed(4)}%`,
  vendasP99: number(percentile(rare.map(item => item.sales), .99)),
  máximo: number(rare.reduce((maximum, item) => Math.max(maximum, item.sales), 0)),
  '100M+': rare.filter(item => item.sales >= 100_000_000).length,
  '300M+': rare.filter(item => item.sales >= 300_000_000).length,
}])

function runCareer(seedValue, startYear) {
  const random = seeded(seedValue)
  let state = createInitialState({ startYear, traitId: ['visionary', 'workaholic', 'perfectionist', 'communicator', 'prodigy'][seedValue % 5] }, random)
  state.competitors = state.competitors.slice(0, 1)
  let months = 0
  let safety = 0
  let minimumCash = state.player.money
  while (months < 120 && safety++ < 2500) {
    if (state.queue.length) {
      const item = state.queue[0]
      state = item.kind === 'decision'
        ? reduceGame(state, { type: 'RESOLVE_DECISION', choiceId: item.choices[0].id }, random)
        : reduceGame(state, { type: 'ACK_QUEUE' }, random)
      continue
    }
    if (!state.currentProject && !state.currentContract && state.player.money > 1800) {
      const genre = state.world.knownGenres[state.games.length % state.world.knownGenres.length].id
      const focus = ['gameplay', 'story', 'innovation', 'systems'][state.games.length % 4]
      const promise = PROJECT_PROMISES.filter(item => item.fromYear <= state.date.year).sort((a, b) => (b.genres.includes(genre) + b.focuses.includes(focus)) - (a.genres.includes(genre) + a.focuses.includes(focus)))[0]
      const scale = state.games.length >= 4 ? 'small' : 'micro'
      state = reduceGame(state, { type: 'START_PROJECT', payload: { title: `Jogo ${state.games.length + 1}`, genre, theme: 'space', focus, platform: 'pc', scale, promiseId: promise.id } }, random)
      if (state.currentProject) continue
    }
    const action = state.currentContract ? 'contract' : state.currentProject && state.player.energy > 24 && state.player.stress < 75 ? 'develop' : state.player.energy <= 24 || state.player.stress >= 75 ? 'rest' : 'work'
    state = reduceGame(state, { type: 'MONTH_ACTION', payload: { action } }, random)
    months += 1
    minimumCash = Math.min(minimumCash, state.player.money)
  }
  return { games: state.games.length, score: average(state.games.map(item => item.score)), cash: state.player.money, minimumCash, followers: state.player.followers }
}

console.log('\nCARREIRAS AUTÔNOMAS · 10 ANOS')
const careerRows = []
for (const year of [1980, 2000, 2020]) {
  const rows = Array.from({ length: Math.max(10, Math.floor(runs / 5)) }, (_, index) => runCareer(seed++ + index, year))
  careerRows.push({
    início: year,
    carreiras: rows.length,
    jogos: percentile(rows.map(item => item.games), .5),
    nota: average(rows.map(item => item.score)).toFixed(1),
    caixaMediano: number(percentile(rows.map(item => item.cash), .5)),
    caixaP10: number(percentile(rows.map(item => item.cash), .1)),
    seguidores: number(percentile(rows.map(item => item.followers), .5)),
    dívida: `${(rows.filter(item => item.minimumCash < 0).length / rows.length * 100).toFixed(1)}%`,
  })
}
console.table(careerRows)
