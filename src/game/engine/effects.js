import { clamp, randomChoice, randomInt } from './utils.js'
import { OFFICES, TEAM_NAMES } from '../data/team.js'
import { TRAITS } from '../data/traits.js'

const addDeltas = (target, deltas = {}) => {
  Object.entries(deltas).forEach(([key, value]) => {
    target[key] = (target[key] ?? 0) + value
  })
}

export function applyEffects(state, effects = {}, context = {}, random = Math.random) {
  if (effects.player) addDeltas(state.player, effects.player)
  if (effects.stat) addDeltas(state.player.stats, effects.stat)
  if (effects.flag) Object.assign(state.player.flags, effects.flag)
  if (effects.studio) addDeltas(state.studio, effects.studio)
  const teamMember = context.personId ? state.studio.team.find(item => item.id === context.personId) : null
  if (teamMember && effects.team) {
    const { salaryRate = 0, ...deltas } = effects.team
    addDeltas(teamMember, deltas)
    if (salaryRate) teamMember.salary = Math.round(teamMember.salary * (1 + salaryRate))
  }
  if (effects.teamAll) {
    const { skillChance = 0, ...deltas } = effects.teamAll
    state.studio.team.forEach(person => {
      addDeltas(person, deltas)
      if (skillChance && random() < skillChance) person.skill += 1
    })
  }
  const competitor = context.studioId ? state.competitors.find(item => item.id === context.studioId) : null
  if (competitor && effects.competitor) {
    competitor.relationScore = clamp((competitor.relationScore ?? 0) + (effects.competitor.relation ?? 0), -100, 100)
    competitor.reputation = clamp(competitor.reputation + (effects.competitor.reputation ?? 0), 0, 100)
    competitor.meetings = (competitor.meetings ?? 0) + 1
    competitor.relation = competitor.relationScore <= -20 ? 'rival' : competitor.relationScore >= 20 ? 'friendly' : 'neutral'
  }
  if (effects.market?.platformShift) {
    const [requestedPlatform, amount] = effects.market.platformShift
    const ranked = Object.entries(state.market.platforms).sort((a, b) => b[1] - a[1]).map(([id]) => id)
    const platform = requestedPlatform === 'leader' ? ranked[0] : requestedPlatform === 'challenger' ? (ranked[1] ?? ranked[0]) : requestedPlatform
    if (platform in state.market.platforms) {
      state.market.platforms[platform] += amount
      const total = Object.values(state.market.platforms).reduce((sum, value) => sum + value, 0)
      Object.keys(state.market.platforms).forEach(id => { state.market.platforms[id] = Math.round(state.market.platforms[id] / total * 100) })
      const difference = 100 - Object.values(state.market.platforms).reduce((sum, value) => sum + value, 0)
      state.market.platforms[platform] += difference
    }
  }
  if (effects.restructure === 'downsize') {
    state.studio.officeLevel = Math.max(0, state.studio.officeLevel - 1)
    const capacity = Math.max(0, OFFICES[state.studio.officeLevel].capacity - 1)
    state.studio.team = [...state.studio.team].sort((a, b) => b.loyalty - a.loyalty).slice(0, capacity)
  }
  if (effects.restructure === 'restart') {
    state.currentProject = null
    state.currentContract = null
    state.studio.officeLevel = 0
    state.studio.team = []
    state.studio.debt = []
    state.studio.equity = 0
    state.studio.monthlyBurn = 0
    state.player.money = 15000
  }
  if (effects.succession) applySuccession(state, effects, random)

  if (effects.license && context.licenseId) {
    const contract = state.licenses?.active?.find(item => item.licenseId === context.licenseId)
    if (contract) {
      contract.trust = clamp(contract.trust + (effects.license.trust ?? 0), 0, 100)
      contract.breaches = Math.max(0, contract.breaches + (effects.license.breach ?? 0))
    }
    if (effects.license.otherTrust && state.currentProject?.licenseIds?.length > 1) {
      const otherId = state.currentProject.licenseIds.find(id => id !== context.licenseId)
      const other = state.licenses.active.find(item => item.licenseId === otherId)
      if (other) other.trust = clamp(other.trust + effects.license.otherTrust, 0, 100)
    }
  }

  const project = state.currentProject
  if (project && effects.project) {
    const { qualityRandom, cost = 0, months = 0, ...deltas } = effects.project
    addDeltas(project, deltas)
    if (months) project.totalMonths += months
    if (qualityRandom) project.quality += randomInt(qualityRandom[0], qualityRandom[1], random)
    if (cost) {
      project.costSpent += cost
      state.player.money -= cost
    }
  }
  if (project && effects.story) project.story = effects.story
  if (project) {
    project.progress = Math.max(0, project.progress)
    project.pressure = clamp(project.pressure, 0, 100)
  }

  const game = context.gameId ? state.games.find(item => item.id === context.gameId) : null
  if (game && effects.game) {
    const salesDelta = Math.round(game.initialSales * (effects.game.salesRate ?? 0))
    const directRevenue = Math.round(game.initialRevenue * (effects.game.revenueRate ?? 0))
    const salesRevenue = Math.round(salesDelta * game.price * game.royalty)
    const followerDelta = Math.round(game.initialFollowers * (effects.game.followerRate ?? 0))
    game.sales = Math.max(0, game.sales + salesDelta)
    game.revenue = Math.max(0, game.revenue + salesRevenue + directRevenue)
    game.trust = clamp((game.trust ?? 50) + (effects.game.trust ?? 0), 0, 100)
    game.supportEvents = [...(game.supportEvents ?? []), context.eventId].filter(Boolean)
    state.player.money += salesRevenue + directRevenue
    state.player.followers = Math.max(0, state.player.followers + followerDelta)
    if (effects.game.extendSupport) {
      const release = state.activeReleases.find(item => item.gameId === game.id)
      if (release) release.monthsLeft += effects.game.extendSupport
    }
  }

  if (effects.audience) {
    const { genre = 0, platform = 0, ...segments } = effects.audience
    addDeltas(state.player.audience, segments)
    if (game && genre) state.player.audience.genres[game.genre] += genre
    if (game && platform) state.player.audience.platforms[game.platform] += platform
  }

  state.player.money = Math.round(state.player.money)
  state.player.energy = clamp(Math.round(state.player.energy), 0, 100)
  state.player.stress = clamp(Math.round(state.player.stress), 0, 100)
  state.player.followers = Math.max(0, Math.round(state.player.followers))
  state.player.reputation = clamp(Math.round(state.player.reputation), 0, 100)
  state.player.relationship = clamp(Math.round(state.player.relationship), 0, 100)
  state.player.health = clamp(Math.round(state.player.health), 0, 100)
  state.studio.morale = clamp(Math.round(state.studio.morale), 0, 100)
  state.studio.research = Math.max(0, Math.round(state.studio.research))
  state.studio.team.forEach(person => {
    person.skill = clamp(Math.round(person.skill), 1, 99)
    person.energy = clamp(Math.round(person.energy), 0, 100)
    person.morale = clamp(Math.round(person.morale), 0, 100)
    person.loyalty = clamp(Math.round(person.loyalty), 0, 100)
  })
  state.player.audience.hardcore = Math.max(0, Math.round(state.player.audience.hardcore))
  state.player.audience.casual = Math.max(0, Math.round(state.player.audience.casual))
  state.player.audience.nostalgic = Math.max(0, Math.round(state.player.audience.nostalgic))
  state.player.audience.trust = clamp(Math.round(state.player.audience.trust), 0, 100)
  return state
}

function applySuccession(state, effects, random) {
  if (effects.succession === 'continue') {
    state.player.flags.successionDeferredUntil = state.player.age + 10
    return
  }
  const oldName = state.player.name
  const oldLeader = state.studio.leaders.at(-1)
  if (oldLeader && oldLeader.to == null) oldLeader.to = state.date.year
  const person = effects.succession === 'team' && effects.successorId
    ? state.studio.team.find(item => item.id === effects.successorId)
    : null
  const roleStats = { programmer: 'programming', artist: 'art', designer: 'design', producer: 'charisma', marketer: 'marketing', writer: 'design' }
  const inheritedStats = Object.fromEntries(Object.entries(state.player.stats).map(([id, value]) => [id, clamp(Math.round(value * 0.62 + randomInt(10, 24, random)), 20, 88)]))
  if (person) inheritedStats[roleStats[person.roleId]] = clamp(person.skill, 35, 94)
  state.player.name = person?.name ?? `${randomChoice(TEAM_NAMES, random)} ${oldName.split(' ').at(-1)}`
  state.player.age = person ? clamp(22 + Math.floor(person.months / 12), 24, 58) : randomInt(23, 32, random)
  state.player.generation = (state.player.generation ?? 1) + 1
  state.player.stats = inheritedStats
  state.player.traitId = randomChoice(TRAITS, random).id
  state.player.energy = 92
  state.player.stress = 14
  state.player.health = 96
  state.player.relationship = 55
  delete state.player.flags.successionDeferredUntil
  if (person) state.studio.team = state.studio.team.filter(item => item.id !== person.id)
  state.studio.leaders.push({
    name: state.player.name,
    generation: state.player.generation,
    from: state.date.year,
    to: null,
    legacy: person ? 'Promovido da equipe' : 'Nova geração',
  })
}
