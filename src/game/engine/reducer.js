import { PROJECT_EVENTS } from '../data/projectEvents.js'
import { GENRES, PLATFORMS, SCALES, STATS, labelOf } from '../data/catalog.js'
import { EQUIPMENT, TRAITS } from '../data/traits.js'
import { CULTURES, OFFICES } from '../data/team.js'
import { applyEffects } from './effects.js'
import { calculateRelease } from './scoring.js'
import { createInitialState } from './state.js'
import { addHistory, advanceDate, dateLabel, queueProjectEvent, tickWorld } from './world.js'
import { clamp, clone, makeId, randomChoice, randomInt } from './utils.js'
import { acceptContract, acceptPublisher, createPublisherOfferForProject, generateOpportunities, takeLoan, workContractMonth } from './business.js'
import { changeOffice, fireTeamMember, hireCandidate, refreshCandidates, researchTech, tickStudio } from './studio.js'
import { processAwards } from './awards.js'
import { discoverHybridGenre } from './innovation.js'
import { TECHS, getEra } from '../data/eras.js'
import { DEBT_CRISIS } from '../data/debtCrisis.js'
import { platformAtDate } from '../data/platformHistory.js'
import { acceptLicenseOffer, importLicensePack, licenseFromState, maybeQueueLicenseEvent, recordLicensedRelease, renewLicense, requestLicense, placeLicenseBid, tickLicensing } from './licensing.js'
import { attachCommissionToProject, minimumScaleMet, pitchCompany, recordCorporateRelease, requestPartnership, resolveCorporateRelease, respondCorporateOffer, tickCorporate } from './corporate.js'
import { launchPlanMechanics, marketingForYear } from '../data/marketingEras.js'
import { createCreatorCoverage } from '../data/creatorCoverage.js'
import { GAME_EVENTS, attendedEventKey, eventExistsInYear } from '../data/gameEvents.js'

function franchiseExpectation(state, franchiseId) {
  const games = state.games.filter(game => game.franchiseId === franchiseId)
  if (!games.length) return 0
  const recent = games.slice(0, 3)
  return Math.round(recent.reduce((sum, game) => sum + game.score, 0) / recent.length)
}

function startProject(state, payload) {
  if (state.currentProject || state.currentContract) return state
  const scale = SCALES[payload.scale]
  if (!scale) return state
  const platform = PLATFORMS.find(item => item.id === payload.platform)
  if (!platform || !platformAtDate(platform, state.date)) return state
  if ((scale.officeLevel ?? 0) > state.studio.officeLevel || (scale.teamSize ?? 0) > state.studio.team.length) return state
  const era = getEra(state.date.year)
  const estimatedCost = Math.round(scale.cost * era.costMultiplier * (1 + state.studio.team.length * 0.08))
  if (state.player.money < estimatedCost * 0.25) return state
  const trait = TRAITS.find(item => item.id === state.player.traitId)
  const culture = CULTURES.find(item => item.id === state.studio.cultureId)
  const franchise = payload.franchiseId ? state.games.find(game => game.franchiseId === payload.franchiseId) : null
  const franchiseId = payload.franchiseId || makeId('franchise')
  const licenseIds = [...new Set(payload.licenseIds ?? [])].filter(Boolean)
  if (licenseIds.length > 2) return state
  const licenseContracts = licenseIds.map(id => state.licenses.active.find(item => item.licenseId === id))
  if (licenseContracts.some(item => !item)) return state
  if (licenseIds.length === 2 && licenseContracts.some(item => item.clauses.includes('noCrossover'))) return state
  const commission = state.corporate.activeCommission
  if (commission && (!licenseIds.includes(commission.licenseId) || payload.genre !== commission.genre || !minimumScaleMet(payload.scale, 'small'))) return state
  state.currentProject = {
    id: makeId('project'),
    title: payload.title.trim(),
    genre: payload.genre,
    theme: payload.theme,
    focus: payload.focus,
    platform: payload.platform,
    scale: payload.scale,
    franchiseId,
    franchiseName: franchise?.franchiseName ?? payload.title.trim(),
    isSequel: Boolean(franchise),
    sequelNumber: franchise ? state.games.filter(game => game.franchiseId === franchiseId).length + 1 : 1,
    expectation: franchiseExpectation(state, franchiseId),
    started: dateLabel(state.date),
    progress: 0,
    totalMonths: scale.months + (trait?.modifiers.projectMonths ?? 0) + (culture?.modifiers.months ?? 0) - Math.min(3, Math.floor(state.studio.team.length / 5)),
    estimatedCost,
    costSpent: 0,
    quality: 0,
    innovation: 0,
    reach: state.corporate.partnerships.reduce((sum, item) => sum + item.reach, 0),
    pressure: 8,
    hype: franchise ? Math.round(franchiseExpectation(state, franchiseId) / 5) : 0,
    announced: false,
    announcementDate: null,
    launchPlan: 'shadow',
    launchSpend: 0,
    launchPlansUsed: [],
    publisher: null,
    directSales: 0,
    directMargin: 0,
    eventIds: [],
    story: null,
    licenseIds,
    licenseNames: licenseIds.map(id => licenseFromState(state, id)?.name).filter(Boolean),
    licenseRoyalty: licenseContracts.reduce((sum, item) => sum + item.royalty, 0),
    licenseEventIds: [],
  }
  if (commission) attachCommissionToProject(state, state.currentProject)
  state.player.career.projectsStarted += 1
  addHistory(state, `Começou ${state.currentProject.title}`, `${labelOf(state.world.knownGenres, state.currentProject.genre)} para ${PLATFORMS.find(item => item.id === payload.platform)?.label}.`, { highlight: true, kind: 'project' })
  return state
}

function releaseProject(state, random) {
  const project = state.currentProject
  const result = calculateRelease(state, project, random)
  const game = {
    ...project,
    ...result,
    revenue: result.revenue + (project.directSales ?? 0),
    id: makeId('game'),
    released: dateLabel(state.date),
    trust: project.expectation && result.score < project.expectation - 10 ? 42 : 50,
    supportEvents: [],
  }
  state.games.unshift(game)
  state.currentProject = null
  state.player.money += result.revenue
  state.player.followers += game.newFollowers
  state.player.reputation = clamp(state.player.reputation + Math.round((game.score - state.player.reputation) / 10), 0, 100)
  state.studio.reputation = clamp(state.studio.reputation + Math.round((game.score - state.studio.reputation) / 9), 0, 100)
  state.player.audience.trust = clamp(state.player.audience.trust + Math.round((game.score - 65) / 9) - (project.expectation && game.score < project.expectation - 10 ? 4 : 0), 0, 100)
  state.player.audience.hardcore += Math.round(game.newFollowers * (game.score >= 78 ? 0.42 : 0.2))
  state.player.audience.casual += Math.round(game.newFollowers * (game.score >= 78 ? 0.58 : 0.8))
  state.player.audience.genres[game.genre] = (state.player.audience.genres[game.genre] ?? 0) + game.newFollowers
  state.player.audience.platforms[game.platform] = (state.player.audience.platforms[game.platform] ?? 0) + game.newFollowers
  const supportTech = state.studio.unlockedTechs.reduce((sum, techId) => sum + (TECHS.find(item => item.id === techId)?.bonus.support ?? 0), 0)
  state.activeReleases.push({ gameId: game.id, monthsLeft: (game.score >= 82 ? 8 : 5) + supportTech, age: 0, eventIds: [] })
  state.studio.team.forEach(person => { person.projects = Math.floor(person.projects) + 1 })
  recordLicensedRelease(state, game)
  recordCorporateRelease(state, game)
  resolveCorporateRelease(state, game)
  const hybrid = discoverHybridGenre(state, game, random)
  if (hybrid) {
    game.createdGenre = hybrid.id
    state.queue.push({ id: makeId('genre'), kind: 'info', tag: 'UM GÊNERO NASCEU', title: hybrid.name, body: `A imprensa começou a usar esse nome ao falar de ${game.title}. ${hybrid.description}`, details: ['CRIADO POR VOCÊ', `${state.date.year}`, 'OUTROS ESTÚDIOS VÃO COPIAR'] })
    addHistory(state, `Nasceu o gênero ${hybrid.name}`, `${game.title} virou a primeira referência.`, { highlight: true, kind: 'legacy' })
  }
  state.queue.unshift({ id: makeId('release'), kind: 'release', gameId: game.id })
  if (project.launchPlan === 'creator' && state.date.year >= 2012) state.queue.splice(1, 0, createCreatorCoverage(game, random))
  addHistory(state, `${game.title} saiu com nota ${game.score}`, `${game.sales.toLocaleString('pt-BR')} cópias no primeiro mês.`, { highlight: true, kind: 'release' })
}

function processYearEnd(state, random) {
  if (state.date.month !== 0) return
  const year = state.date.year - 1
  const awards = processAwards(state, year, random)
  if (!awards?.length) return
  awards.filter(item => item.won).forEach(result => {
    state.player.reputation += result.categoryId === 'goty' ? 9 : 4
    state.studio.reputation += result.categoryId === 'goty' ? 8 : 3
    state.studio.team.forEach(person => {
      person.morale = clamp(person.morale + 5, 0, 100)
      person.awards = (person.awards ?? 0) + 1
    })
  })
  state.queue.push({ id: makeId('awards'), kind: 'awards', year, results: awards })
}

function monthAction(state, payload, random) {
  if (state.queue.length) return state
  const project = state.currentProject
  const culture = CULTURES.find(item => item.id === state.studio.cultureId)
  let workedOnProject = false

  if (payload.action === 'develop' && project) {
    const scale = SCALES[project.scale]
    const trait = TRAITS.find(item => item.id === state.player.traitId)
    const monthlyCost = Math.round(project.estimatedCost / scale.months)
    const extraProgress = (trait?.modifiers.progressChance && random() < trait.modifiers.progressChance ? 0.35 : 0) + (culture?.modifiers.progress ?? 0) + state.studio.team.length * 0.08
    const healthPace = 0.75 + state.player.health / 400
    project.progress += (1 + extraProgress) * healthPace
    project.costSpent += monthlyCost
    project.quality += randomInt(1, 4, random)
    project.innovation += project.focus === 'innovation' ? randomInt(1, 3, random) : random() < 0.18 ? 1 : 0
    project.pressure += randomInt(6, 11, random) + (project.publisher?.pressure ?? 0) * 0.08
    state.player.money -= monthlyCost
    state.player.energy -= randomInt(10, 16, random)
    state.player.stress += randomInt(5, 9, random) + (trait?.modifiers.stressPerDevelop ?? 0) + (culture?.modifiers.stress ?? 0)
    state.studio.research += 1 + Math.floor(state.studio.team.length / 3)
    state.player.career.monthsWorked += 1
    workedOnProject = true
    addHistory(state, `Mais um mês em ${project.title}`, `${Math.min(100, Math.round(project.progress / project.totalMonths * 100))}% concluído.`, { kind: 'project' })
  } else if (payload.action === 'promote' && project && project.announced) {
    const cost = 1200 + SCALES[project.scale].cost * 0.06
    const gain = randomInt(5, 11, random) + Math.round(state.player.stats.marketing / 18)
    state.player.money -= cost
    project.costSpent += cost
    state.player.energy -= 5
    project.hype += gain
    project.pressure += 3
    addHistory(state, `Campanha de ${project.title}`, `Hype subiu ${gain} pontos.`, { kind: 'marketing' })
  } else if (payload.action === 'contract' && state.currentContract) {
    const completed = workContractMonth(state)
    addHistory(state, completed ? `Contrato entregue: ${completed.title}` : `Trabalho para ${state.currentContract.client}`, completed ? `${completed.pay.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} recebidos.` : 'Mais um mês faturável.', { highlight: Boolean(completed), kind: 'contract' })
  } else if (payload.action === 'work') {
    const income = randomInt(2800, 3900, random) * (1 + Math.floor(state.player.reputation / 25) * 0.2)
    state.player.money += income
    state.player.energy -= project ? 19 : 14
    state.player.stress += project ? 9 : 5
    if (project) project.pressure += 7
    addHistory(state, 'Freelance pago', `${Math.round(income).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} entrou no caixa.`, { kind: 'work' })
  } else if (payload.action === 'study') {
    const stat = payload.stat ?? randomChoice(Object.keys(state.player.stats), random)
    const gain = randomInt(3, 6, random)
    state.player.money -= 900
    state.player.energy -= 6
    state.player.stats[stat] = clamp(state.player.stats[stat] + gain, 0, 99)
    state.studio.research += 3
    addHistory(state, 'Um mês de curso', `${gain} pontos a mais em ${labelOf(STATS, stat).toLowerCase()}.`, { kind: 'study' })
  } else if (payload.action === 'research') {
    const gain = randomInt(7, 12, random) + state.studio.team.length
    state.studio.research += gain
    state.player.money -= 1800
    state.player.energy -= 8
    addHistory(state, 'Pesquisa interna', `${gain} pontos de pesquisa registrados.`, { kind: 'research' })
  } else if (payload.action === 'rest') {
    const energy = randomInt(30, 44, random)
    state.player.energy += energy
    state.player.stress -= randomInt(18, 28, random)
    state.player.relationship += 2
    state.player.health += 3
    if (project) project.pressure = Math.max(0, project.pressure - 16)
    addHistory(state, 'Um mês mais quieto', `Energia recuperada: ${energy}.`, { kind: 'personal' })
  } else {
    return state
  }

  if (state.player.stress > 78) state.player.health -= randomInt(2, 6, random)
  state.player.energy = clamp(state.player.energy, 0, 100)
  state.player.stress = clamp(state.player.stress, 0, 100)
  state.player.health = clamp(state.player.health, 0, 100)
  advanceDate(state)
  tickStudio(state, workedOnProject, random)

  const finished = state.currentProject && state.currentProject.progress >= state.currentProject.totalMonths
  if (finished) releaseProject(state, random)
  generateOpportunities(state, random)
  processYearEnd(state, random)
  tickWorld(state, random)
  tickLicensing(state, random)
  tickCorporate(state, random)

  if (!finished && state.currentProject && !state.queue.some(item => item.kind === 'decision') && state.currentProject.eventIds.length < 4 && random() < 0.48) {
    const candidates = PROJECT_EVENTS.filter(event => state.date.year >= (event.fromYear ?? 1980) && state.date.year <= (event.toYear ?? 9999) && !state.currentProject.eventIds.includes(event.id))
    if (candidates.length) queueProjectEvent(state, randomChoice(candidates, random))
  }
  if (!finished) maybeQueueLicenseEvent(state, random)
  if (state.player.money < -100000 && !state.player.flags.deepDebtWarning) {
    state.player.flags.deepDebtWarning = true
    state.queue.push({ id: makeId('debt'), kind: 'decision', source: 'business', eventId: DEBT_CRISIS.id, tag: DEBT_CRISIS.tag, title: DEBT_CRISIS.title, body: DEBT_CRISIS.body, choices: DEBT_CRISIS.choices, context: {} })
  }
  return state
}

function resolveDecision(state, choiceId, random) {
  const decision = state.queue[0]
  if (!decision || decision.kind !== 'decision') return state
  const choice = decision.choices.find(item => item.id === choiceId)
  if (!choice) return state
  applyEffects(state, choice.effects, { ...decision.context, eventId: decision.eventId }, random)
  addHistory(state, decision.title, `${choice.label}. ${choice.outcome}`, { highlight: true, kind: decision.source })
  state.player.career.crisesSurvived += 1
  state.queue.shift()
  return state
}

function upgradeEquipment(state) {
  const next = EQUIPMENT[state.player.equipmentLevel + 1]
  if (!next || state.date.year < next.unlockYear || state.player.money < next.cost) return
  state.player.money -= next.cost
  state.player.equipmentLevel = next.level
  addHistory(state, `Comprou ${next.name}`, next.description, { highlight: true, kind: 'studio' })
}

function announceProject(state) {
  const project = state.currentProject
  if (!project || project.announced) return
  project.announced = true
  project.announcementDate = dateLabel(state.date)
  project.hype += 8 + Math.round(state.player.followers / 2000) + Math.round(state.player.stats.marketing / 14)
  project.pressure += 9
  const marketing = marketingForYear(state.date.year)
  addHistory(state, `${project.title} foi apresentado a ${marketing.publicWord}`, `${project.hype} pontos de hype. Agora existe uma cobrança pública.`, { highlight: true, kind: 'marketing' })
}

function setLaunchPlan(state, plan) {
  const project = state.currentProject
  if (!project) return
  const marketing = marketingForYear(state.date.year)
  const costs = Object.fromEntries(Object.entries(launchPlanMechanics).filter(([id]) => marketing.plans[id]).map(([id, plan]) => [id, plan.cost]))
  if (!(plan in costs) || project.launchPlan === plan) return
  const extraCost = Math.max(0, costs[plan] - (project.launchSpend ?? 0))
  if (state.player.money < extraCost) return
  state.player.money -= extraCost
  project.costSpent += extraCost
  project.launchSpend = Math.max(project.launchSpend ?? 0, costs[plan])
  project.launchPlansUsed ??= []
  project.launchPlan = plan
  if (!project.launchPlansUsed.includes(plan)) {
    if (plan === 'campaign') project.hype += 14
    if (plan === 'creator') {
      project.hype += 8
      project.reach += .18
      project.pressure += 5
      addHistory(state, `Criador reservado para ${project.title}`, 'A transmissão está paga. A opinião continua fora do seu controle.', { highlight: true, kind: 'marketing' })
    }
    if (plan === 'early') {
      const presales = Math.max(400, Math.round((state.player.followers + project.hype * 35) * SCALES[project.scale].price * 0.08))
      project.quality -= 4
      project.reach += 0.08
      project.directSales += presales
      state.player.money += presales
      addHistory(state, `Acesso antecipado de ${project.title}`, `${presales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} entraram antes do lançamento.`, { highlight: true, kind: 'business' })
    }
    project.launchPlansUsed.push(plan)
  }
}

function attendGameEvent(state, eventId) {
  const event = GAME_EVENTS.find(item => item.id === eventId)
  const key = event && attendedEventKey(event, state.date.year)
  state.world.attendedEvents ??= []
  if (!event || !eventExistsInYear(event, state.date.year) || !event.months.includes(state.date.month) || state.world.attendedEvents.includes(key)) return
  if (state.player.reputation < event.minReputation || state.player.money < event.cost || state.player.energy < 8) return
  state.player.money -= event.cost
  state.player.energy = clamp(state.player.energy - 8, 0, 100)
  state.player.stress = clamp(state.player.stress + 4, 0, 100)
  state.player.followers += event.followers
  state.player.reputation = clamp(state.player.reputation + event.reputation, 0, 100)
  state.studio.research += event.research
  if (state.currentProject) {
    state.currentProject.hype += event.hype
    state.currentProject.pressure += Math.max(1, Math.round(event.hype / 3))
  }
  state.world.attendedEvents.push(key)
  addHistory(state, `Estande na ${event.name}`, `${event.followers.toLocaleString('pt-BR')} pessoas novas acompanharam o estúdio${state.currentProject ? `; ${state.currentProject.title} ganhou ${event.hype} de hype` : ''}.`, { highlight: event.tier !== 'LOCAL', kind: 'event' })
}

export function reduceGame(currentState, action, random = Math.random) {
  if (action.type === 'RESET_CAREER') return createInitialState(action.options ?? { startYear: action.startYear }, random)
  if (!currentState) return currentState
  const state = clone(currentState)
  if (action.type === 'START_PROJECT') startProject(state, action.payload)
  if (action.type === 'MONTH_ACTION') monthAction(state, action.payload, random)
  if (action.type === 'RESOLVE_DECISION') resolveDecision(state, action.choiceId, random)
  if (action.type === 'ACK_QUEUE') state.queue.shift()
  if (action.type === 'UPGRADE_EQUIPMENT') upgradeEquipment(state)
  if (action.type === 'ANNOUNCE_PROJECT') announceProject(state)
  if (action.type === 'SET_LAUNCH_PLAN') setLaunchPlan(state, action.plan)
  if (action.type === 'ATTEND_GAME_EVENT') attendGameEvent(state, action.eventId)
  if (action.type === 'RENAME_PROJECT' && state.currentProject) {
    const title = String(action.title ?? '').trim().slice(0, 56)
    if (title && title !== state.currentProject.title) {
      const previous = state.currentProject.title
      state.currentProject.title = title
      if (!state.currentProject.isSequel) state.currentProject.franchiseName = title
      addHistory(state, `${previous} virou ${title}`, 'O nome mudou na capa do projeto. O resto do trabalho continua igual.', { highlight: true, kind: 'project' })
    }
  }
  if (action.type === 'REFRESH_CANDIDATES') { state.player.money -= 500; refreshCandidates(state, random) }
  if (action.type === 'HIRE_CANDIDATE') {
    const person = hireCandidate(state, action.candidateId)
    if (person) addHistory(state, `${person.name} entrou no estúdio`, `Salário mensal: ${person.salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}.`, { highlight: true, kind: 'studio' })
  }
  if (action.type === 'FIRE_MEMBER') {
    const person = fireTeamMember(state, action.personId)
    if (person) addHistory(state, `${person.name} saiu do estúdio`, 'O acerto custou um salário.', { highlight: true, kind: 'studio' })
  }
  if (action.type === 'MOVE_OFFICE') {
    const office = changeOffice(state)
    if (office) addHistory(state, `Mudança para ${office.name}`, `Capacidade para ${office.capacity} pessoas.`, { highlight: true, kind: 'studio' })
  }
  if (action.type === 'CHANGE_CULTURE' && !state.studio.cultureLockMonths && CULTURES.some(item => item.id === action.cultureId)) {
    state.studio.cultureId = action.cultureId
    state.studio.cultureLockMonths = 3
    addHistory(state, `Novo acordo de trabalho: ${CULTURES.find(item => item.id === action.cultureId).name}`, 'A equipe vai testar esse ritmo pelos próximos meses.', { highlight: true, kind: 'studio' })
  }
  if (action.type === 'RESEARCH_TECH') {
    const tech = researchTech(state, action.techId)
    if (tech) addHistory(state, `Pesquisa concluída: ${tech.name}`, tech.description, { highlight: true, kind: 'research' })
  }
  if (action.type === 'ACCEPT_CONTRACT') {
    const contract = acceptContract(state, action.contractId)
    if (contract) addHistory(state, `Contrato com ${contract.client}`, contract.title, { highlight: true, kind: 'contract' })
  }
  if (action.type === 'REQUEST_PUBLISHER') {
    const offer = createPublisherOfferForProject(state, random)
    if (offer) state.opportunities.publisherOffers = [offer]
  }
  if (action.type === 'ACCEPT_PUBLISHER') {
    const offer = acceptPublisher(state, action.offerId)
    if (offer) addHistory(state, `${offer.name} vai publicar o jogo`, `Adiantamento de ${offer.advance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}.`, { highlight: true, kind: 'business' })
  }
  if (action.type === 'TAKE_LOAN') {
    const loan = takeLoan(state, action.loanId)
    if (loan) addHistory(state, `Crédito contratado: ${loan.name}`, `${loan.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} entrou no caixa.`, { highlight: true, kind: 'business' })
  }
  if (action.type === 'REQUEST_LICENSE') requestLicense(state, action.licenseId, random)
  if (action.type === 'ACCEPT_LICENSE_OFFER') acceptLicenseOffer(state, action.offerId)
  if (action.type === 'RENEW_LICENSE') renewLicense(state, action.contractId, random)
  if (action.type === 'PLACE_LICENSE_BID') placeLicenseBid(state, action.auctionId, action.amount)
  if (action.type === 'IMPORT_LICENSE_PACK') importLicensePack(state, action.pack)
  if (action.type === 'PITCH_COMPANY') pitchCompany(state, action.companyId, random)
  if (action.type === 'REQUEST_PARTNERSHIP') requestPartnership(state, action.companyId, random)
  if (action.type === 'RESPOND_CORPORATE_OFFER') respondCorporateOffer(state, action.offerId, action.response, random)
  if (action.type === 'TOGGLE_SOUND') state.settings.sound = !state.settings.sound
  if (action.type === 'SET_CURRENCY' && ['BRL', 'USD', 'EUR'].includes(action.currency)) state.settings.currency = action.currency
  if (action.type === 'SET_TIMELINE_NOTICES') {
    state.settings.timelineNotices = Boolean(action.enabled)
    if (!state.settings.timelineNotices) state.queue = state.queue.filter(item => !item.timelineNotice)
  }
  state.meta.version = currentState.meta.version
  return state
}
