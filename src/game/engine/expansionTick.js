import { GAME_EVENTS, attendedEventKey, eventExistsInYear, eventsThisMonth } from '../data/gameEvents.js'
import { INDUSTRY_SHOCKS } from '../data/industryShocks.js'
import { clamp, makeId } from './utils.js'
import { addHistory, dateLabel } from './world.js'

const absoluteMonth = (year, month) => year * 12 + month

function remainingShockMonths(shock, date) {
  const elapsed = absoluteMonth(date.year, date.month) - absoluteMonth(shock.start[0], shock.start[1])
  return elapsed >= 0 && elapsed < shock.duration ? shock.duration - elapsed : 0
}

export function showcaseTargets(state) {
  const active = [state.currentProject, ...(state.parallelProjects ?? [])].filter(Boolean).map(project => ({
    id: project.id,
    kind: 'project',
    title: project.title,
    meta: `${Math.min(100, Math.round(project.progress / project.totalMonths * 100))}% em produção${project.announced ? ' · anunciado' : ''}`,
  }))
  const released = state.games.filter(game => {
    const year = Number(game.released?.split(' ')[1])
    return year === state.date.year || year === state.date.year - 1
  }).map(game => ({ id: game.id, kind: 'game', title: game.title, meta: `lançado em ${game.released} · nota ${game.score}` }))
  return [...active, ...released]
}

export function tickExpansion(state) {
  state.world.activeIndustryEffects ??= []
  state.world.seenIndustryShocks ??= []
  state.world.seenGameEventCards ??= []

  state.world.activeIndustryEffects = state.world.activeIndustryEffects
    .map(effect => ({ ...effect, monthsLeft: effect.monthsLeft - 1 }))
    .filter(effect => effect.monthsLeft > 0)

  INDUSTRY_SHOCKS.forEach(shock => {
    if (state.world.seenIndustryShocks.includes(shock.id)) return
    const monthsLeft = remainingShockMonths(shock, state.date)
    if (!monthsLeft) return
    state.world.seenIndustryShocks.push(shock.id)
    state.world.activeIndustryEffects.push({ id: shock.id, title: shock.title, tag: shock.tag, modifiers: shock.modifiers, monthsLeft })
    state.world.industryNews.unshift({ id: makeId('shock-news'), year: state.date.year, title: shock.title, body: shock.body, company: 'Mercado', historical: true })
    state.queue.push({
      id: makeId('industry-shock'), kind: 'info', tag: shock.tag, title: shock.title, body: shock.body,
      details: [`EFEITO POR ${monthsLeft} MESES`, 'MUDA DEMANDA', 'AFETA GÊNEROS / HARDWARE'],
    })
    addHistory(state, shock.title, shock.body, { highlight: true, kind: 'industry' })
  })

  eventsThisMonth(state).filter(event => event.featured).forEach(event => {
    const key = attendedEventKey(event, state.date.year)
    if (state.world.seenGameEventCards.includes(key) || state.world.attendedEvents?.includes(key)) return
    state.world.seenGameEventCards.push(key)
    state.queue.push({
      id: makeId('showcase'), kind: 'showcase', eventId: event.id, eventKey: key,
      tag: `${event.tier} · ${event.name.toUpperCase()}`, title: `${event.name} abriu espaço na agenda.`,
      body: event.copy,
    })
  })
}

export function attendShowcase(state, eventId, targetId) {
  const event = GAME_EVENTS.find(item => item.id === eventId)
  if (!event || !eventExistsInYear(event, state.date.year) || !event.months.includes(state.date.month)) return null
  if (state.player.reputation < event.minReputation || state.player.money < event.cost || state.player.energy < 8) return null
  const key = attendedEventKey(event, state.date.year)
  if (state.world.attendedEvents?.includes(key)) return null
  const project = [state.currentProject, ...(state.parallelProjects ?? [])].find(item => item?.id === targetId)
  const game = state.games.find(item => item.id === targetId)
  // Feiras locais e encontros de indústria continuam úteis antes do primeiro jogo.
  // Palcos destacados, por outro lado, só fazem sentido quando há algo para divulgar.
  if (event.featured && !project && !game) return null

  state.player.money -= event.cost
  state.player.energy = clamp(state.player.energy - 8, 0, 100)
  state.player.stress = clamp(state.player.stress + 4, 0, 100)
  state.player.followers += event.followers
  state.player.reputation = clamp(state.player.reputation + event.reputation, 0, 100)
  state.studio.research += event.research
  state.world.attendedEvents ??= []
  state.world.attendedEvents.push(key)

  if (project) {
    project.hype += event.hype
    project.reach += event.hype / 100
    project.pressure += Math.max(1, Math.round(event.hype / 3))
    if (!project.announced) {
      project.announced = true
      project.announcementDate = dateLabel(state.date)
    }
  } else if (game) {
    const tailSales = Math.max(100, Math.round((game.initialSales ?? game.sales) * (0.02 + event.hype / 150)))
    const tailRevenue = Math.round(tailSales * (game.price ?? 30) * (game.royalty ?? .15))
    game.sales += tailSales
    game.revenue += tailRevenue
    game.showcaseBoosts ??= []
    game.showcaseBoosts.push({ eventId, year: state.date.year, sales: tailSales })
    state.player.money += tailRevenue
    state.player.followers += Math.round(tailSales * .04)
  }

  const subject = project?.title ?? game?.title
  addHistory(
    state,
    subject ? `${event.name}: ${subject}` : `Presença na ${event.name}`,
    project ? `O projeto ganhou ${event.hype} de hype no palco.` : game ? 'Um jogo já lançado voltou para a vitrine.' : 'Contatos, pesquisa e presença de mercado sem um anúncio específico.',
    { highlight: event.tier !== 'LOCAL', kind: 'event' },
  )
  return { event, target: project ?? game ?? null }
}
