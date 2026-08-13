import { MARKET_ANGLES, labelOf } from '../data/catalog.js'
import { PERSONAL_EVENTS } from '../data/personalEvents.js'
import { POST_LAUNCH_EVENTS } from '../data/postLaunchEvents.js'
import { worldEventsForYear } from '../data/worldEvents.js'
import { STUDIO_EVENTS } from '../data/studioEvents.js'
import { FRANCHISE_EVENTS } from '../data/franchiseEvents.js'
import { COMPETITOR_EVENTS } from '../data/competitorEvents.js'
import { SUCCESSION_EVENT, successionChoices } from '../data/succession.js'
import { getEra } from '../data/eras.js'
import { availablePlatforms, generateCompetitorLaunch } from './market.js'
import { makeId, randomChoice, randomInt } from './utils.js'
import { HISTORICAL_MILESTONES } from '../data/industryHistory.js'

export const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
export const MONTH_NAMES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

export const dateLabel = date => `${MONTHS[date.month]} ${date.year}`

export function addHistory(state, title, body, options = {}) {
  state.history.push({
    id: makeId('history'),
    date: options.date ?? dateLabel(state.date),
    title,
    body,
    highlight: Boolean(options.highlight),
    kind: options.kind ?? 'month',
  })
  if (state.history.length > 160) state.history.shift()
}

export function advanceDate(state) {
  state.date.month += 1
  if (state.date.month > 11) {
    state.date.month = 0
    state.date.year += 1
    state.player.age += 1
  }
  state.market.monthsLeft -= 1
}

const asDecision = (event, source, context = {}) => ({
  id: makeId('decision'),
  kind: 'decision',
  source,
  eventId: event.id,
  tag: event.tag,
  title: event.title,
  body: event.body,
  choices: event.choices,
  context,
})

const hydrateEvent = (event, values) => {
  const replace = text => Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, value), text)
  return { ...event, title: replace(event.title), body: replace(event.body) }
}

function tickPlatforms(state, random) {
  let changed = false
  const available = availablePlatforms(state.date.year, state.date.month)
  available.forEach(platform => {
    if (platform.id in state.market.platforms) return
    state.market.platforms[platform.id] = randomInt(8, 16, random)
    state.player.audience.platforms[platform.id] ??= 0
    changed = true
    if (state.settings.timelineNotices !== false) state.queue.push({
      id: makeId('platform'), kind: 'info', timelineNotice: true, autoAdvance: true, tag: 'NOVA PLATAFORMA', title: `${platform.label} chegou ao mercado`,
      body: 'Uma base pequena, curiosa e ainda sem catálogo consolidado. Quem chegar cedo pode definir o gosto do público.',
      details: ['PÚBLICO NOVO', `ROYALTY ${Math.round(platform.royalty * 100)}%`, 'RISCO ALTO'],
    })
    addHistory(state, `${platform.label} chegou às lojas`, 'Uma nova plataforma entrou na disputa por atenção.', { highlight: true, kind: 'industry' })
  })
  Object.keys(state.market.platforms).forEach(id => {
    if (available.some(platform => platform.id === id)) return
    delete state.market.platforms[id]
    changed = true
  })
  if (!changed) return
  const total = Object.values(state.market.platforms).reduce((sum, value) => sum + value, 0)
  const ids = Object.keys(state.market.platforms)
  ids.forEach(id => { state.market.platforms[id] = Math.round(state.market.platforms[id] / total * 100) })
  state.market.platforms[ids[0]] += 100 - Object.values(state.market.platforms).reduce((sum, value) => sum + value, 0)
}

function tickHistoricalMilestones(state) {
  const milestones = HISTORICAL_MILESTONES.filter(item => item.year === state.date.year && item.month === state.date.month && !state.world.seenHistoricalMilestones.includes(item.id))
  milestones.forEach(milestone => {
    state.world.seenHistoricalMilestones.push(milestone.id)
    state.world.industryNews.unshift({ id: makeId('historical-news'), year: milestone.year, title: milestone.title, body: milestone.copy, company: milestone.company, historical: true })
    if (state.settings.timelineNotices !== false) state.queue.push({ id: makeId('historical'), kind: 'info', timelineNotice: true, autoAdvance: true, tag: `ARQUIVO · ${milestone.company.toUpperCase()}`, title: milestone.title, body: milestone.copy, details: [`${MONTHS[milestone.month]} ${milestone.year}`, 'MARCO HISTÓRICO', 'A LINHA DO TEMPO CONTINUA'] })
    addHistory(state, milestone.title, `${milestone.company}: ${milestone.copy}`, { highlight: true, kind: 'industry' })
  })
}

function tickMarket(state, random) {
  if (state.market.monthsLeft > 0) return
  const previousGenre = state.market.genre
  const genres = state.world.knownGenres.filter(item => item.id !== previousGenre)
  state.market.genre = randomChoice(genres, random).id
  state.market.angle = randomChoice(MARKET_ANGLES, random).id
  state.market.heat = randomInt(68, 96, random)
  state.market.monthsLeft = randomInt(6, 12, random)
  state.market.cycle += 1
  Object.keys(state.market.platforms).forEach(id => {
    state.market.platforms[id] = Math.max(12, state.market.platforms[id] + randomInt(-9, 9, random))
  })
  const platformTotal = Object.values(state.market.platforms).reduce((sum, value) => sum + value, 0)
  const platformIds = Object.keys(state.market.platforms)
  platformIds.forEach(id => {
    state.market.platforms[id] = Math.round(state.market.platforms[id] / platformTotal * 100)
  })
  const roundingDifference = 100 - Object.values(state.market.platforms).reduce((sum, value) => sum + value, 0)
  state.market.platforms[platformIds[0]] += roundingDifference
  const channel = state.date.year < 1985 ? 'As revistas e os lojistas' : state.date.year < 2007 ? 'A imprensa e as lojas' : 'As lojas e comunidades digitais'
  addHistory(state, `${labelOf(state.world.knownGenres, state.market.genre)} ganhou espaço`, `${channel} também estão pedindo ${labelOf(MARKET_ANGLES, state.market.angle).toLowerCase()}.`, { highlight: true, kind: 'market' })
}

function tickCompetitors(state, random) {
  state.competitors.forEach(studio => studio.games.forEach(game => {
    game.age = (game.age ?? 0) + 1
    if (game.age <= 24) game.sales += Math.round((game.initialSales ?? game.sales) * Math.max(.008, .055 - game.age * .0018))
  }))
  if (random() > 0.17) return
  const competitor = randomChoice(state.competitors, random)
  const launch = generateCompetitorLaunch(competitor, dateLabel(state.date), state.world.knownGenres, random)
  competitor.games.unshift(launch)
  competitor.reputation = Math.min(99, competitor.reputation + Math.round((launch.score - 65) / 8))
  if (competitor.cohort) {
    competitor.momentum = Math.min(100, (competitor.momentum ?? 0) + Math.max(1, Math.round((launch.score - 60) / 6)))
    competitor.status = launch.breakout ? 'estourou' : competitor.reputation >= 45 ? 'em ascensão' : competitor.games.length >= 3 ? 'sobreviveu' : 'garagem'
  }
  const comparison = state.games[0]?.genre === launch.genre && state.games[0]?.released === launch.released
  if (comparison) {
    const playerGame = state.games[0]
    const winner = playerGame.score >= launch.score ? playerGame.title : launch.title
    playerGame.rivals ??= []
    playerGame.rivals.push({ studioId: competitor.id, gameId: launch.id, winner, year: state.date.year })
    competitor.relationScore = Math.max(-100, (competitor.relationScore ?? 0) - 14)
    competitor.relation = competitor.relationScore <= -20 ? 'rival' : 'neutral'
  }
  addHistory(
    state,
    `${competitor.name} lançou ${launch.title}`,
    `Nota ${launch.score}. ${comparison ? 'Saiu no mesmo mês que o seu jogo.' : `${launch.sales.toLocaleString('pt-BR')} cópias.`}`,
    { highlight: comparison, kind: 'competitor' },
  )
  if (launch.breakout) {
    state.queue.push({ id: makeId('breakout'), kind: 'info', tag: 'NINGUÉM VIU CHEGANDO', title: `${competitor.name} estourou com ${launch.title}`, body: `O estúdio que abriu as portas junto com você vendeu ${launch.sales.toLocaleString('pt-BR')} cópias. Agora a turma da garagem tem um fenômeno próprio.`, details: [`NOTA ${launch.score}`, 'SUCESSO IMPROVÁVEL', 'RANKING EM MOVIMENTO'] })
    addHistory(state, `${competitor.name} saiu da garagem`, `${launch.title} virou o primeiro grande estouro da turma de ${state.meta.startYear}.`, { highlight: true, kind: 'competitor' })
  }
}

function tickEra(state) {
  const era = getEra(state.date.year)
  if (era.id === state.world.eraId) return
  const previous = state.world.eraId
  state.world.eraId = era.id
  state.world.eraStarted = state.date.year
  if (state.settings.timelineNotices !== false) state.queue.push({
    id: makeId('era'), kind: 'info', timelineNotice: true, autoAdvance: true, tag: 'MUDANÇA DE ERA', title: era.name,
    body: era.description,
    details: era.keywords.map(keyword => keyword.toUpperCase()),
  })
  addHistory(state, `Começou: ${era.name}`, era.description, { highlight: true, kind: 'industry' })
  state.world.industryNews.unshift({ id: makeId('news'), year: state.date.year, title: era.name, body: era.description, previous })
}

function tickWorldEvent(state, random) {
  if (random() > 0.055 || state.queue.some(item => item.kind === 'decision')) return
  const candidates = worldEventsForYear(state.date.year).filter(event => !state.world.seenEvents.includes(event.id) || random() < 0.15)
  if (!candidates.length) return
  const event = randomChoice(candidates, random)
  state.world.seenEvents.push(event.id)
  state.queue.push(asDecision(event, 'world'))
}

function tickPostLaunch(state, random) {
  let queued = false
  state.activeReleases = state.activeReleases.filter(release => {
    if (release.age === 0) {
      release.age = 1
      return true
    }
    release.monthsLeft -= 1
    const game = state.games.find(item => item.id === release.gameId)
    if (game) {
      const tailSales = Math.round(game.initialSales * randomInt(4, 10, random) / 100 * Math.max(0.35, release.monthsLeft / 5))
      const tailRevenue = Math.round(tailSales * game.price * game.royalty)
      game.sales += tailSales
      game.revenue += tailRevenue
      state.player.money += tailRevenue
    }
    const candidates = POST_LAUNCH_EVENTS.filter(event => state.date.year >= (event.fromYear ?? 1980) && state.date.year <= (event.toYear ?? 9999) && !release.eventIds.includes(event.id))
    if (!queued && game && candidates.length && random() < 0.46) {
      const event = randomChoice(candidates, random)
      release.eventIds.push(event.id)
      state.queue.push(asDecision(event, 'postLaunch', { gameId: game.id }))
      queued = true
    }
    return release.monthsLeft > 0
  })
}

function tickPersonal(state, random) {
  const candidates = PERSONAL_EVENTS.filter(event => !state.seenPersonalEvents.includes(event.id) && (!event.condition || event.condition(state)))
  const forcedEvent = candidates.find(event => event.id === 'health-scare') ?? candidates.find(event => event.id === 'burnout')
  if (!candidates.length || (!forcedEvent && random() > 0.09)) return
  if (state.queue.some(item => item.kind === 'decision')) return
  const event = forcedEvent ?? randomChoice(candidates, random)
  state.seenPersonalEvents.push(event.id)
  state.queue.push(asDecision(event, 'personal'))
}

function tickStudioEvent(state, random) {
  if (!state.studio.team.length || state.queue.some(item => item.kind === 'decision') || random() > 0.075) return
  const candidates = STUDIO_EVENTS.filter(event => !state.world.seenEvents.includes(`studio:${event.id}`))
  if (!candidates.length) return
  const person = [...state.studio.team].sort((a, b) => a.energy + a.morale - b.energy - b.morale)[0]
  const event = randomChoice(candidates, random)
  state.world.seenEvents.push(`studio:${event.id}`)
  state.queue.push(asDecision(hydrateEvent(event, { name: person.name }), 'studio', { personId: person.id }))
}

function tickFranchiseEvent(state, random) {
  if (state.queue.some(item => item.kind === 'decision') || random() > 0.045) return
  const groups = new Map()
  state.games.forEach(game => {
    if (!game.franchiseId) return
    const list = groups.get(game.franchiseId) ?? []
    list.push(game)
    groups.set(game.franchiseId, list)
  })
  const franchises = [...groups.values()].filter(games => games.length >= 2)
  const candidates = FRANCHISE_EVENTS.filter(event => state.date.year >= (event.fromYear ?? 1980) && state.date.year <= (event.toYear ?? 9999) && !state.world.seenEvents.includes(`franchise:${event.id}`))
  if (!franchises.length || !candidates.length) return
  const games = randomChoice(franchises, random)
  const game = games[0]
  const event = randomChoice(candidates, random)
  state.world.seenEvents.push(`franchise:${event.id}`)
  state.queue.push(asDecision(hydrateEvent(event, { franchise: game.franchiseName }), 'franchise', { gameId: game.id, franchiseId: game.franchiseId }))
}

function tickCompetitorEvent(state, random) {
  if (state.queue.some(item => item.kind === 'decision') || random() > 0.05) return
  const candidates = COMPETITOR_EVENTS.filter(event => state.date.year >= (event.fromYear ?? 1980) && state.date.year <= (event.toYear ?? 9999) && !state.world.seenEvents.includes(`competitor:${event.id}`))
  if (!candidates.length || !state.competitors.length) return
  const studio = randomChoice(state.competitors, random)
  const event = randomChoice(candidates, random)
  state.world.seenEvents.push(`competitor:${event.id}`)
  state.queue.push(asDecision(hydrateEvent(event, { studio: studio.name }), 'competitor', { studioId: studio.id }))
}

function tickSuccession(state) {
  const due = state.player.age >= 65 && state.player.age >= (state.player.flags.successionDeferredUntil ?? 65)
  if (!due || state.date.month !== 0 || state.queue.some(item => item.kind === 'decision')) return
  state.queue.push({
    id: makeId('succession'), kind: 'decision', source: 'legacy', eventId: SUCCESSION_EVENT.id,
    tag: SUCCESSION_EVENT.tag, title: SUCCESSION_EVENT.title, body: SUCCESSION_EVENT.body,
    choices: successionChoices(state), context: {},
  })
}

export function tickWorld(state, random = Math.random) {
  tickEra(state)
  tickHistoricalMilestones(state)
  tickSuccession(state)
  tickPlatforms(state, random)
  tickMarket(state, random)
  tickCompetitors(state, random)
  tickPostLaunch(state, random)
  tickPersonal(state, random)
  tickStudioEvent(state, random)
  tickFranchiseEvent(state, random)
  tickCompetitorEvent(state, random)
  tickWorldEvent(state, random)
  return state
}

export function queueProjectEvent(state, event) {
  state.currentProject.eventIds.push(event.id)
  state.queue.push(asDecision(event, 'project'))
}
