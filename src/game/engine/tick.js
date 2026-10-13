import { CAMELO_ITEMS, CAMELO_LINES } from '../data/content/camelo.js'
import { TICKER } from '../data/content/ticker.js'
import { genreById, themeById } from '../data/genres.js'
import { OFFICES, PACES, WEEKS_PER_MONTH, WEEKS_PER_YEAR, moneyScale } from '../data/economy.js'
import { traitById } from '../data/staff.js'
import { activeStaff, createCandidates, decorTotals } from './staff.js'
import { computeChart, rollTrend, stepRivals } from './market.js'
import { generateFreelas } from './freelas.js'
import { workWeek } from './project.js'
import { eventContext, pickEvent, pickIdea } from './events.js'
import { checkAchievements, runAwards, updateLegacy } from './progress.js'
import { weeklyShare } from './sales.js'
import { absWeek, fx, log, scaled, toast, yearFloat } from './state.js'
import { clamp, int, makeId, pick, sample } from './rng.js'

export const BLOCKING = new Set(['event', 'idea', 'phase', 'ready', 'review', 'awards', 'bankrupt', 'welcome'])
export const isBlocked = state => state.queue.some(item => BLOCKING.has(item.kind))

function updateStaff(state) {
  const decor = decorTotals(state.decor)
  const working = Boolean(state.project && !state.project.ready)
  const pace = PACES[state.project?.pace] ?? PACES.normal
  const teamMood = state.staff.reduce((sum, person) => sum + (traitById(person.trait)?.teamMood ?? 0), 0)
  for (const person of state.staff) {
    if (person.status !== 'ok') {
      person.away -= 1
      if (person.away <= 0) returnFromAway(state, person)
      continue
    }
    const trait = traitById(person.trait)
    let delta = working ? pace.energy : 10
    if (delta < 0) delta *= trait?.energy ?? 1
    if (delta < 0 && pace.id === 'crunch' && trait?.crunchEnergy) delta *= trait.crunchEnergy
    person.energy = clamp(person.energy + delta + decor.energy * (working ? .5 : 1), 0, 100)
    const target = clamp(56 + decor.mood + teamMood - (working && pace.id === 'crunch' ? 14 : 0) - (person.energy < 25 ? 12 : 0), 5, 100)
    person.mood = clamp(person.mood + (target - person.mood) * .08, 0, 100)
    if (person.energy <= 0) {
      person.status = 'ferias'
      person.away = 3
      toast(state, { kind: 'bad', icon: 'zzz', title: `${person.name} pifou`, sub: '3 semanas fora' })
      fx(state, { type: 'leave', staffId: person.id })
    }
  }
  if (working && pace.id === 'crunch') state.stats.crunchWeeks += 1
}

function returnFromAway(state, person) {
  if (person.status === 'treino' && person.trainPillar) {
    const gain = 5 + Math.floor(Math.random() * 4)
    person.skills[person.trainPillar] += gain
    toast(state, { kind: 'good', icon: 'graduation', title: `${person.name} voltou do curso`, chips: [{ key: person.trainPillar, value: gain }] })
    person.trainPillar = null
  } else {
    person.energy = 100
    person.mood = clamp(person.mood + 15, 0, 100)
  }
  person.status = 'ok'
  person.away = 0
  fx(state, { type: 'return', staffId: person.id })
}

function sellGames(state) {
  const decor = decorTotals(state.decor)
  let weekRevenue = 0
  for (const game of state.games) {
    if (!game.onMarket) continue
    const weekly = Math.round(game.copies * weeklyShare(game.age, game.tau))
    game.weekly = weekly
    game.sold += weekly
    game.age += 1
    const revenue = Math.round(weekly * game.price * moneyScale(yearFloat(state)) / moneyScale(game.year))
    game.revenue += revenue
    weekRevenue += revenue
    state.fans += Math.round(weekly * (game.score / 10) ** 2 * .05 * decor.fans)
    state.stats.totalCopies += weekly
    state.stats.totalRevenue += revenue / moneyScale(yearFloat(state))
    if (game.age > game.tau * 3 + 6 && weekly < Math.max(30, game.copies * .003)) {
      game.onMarket = false
      game.weekly = 0
      state.stats.bestCopies = Math.max(state.stats.bestCopies, game.sold)
      toast(state, { kind: 'info', icon: 'cartridge', title: `${game.title} saiu das lojas`, chips: [{ key: 'copies', value: game.sold }] })
    }
  }
  if (weekRevenue > 0) {
    state.money += weekRevenue
    fx(state, { type: 'sale', amount: weekRevenue })
  }
}

function updateChart(state) {
  const before = new Map(state.chart.filter(entry => entry.mine).map(entry => [entry.id, entry.rank]))
  state.chart = computeChart(state)
  for (const entry of state.chart.filter(item => item.mine)) {
    const game = state.games.find(item => item.id === entry.id)
    if (!game) continue
    const previous = before.get(entry.id)
    game.peak = game.peak ? Math.min(game.peak, entry.rank) : entry.rank
    if (entry.rank === 1 && previous !== 1) {
      state.stats.chartNumberOnes += 1
      toast(state, { kind: 'great', icon: 'crown', title: `${game.title} é #1!`, sub: 'Topo das paradas' })
      fx(state, { type: 'cheer', big: true })
      log(state, 'crown', `${game.title} chegou ao #1`)
    } else if (!previous && entry.rank <= 3) {
      toast(state, { kind: 'good', icon: 'chart', title: `${game.title} entrou em #${entry.rank}`, sub: 'Paradas' })
    }
  }
}

function monthly(state, random) {
  const scale = moneyScale(yearFloat(state))
  const salaries = state.staff.reduce((sum, person) => sum + (person.founder ? 0 : person.salary), 0)
  const rent = OFFICES[state.office].rent
  const loan = state.loan ? state.loan.monthly : 0
  const living = 380
  const total = Math.round((salaries + rent + living) * scale) + loan
  state.money -= total
  if (state.project?.kind === 'game') state.project.labor = (state.project.labor ?? 0) + total
  fx(state, { type: 'expense', amount: total })
  if (state.loan) {
    state.loan.months -= 1
    if (state.loan.months <= 0) {
      state.loan = null
      toast(state, { kind: 'good', icon: 'check', title: 'Empréstimo quitado' })
    }
  }
  state.candidates = createCandidates(state.year, state.legacy, random)
  if (!state.project && random() < .5) state.freelas = generateFreelas(state, random)
  if (state.money < 0) {
    state.debtMonths += 1
    if (state.debtMonths >= 3) state.queue.push({ kind: 'bankrupt', id: makeId('q') })
    else toast(state, { kind: 'bad', icon: 'warning', title: 'Caixa no vermelho', sub: `${3 - state.debtMonths} meses até a falência` })
  } else state.debtMonths = 0

  maybeRomance(state, random)
  const tw = absWeek(state)
  if (!state.visitor && tw - state.lastCamelo > 16 && random() < .14) {
    const pool = CAMELO_ITEMS.filter(item => (item.minYear ?? 0) <= state.year && (item.maxYear ?? 9999) >= state.year)
    state.visitor = { kind: 'camelo', items: sample(pool, 3, random).map(item => item.id), until: tw + 5, line: pick(CAMELO_LINES, random), sold: [] }
    state.lastCamelo = tw
    toast(state, { kind: 'info', icon: 'briefcase', title: 'O Camelô chegou', sub: 'Clique nele' })
    fx(state, { type: 'visitor' })
  }
  checkAchievements(state)
}

// Escritório é lugar de trabalho... e às vezes de romance.
function maybeRomance(state, random) {
  state.couples ??= []
  state.couples = state.couples.filter(([a, b]) => state.staff.some(p => p.id === a) && state.staff.some(p => p.id === b))
  const single = state.staff.filter(p => !state.couples.some(pair => pair.includes(p.id)))
  if (single.length < 2 || state.staff.length < 3 || random() > .025) return
  const a = pick(single, random)
  const b = pick(single.filter(p => p !== a), random)
  state.couples.push([a.id, b.id])
  a.mood = clamp(a.mood + 12, 0, 100)
  b.mood = clamp(b.mood + 12, 0, 100)
  const first = name => name.split(' ')[0]
  toast(state, { kind: 'good', icon: 'heart', title: `${first(a.name)} + ${first(b.name)}`, sub: 'Romance no escritório' })
  log(state, 'heart', `${a.name} e ${b.name} estão juntos`)
}

function trends(state, random) {
  const tw = absWeek(state)
  if (tw < state.market.trendUntil) return
  state.market.trend = state.market.nextTrend ?? rollTrend(state.year, random, state.techs)
  state.market.nextTrend = rollTrend(state.year, random, state.techs)
  state.market.trendUntil = tw + int(24, 40, random)
  const genre = genreById(state.market.trend.genre)?.label
  const theme = themeById(state.market.trend.theme)?.label
  toast(state, { kind: 'info', icon: 'fire', title: 'Nova moda', sub: `${genre} · ${theme}` })
}

function maybeEvent(state, random) {
  const tw = absWeek(state)
  if (isBlocked(state) || tw - state.lastEventWeek < 5) return
  const p = state.project?.kind === 'game' ? .07 : .055
  if (random() > p) return
  const event = pickEvent(state, random)
  if (!event) return
  state.lastEventWeek = tw
  state.seenEvents[event.id] = tw
  state.stats.eventsSeen += 1
  state.queue.push({ kind: 'event', id: makeId('q'), eventId: event.id, ctx: eventContext(state, random) })
  fx(state, { type: 'event' })
}

function maybeIdea(state, random) {
  const project = state.project
  if (!project || project.kind !== 'game' || project.ready) return
  const tw = absWeek(state)
  state.ideas = state.ideas.filter(idea => idea.until > tw && state.staff.some(person => person.id === idea.staffId && person.status === 'ok'))
  const max = state.staff.length >= 6 ? 2 : 1
  if (state.ideas.length >= max || random() > .09) return
  const free = activeStaff(state).filter(person => !state.ideas.some(idea => idea.staffId === person.id))
  if (!free.length) return
  const idea = pickIdea(state, random)
  if (!idea) return
  const person = pick(free, random)
  state.ideas.push({ id: makeId('idea'), staffId: person.id, ideaId: idea.id, until: tw + 7 })
  fx(state, { type: 'idea', staffId: person.id })
}

function research(state) {
  const working = Boolean(state.project)
  const ideaSum = activeStaff(state).reduce((sum, person) => sum + person.skills.idea, 0)
  state.rp += ideaSum / 70 * (working ? 1 : 1.8) + .3
}

function yearEnd(state, random) {
  const finished = state.year - 1
  const ceremony = runAwards(state, finished, random)
  if (ceremony) {
    state.queue.push({ id: makeId('q'), ...ceremony })
    updateLegacy(state)
  }
  state.rivalGames = state.rivalGames.filter(game => game.year >= finished)
  const headline = TICKER.filter(item => (item.minYear ?? 0) <= state.year && (item.maxYear ?? 9999) >= state.year)
  if (headline.length) state.headline = pick(headline, random).text
  log(state, 'calendar', `Chegou ${state.year}`)
}

export function tick(state, random = Math.random) {
  if (isBlocked(state)) return state
  state.fx = []
  state.week += 1
  let newYear = false
  if (state.week >= WEEKS_PER_YEAR) {
    state.week = 0
    state.year += 1
    newYear = true
  }
  updateStaff(state)
  workWeek(state)
  sellGames(state)
  stepRivals(state, random)
  updateChart(state)
  research(state)
  trends(state, random)
  if (state.visitor && absWeek(state) >= state.visitor.until) {
    state.visitor = null
    fx(state, { type: 'visitorLeave' })
  }
  if (state.week % WEEKS_PER_MONTH === 0) monthly(state, random)
  if (newYear) yearEnd(state, random)
  maybeIdea(state, random)
  maybeEvent(state, random)
  return state
}

export { scaled }
