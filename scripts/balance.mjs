// Robô jogador: roda carreiras inteiras e imprime a curva de notas, caixa e progresso.
// Uso: node scripts/balance.mjs [carreiras=24] [anos=25] [perfil=sensato|preguicoso|ousado]
import { reducer } from '../src/game/engine/reducer.js'
import { mulberry32 } from '../src/game/engine/rng.js'
import { comboRating, unlockedGenres, unlockedThemes } from '../src/game/data/genres.js'
import { availablePlatforms, platformFit, platformSize } from '../src/game/data/platforms.js'
import { OFFICES, SIZES, TECHS, PHASES, PHASE_FOCUS, MARKETING, DECOR, moneyScale } from '../src/game/data/economy.js'
import { HOOKS } from '../src/game/data/content/hooks.js'
import { genreById } from '../src/game/data/genres.js'
import { projectCost } from '../src/game/engine/project.js'
import { yearFloat } from '../src/game/engine/state.js'
import { isBlocked } from '../src/game/engine/tick.js'

const RUNS = Number(process.argv[2] ?? 24)
const YEARS = Number(process.argv[3] ?? 25)
const STYLE = process.argv[4] ?? 'sensato'
const START_YEARS = [1980, 1988, 1995, 2004, 2012, 2020]

function pickChoice(state, random) {
  const t = yearFloat(state)
  const genres = unlockedGenres(state.year, state.techs)
  const themes = unlockedThemes(state.year)
  let best = null
  const explore = STYLE === 'ousado' ? .6 : STYLE === 'preguicoso' ? 1 : .3
  if (random() > explore) {
    const known = Object.entries(state.combos).filter(([, r]) => r >= 2).map(([key]) => key.split(':'))
      .filter(([g, th]) => genres.some(x => x.id === g) && themes.some(x => x.id === th))
    const last = state.games.at(-1)
    const fresh = known.filter(([g, th]) => !(last && last.genre === g && last.theme === th))
    if (fresh.length) best = fresh[Math.floor(random() * fresh.length)]
  }
  if (!best) {
    const g = genres[Math.floor(random() * genres.length)].id
    const th = themes[Math.floor(random() * themes.length)].id
    best = [g, th]
  }
  const [genre, theme] = best
  const platforms = availablePlatforms(t)
    .map(p => ({ p, score: platformSize(p, t) * (1 + platformFit(p, genre) * .35), cost: projectCost(state, { size: 'micro', platform: p.id }).kit }))
    .filter(x => STYLE === 'preguicoso' ? x.p.id === 'pc' : x.cost < state.money * .3)
    .sort((a, b) => b.score - a.score)
  const platform = (platforms[0]?.p ?? platforms.at(-1)?.p ?? { id: 'pc' }).id
  const team = state.staff.length
  const sizes = SIZES.filter(s => s.office <= state.office && (STYLE === 'ousado' ? team >= s.team * .6 : team >= s.team * .85))
  let size = 'micro'
  for (const s of sizes) {
    const cost = projectCost(state, { size: s.id, platform }).total
    if (cost * (STYLE === 'ousado' ? 1.2 : 1.8) < state.money) size = s.id
  }
  const hooks = HOOKS.filter(h => (h.minYear ?? 0) <= state.year && (h.maxYear ?? 9999) >= state.year)
  const fitting = hooks.filter(h => h.genres?.includes(genre))
  const hook = (fitting.length && STYLE !== 'preguicoso' ? fitting : hooks)[Math.floor(random() * (fitting.length || hooks.length))]?.id ?? hooks[0].id
  return { genre, theme, platform, size, hook, title: `Jogo ${state.games.length + 1}` }
}

function bestFocus(state, phaseIndex) {
  const project = state.project
  const genre = genreById(project.genre)
  const total = Object.values(project.pts).reduce((a, b) => a + b, 0) || 1
  const options = PHASE_FOCUS[PHASES[phaseIndex].id]
  let best = options[0]
  let bestScore = -Infinity
  for (const option of options) {
    let score = 0
    for (const [key, mult] of Object.entries(option.mix)) score += (genre.w[key] - project.pts[key] / total) * (mult - 1)
    if (phaseIndex === 2 && project.bugs / total > .12) score += (option.bugFix ?? 1) * .1
    if (score > bestScore) { bestScore = score; best = option }
  }
  return best.id
}

function act(state, random) {
  const item = state.queue[0]
  if (item) {
    if (item.kind === 'event' || item.kind === 'idea') {
      if (!item.result) {
        const data = item.kind === 'event' ? null : null
        const count = 2
        return { type: 'CHOOSE', index: Math.floor(random() * count) }
      }
      return { type: 'CLOSE' }
    }
    if (item.kind === 'phase') return { type: 'SET_FOCUS', focus: STYLE === 'preguicoso' ? PHASE_FOCUS[PHASES[item.phase].id][0].id : bestFocus(state, item.phase) }
    if (item.kind === 'ready') {
      const total = Object.values(state.project.pts).reduce((a, b) => a + b, 0) || 1
      if (STYLE !== 'preguicoso' && state.project.bugs / total > .1 && (state.project.totalWeeks - state.project.baseWeeks) < 4) return { type: 'POLISH_MORE' }
      return { type: 'RELEASE' }
    }
    if (item.kind === 'bankrupt') return { type: 'BANKRUPT', choice: state.usedLoan ? 'home' : 'loan' }
    return { type: 'CLOSE' }
  }
  if (STYLE === 'preguicoso') {
    if (!state.project) {
      const choice = pickChoice(state, random)
      const cost = projectCost(state, choice).total
      if (cost <= state.money) return { type: 'START_GAME', choice }
    }
    return { type: 'TICK' }
  }
  const scale = moneyScale(yearFloat(state))
  const payroll = state.staff.reduce((s, p) => s + p.salary, 0) * scale
  // pesquisa
  for (const tech of TECHS) {
    if (state.techs.includes(tech.id) || tech.year > state.year || state.rp < tech.rp) continue
    if (tech.cost * scale * 2.5 < state.money) return { type: 'RESEARCH', id: tech.id }
  }
  // escritório
  const next = OFFICES[state.office + 1]
  if (next && state.staff.length >= OFFICES[state.office].cap && next.cost * scale * 2.2 < state.money && !state.project) return { type: 'UPGRADE_OFFICE' }
  // contratar
  if (state.staff.length < OFFICES[state.office].cap && state.games.length >= 2 && state.candidates.length) {
    const best = [...state.candidates].sort((a, b) => (b.skills.fun + b.skills.art + b.skills.sound + b.skills.idea) / b.salary - (a.skills.fun + a.skills.art + a.skills.sound + a.skills.idea) / a.salary)[0]
    if (state.money > (payroll + best.salary * scale) * 8) return { type: 'HIRE', id: best.id }
  }
  // decoração
  for (const item of DECOR) {
    if (state.decor.includes(item.id) || state.decor.length >= OFFICES[state.office].slots) continue
    if (item.cost * scale * 12 < state.money) return { type: 'BUY_DECOR', id: item.id }
  }
  if (!state.project) {
    if (state.freelas.length && state.money < projectCost(state, { size: 'pequeno', platform: 'pc' }).total * 1.2) return { type: 'START_FREELA', id: state.freelas[0].id }
    const choice = pickChoice(state, random)
    const cost = projectCost(state, choice).total
    if (cost <= state.money) return { type: 'START_GAME', choice }
    if (state.freelas.length) return { type: 'START_FREELA', id: state.freelas[0].id }
  } else if (state.project.kind === 'game' && state.project.hype < 45 && random() < .08) {
    const channels = MARKETING.filter(c => c.from <= state.year && c.to >= state.year && c.cost * scale < state.money * .06)
    if (channels.length) return { type: 'MARKET', id: channels[Math.floor(random() * channels.length)].id }
  }
  return { type: 'TICK' }
}

function career(seed, startYear) {
  const random = mulberry32(seed)
  let state = reducer(null, { type: 'NEW_GAME', options: { founderName: 'Bot', studioName: 'Robôs', startYear, profileId: ['programador', 'artista', 'musico', 'visionario'][seed % 4] } }, random)
  const endYear = startYear + YEARS
  let guard = 0
  const yearly = []
  let lastYear = state.year
  while (state.year < endYear && guard < 200000) {
    guard += 1
    const action = act(state, random)
    const next = reducer(state, action, random)
    if (next === state && action.type !== 'TICK') state = reducer(state, { type: 'TICK' }, random)
    else state = next
    if (state.year !== lastYear) {
      yearly.push({ year: lastYear, money: state.money / moneyScale(state.year), staff: state.staff.length, office: state.office, fans: state.fans })
      lastYear = state.year
    }
  }
  return { state, yearly }
}

const pct = (list, p) => {
  if (!list.length) return NaN
  const sorted = [...list].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]
}
const f1 = n => (Number.isFinite(n) ? n.toFixed(1) : '—')

const all = []
const buckets = {}
for (let run = 0; run < RUNS; run += 1) {
  const startYear = START_YEARS[run % START_YEARS.length]
  const { state, yearly } = career(1000 + run * 7919, startYear)
  all.push({ state, yearly, startYear })
  state.games.forEach((game, i) => {
    const key = i < 3 ? 'jogos 1-3' : i < 8 ? 'jogos 4-8' : i < 16 ? 'jogos 9-16' : i < 30 ? 'jogos 17-30' : 'jogos 31+'
    ;(buckets[key] ??= []).push(game)
  })
}

console.log(`\n=== ${RUNS} carreiras · ${YEARS} anos · estilo ${STYLE} ===\n`)
console.log('faixa'.padEnd(13), 'n'.padStart(5), 'p10'.padStart(6), 'p50'.padStart(6), 'p90'.padStart(6), ' max', '  ≥9  ', 'ROI p50', 'ROI p90', 'lucro<0')
for (const key of ['jogos 1-3', 'jogos 4-8', 'jogos 9-16', 'jogos 17-30', 'jogos 31+']) {
  const games = buckets[key] ?? []
  if (!games.length) continue
  const scores = games.map(g => g.score)
  const roi = games.filter(g => !g.onMarket).map(g => g.revenue / Math.max(1, g.cost + (g.labor ?? 0)))
  const loss = roi.filter(r => r < 1).length / Math.max(1, roi.length)
  console.log(key.padEnd(13), String(games.length).padStart(5), f1(pct(scores, .1)).padStart(6), f1(pct(scores, .5)).padStart(6), f1(pct(scores, .9)).padStart(6), f1(Math.max(...scores)).padStart(5),
    `${(scores.filter(s => s >= 9).length / scores.length * 100).toFixed(1)}%`.padStart(6), f1(pct(roi, .5)).padStart(7), f1(pct(roi, .9)).padStart(7), `${(loss * 100).toFixed(0)}%`.padStart(7))
}

console.log('\npor carreira:')
for (const { state, startYear } of all) {
  const s = state.stats
  console.log(`${startYear}: jogos ${String(s.gamesReleased).padStart(3)} · melhor ${f1(s.bestScore)} · escritório ${state.office} · equipe ${String(state.staff.length).padStart(2)} · fãs ${String(Math.round(state.fans)).padStart(9)} · caixa(1980) ${String(Math.round(state.money / moneyScale(state.year))).padStart(9)} · #1 ${s.chartNumberOnes} · prêmios ${s.awardsWon} · falências ${s.bankruptcies} · conquistas ${state.achievements.length} · freelas ${s.freelasDone} · pesquisas ${s.researchDone}`)
}
const offices = all.map(a => a.state.office)
console.log(`\nescritório final p50 ${pct(offices, .5)} · falências totais ${all.reduce((n, a) => n + a.state.stats.bankruptcies, 0)}`)
const firstOffice = all.map(a => a.yearly.findIndex(y => y.office >= 1)).filter(i => i >= 0)
const office2 = all.map(a => a.yearly.findIndex(y => y.office >= 2)).filter(i => i >= 0)
const office3 = all.map(a => a.yearly.findIndex(y => y.office >= 3)).filter(i => i >= 0)
const office4 = all.map(a => a.yearly.findIndex(y => y.office >= 4)).filter(i => i >= 0)
console.log(`anos até garagem p50 ${pct(firstOffice, .5)} · salinha ${pct(office2, .5)} · escritório ${pct(office3, .5)} · sede ${pct(office4, .5)} (${office4.length}/${all.length})`)

if (process.env.DEBUG) {
  const { state } = all[Number(process.env.DEBUG) || 0]
  console.log('\njogo a jogo (valores em unidades de 1980):')
  for (const g of state.games.slice(0, 40)) {
    const scale = moneyScale(g.year + g.week / 48)
    console.log(`${g.year} ${g.size.padEnd(7)} ${g.platform.padEnd(12)} nota ${g.score.toFixed(1)} q${String(g.quality).padStart(3)} cópias ${String(g.copies).padStart(9)} receita ${String(Math.round(g.revenue / scale)).padStart(9)} custo ${String(Math.round((g.cost + (g.labor ?? 0)) / scale)).padStart(8)} v${g.ratio} ${g.breakout ? 'VIRAL' : ''}`)
  }
}
