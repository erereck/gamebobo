import { CAMELO_ITEMS } from '../data/content/camelo.js'
import { DECOR, MARKETING, OFFICES, PHASES, PHASE_FOCUS, START_MONEY, TECHS, moneyScale } from '../data/economy.js'
import { EXPOS, projectTypeById } from '../data/modes.js'
import { platformById } from '../data/platforms.js'
import { traitById } from '../data/staff.js'
import { applyEffects, resolveChoice } from './effects.js'
import { eventById, fillText, ideaById } from './events.js'
import { freelaNeed } from './freelas.js'
import { polishMore, projectById, releaseDemo, releaseProject, startFreela, startGameProject } from './project.js'
import { checkAchievements, updateLegacy } from './progress.js'
import { createGame, fx, log, newBrief, scaled, toast, yearFloat } from './state.js'
import { techHypeMultiplier } from './staff.js'
import { tick } from './tick.js'
import { MAIN_TEAM, acquireStudio, createTeam, freeTeams, hasDeskFor, localStaff, moveToTeam, projectOfStaff, projectOfTeam, teamMembers, teamOf } from './teams.js'
import { allowsHiring, allowsPlatform, allowsSize, allowsTeams, allowsType, comboBlocked } from './modes.js'
import { clamp, makeId } from './rng.js'

export const decorCost = (state, item) => scaled(state, item.cost)
export const officeCost = (state, level) => scaled(state, OFFICES[level].cost)
export const trainCost = (state, person) => scaled(state, 1400 + person.level * 450)
export const techCost = (state, tech) => scaled(state, tech.cost)
// Contratar fica mais caro conforme o estúdio cresce.
export const hireFee = (state, candidate) => Math.round(candidate.salary * moneyScale(yearFloat(state)) * (1 + localStaff(state).length * .15))

function popQueue(state) {
  state.queue.shift()
}

function choose(state, index, random) {
  const item = state.queue[0]
  if (!item || item.result) return
  let choice = null
  let ctx = {}
  if (item.kind === 'event') {
    choice = eventById(item.eventId)?.choices?.[index]
    ctx = { projectId: item.ctx?.projectId }
  }
  if (item.kind === 'idea') {
    choice = ideaById(item.ideaId)?.choices?.[index]
    ctx = { projectId: projectOfStaff(state, item.ctx?.staffId)?.id }
  }
  if (!choice) return
  const outcome = resolveChoice(choice, random)
  const chips = applyEffects(state, outcome.effects, ctx)
  item.result = { index, text: fillText(outcome.text, state, item.ctx), chips, win: outcome.win }
  if (item.kind === 'idea' && index === 0) state.stats.ideasAccepted += 1
  if (outcome.win === true) fx(state, { type: 'cheer' })
  if (outcome.win === false) fx(state, { type: 'sigh' })
}

// Confere se a escolha da ficha respeita o modo de carreira e as regras do tipo de projeto.
export function validChoice(state, choice) {
  const type = projectTypeById(choice.type)
  if (!allowsType(state, type.id)) return false
  const platforms = choice.platforms?.length ? choice.platforms : [choice.platform]
  if (!platforms.length || platforms.some(id => !allowsPlatform(state, platformById(id)))) return false
  if (choice.size && !allowsSize(state, choice.size)) return false
  const sources = (choice.sources ?? []).map(id => state.games.find(game => game.id === id))
  if (sources.some(game => !game)) return false
  if (type.source === 'game' || type.source === 'franchise') if (sources.length !== 1) return false
  if (type.source === 'many' && (sources.length < 2 || sources.length > 4)) return false
  if (type.id === 'port' && platforms.includes(sources[0]?.platform)) return false
  const lock = state.mode?.franchise
  if (state.mode?.id === 'franquia' && lock && sources.some(game => game.franchise !== lock.id)) return false
  if (type.id === 'original' && comboBlocked(state, choice.genre, choice.theme)) return false
  const team = choice.teamId ?? MAIN_TEAM
  if (projectOfTeam(state, team) || !teamMembers(state, team).length) return false
  return true
}

export function reducer(current, action, random = Math.random) {
  if (action.type === 'LOAD') return action.state
  if (action.type === 'NEW_GAME') return createGame(action.options, random)
  if (!current) return current
  const state = structuredClone(current)
  state.fx = []

  switch (action.type) {
    case 'TICK':
      return tick(state, random)

    case 'DISMISS_TOAST':
      state.toasts = state.toasts.filter(item => item.id !== action.id)
      return state

    case 'CLOSE':
      popQueue(state)
      return state

    case 'CHOOSE':
      choose(state, action.index, random)
      return state

    case 'SET_FOCUS': {
      const item = state.queue[0]
      const project = projectById(state, item?.projectId)
      if (item?.kind !== 'phase' || !project) return current
      const list = PHASE_FOCUS[PHASES[item.phase].id]
      if (!list.some(focus => focus.id === action.focus)) return current
      project.focus[item.phase] = action.focus
      popQueue(state)
      return state
    }

    case 'RELEASE': {
      const item = state.queue[0]
      if (item?.kind !== 'ready' || !projectById(state, item.projectId)) return current
      popQueue(state)
      releaseProject(state, item.projectId, random)
      if (state.mode?.parent) newBrief(state, random)
      return state
    }

    case 'POLISH_MORE': {
      const item = state.queue[0]
      if (item?.kind !== 'ready' || !projectById(state, item.projectId)) return current
      popQueue(state)
      polishMore(state, item.projectId)
      return state
    }

    case 'START_GAME': {
      if (!validChoice(state, action.choice)) return current
      startGameProject(state, action.choice)
      return state
    }

    case 'START_FREELA': {
      const item = state.freelas.find(freela => freela.id === action.id)
      const team = action.teamId ?? freeTeams(state)[0]?.id
      if (!item || !team || projectOfTeam(state, team)) return current
      startFreela(state, item, freelaNeed(item, yearFloat(state)), team)
      return state
    }

    case 'CANCEL_PROJECT': {
      const project = projectById(state, action.projectId)
      if (!project) return current
      log(state, 'x', `Cancelou ${project.title}`)
      state.projects = state.projects.filter(item => item !== project)
      state.queue = state.queue.filter(item => item.projectId !== project.id)
      for (const person of teamMembers(state, project.teamId, false)) person.mood = clamp(person.mood - 10, 0, 100)
      return state
    }

    case 'SET_PACE': {
      const project = projectById(state, action.projectId)
      if (!project) return current
      project.pace = action.pace
      fx(state, { type: 'pace', pace: action.pace })
      return state
    }

    case 'DEMO': {
      if (!releaseDemo(state, action.projectId)) return current
      return state
    }

    case 'MARKET': {
      const project = projectById(state, action.projectId)
      const channel = MARKETING.find(item => item.id === action.id)
      if (!project || project.kind !== 'game' || !channel) return current
      const cost = scaled(state, channel.cost)
      if (state.money < cost) return current
      state.money -= cost
      let add = channel.hype ?? 0
      let win = null
      if (channel.gamble) {
        win = random() < channel.gamble.chance
        add = win ? channel.gamble.win : channel.gamble.lose
      }
      const meme = state.staff.some(person => traitById(person.trait)?.hype)
      const gained = Math.round(add * (1 - project.hype / 130) * techHypeMultiplier(state.techs) * (meme ? 1.2 : 1))
      project.hype = clamp(project.hype + gained, 0, 100)
      const chips = [{ key: 'money', value: -cost }, { key: 'hype', value: gained }]
      if (channel.fansPct) chips.push(...applyEffects(state, { fansPct: channel.fansPct }))
      toast(state, { kind: win === false ? 'bad' : 'good', icon: channel.icon, title: win === false ? 'Flopou' : win ? 'Viralizou!' : channel.label, chips })
      fx(state, { type: 'hype', amount: gained })
      return state
    }

    case 'EXPO_PICK': {
      const item = state.queue[0]
      if (item?.kind !== 'expo') return current
      const expo = EXPOS.find(entry => entry.id === item.expoId)
      popQueue(state)
      if (!action.targetId || !expo) return state
      const cost = scaled(state, expo.cost)
      if (state.money < cost) return state
      state.money -= cost
      const project = projectById(state, action.targetId)
      const game = state.games.find(entry => entry.id === action.targetId)
      if (project) {
        const gained = Math.round(expo.hype * (1 - project.hype / 130))
        project.hype = clamp(project.hype + gained, 0, 100)
        toast(state, { kind: 'good', icon: 'users', title: `${project.title} no palco`, sub: expo.name, chips: [{ key: 'money', value: -cost }, { key: 'hype', value: gained }] })
        fx(state, { type: 'hype', amount: gained })
      } else if (game?.onMarket) {
        const extra = Math.round((game.copies - game.sold) * (expo.sales - 1) * 2)
        game.copies += extra
        toast(state, { kind: 'good', icon: 'users', title: `${game.title} no palco`, sub: expo.name, chips: [{ key: 'money', value: -cost }, { key: 'copies', value: extra }] })
      }
      applyEffects(state, { fansPct: .02 })
      log(state, 'users', `Levou um jogo para a ${expo.name}`)
      return state
    }

    case 'OPEN_IDEA': {
      const idea = state.ideas.find(item => item.staffId === action.staffId)
      if (!idea) return current
      state.ideas = state.ideas.filter(item => item !== idea)
      state.seenEvents[`idea:${idea.ideaId}`] = 1
      state.queue.unshift({ kind: 'idea', id: makeId('q'), ideaId: idea.ideaId, ctx: { staffId: idea.staffId } })
      return state
    }

    case 'HIRE': {
      const candidate = state.candidates.find(item => item.id === action.id)
      if (!candidate || !allowsHiring(state) || !hasDeskFor(state)) return current
      const fee = hireFee(state, candidate)
      if (state.money < fee) return current
      state.money -= fee
      candidate.hiredAt = state.year
      candidate.team = action.teamId && !state.teams.find(team => team.id === action.teamId)?.remote ? action.teamId : MAIN_TEAM
      state.staff.push(candidate)
      state.candidates = state.candidates.filter(item => item.id !== action.id)
      log(state, 'users', `Contratou ${candidate.name}`)
      fx(state, { type: 'hire', staffId: candidate.id })
      checkAchievements(state)
      return state
    }

    case 'FIRE': {
      const person = state.staff.find(item => item.id === action.id)
      if (!person || person.founder) return current
      state.staff = state.staff.filter(item => item.id !== action.id)
      state.ideas = state.ideas.filter(item => item.staffId !== action.id)
      for (const other of state.staff) other.mood = clamp(other.mood - 6, 0, 100)
      log(state, 'door', `${person.name} saiu`)
      fx(state, { type: 'fire', staffId: person.id })
      return state
    }

    case 'CREATE_TEAM': {
      if (!allowsTeams(state)) return current
      createTeam(state)
      return state
    }

    case 'MOVE_STAFF': {
      if (!moveToTeam(state, action.staffId, action.teamId)) return current
      return state
    }

    case 'ACQUIRE': {
      if (!acquireStudio(state, action.rivalId, random)) return current
      fx(state, { type: 'cheer', big: true })
      checkAchievements(state)
      return state
    }

    case 'TRAIN': {
      const person = state.staff.find(item => item.id === action.id)
      if (!person || person.status !== 'ok') return current
      const cost = trainCost(state, person)
      if (state.money < cost) return current
      state.money -= cost
      person.status = 'treino'
      person.away = 3
      person.trainPillar = action.pillar
      fx(state, { type: 'leave', staffId: person.id })
      return state
    }

    case 'VACATION': {
      const person = state.staff.find(item => item.id === action.id)
      if (!person || person.status !== 'ok') return current
      person.status = 'ferias'
      person.away = 2
      fx(state, { type: 'leave', staffId: person.id })
      return state
    }

    case 'UPGRADE_OFFICE': {
      const next = state.office + 1
      if (!OFFICES[next]) return current
      const cost = officeCost(state, next)
      if (state.money < cost) return current
      state.money -= cost
      state.office = next
      const slots = OFFICES[next].slots
      if (state.decor.length > slots) state.decor.length = slots
      log(state, 'building', `Mudou para ${OFFICES[next].label}`)
      toast(state, { kind: 'great', icon: 'building', title: `Bem-vindo à ${OFFICES[next].label}!` })
      fx(state, { type: 'move' })
      checkAchievements(state)
      return state
    }

    case 'BUY_DECOR': {
      const item = DECOR.find(decor => decor.id === action.id)
      if (!item || state.decor.includes(item.id) || state.decor.length >= OFFICES[state.office].slots) return current
      const cost = decorCost(state, item)
      if (state.money < cost) return current
      state.money -= cost
      state.decor.push(item.id)
      fx(state, { type: 'decor', id: item.id })
      checkAchievements(state)
      return state
    }

    case 'SELL_DECOR': {
      if (!state.decor.includes(action.id)) return current
      state.decor = state.decor.filter(id => id !== action.id)
      fx(state, { type: 'decor', id: action.id })
      return state
    }

    case 'RESEARCH': {
      const tech = TECHS.find(item => item.id === action.id)
      if (!tech || state.techs.includes(tech.id) || tech.year > state.year) return current
      const cost = techCost(state, tech)
      if (state.money < cost || state.rp < tech.rp) return current
      state.money -= cost
      state.rp -= tech.rp
      state.techs.push(tech.id)
      state.stats.researchDone += 1
      toast(state, { kind: 'good', icon: tech.icon, title: tech.label, sub: 'Pesquisa concluída' })
      log(state, 'flask', `Pesquisou ${tech.label}`)
      fx(state, { type: 'cheer' })
      checkAchievements(state)
      return state
    }

    case 'BUY_CAMELO': {
      const visitor = state.visitor
      const item = CAMELO_ITEMS.find(entry => entry.id === action.id)
      if (!visitor || !item || visitor.sold.includes(item.id) || !visitor.items.includes(item.id)) return current
      const cost = scaled(state, item.price)
      if (state.money < cost) return current
      state.money -= cost
      visitor.sold.push(item.id)
      state.stats.cameloDeals += 1
      const outcome = item.gamble ? resolveChoice({ gamble: item.gamble, winText: item.winText, loseText: item.loseText }, random) : { effects: item.effects, text: item.text, win: null }
      const chips = applyEffects(state, outcome.effects)
      visitor.last = { id: item.id, text: outcome.text, win: outcome.win, chips }
      checkAchievements(state)
      return state
    }

    case 'SHOO_VISITOR':
      state.visitor = null
      fx(state, { type: 'visitorLeave' })
      return state

    case 'BANKRUPT': {
      popQueue(state)
      state.stats.bankruptcies += 1
      if (action.choice === 'loan' && !state.usedLoan) {
        const amount = scaled(state, 20000 + state.office * 15000)
        state.money += amount
        state.loan = { monthly: Math.round(amount * 1.35 / 24), months: 24 }
        state.usedLoan = state.year
        state.debtMonths = 0
        toast(state, { kind: 'info', icon: 'cash', title: 'Empréstimo na conta', sub: '24 parcelas' })
      } else {
        state.staff = state.staff.filter(person => person.founder)
        for (const person of state.staff) person.team = MAIN_TEAM
        state.teams = [{ id: MAIN_TEAM, name: 'Equipe principal' }]
        state.office = 0
        state.decor = state.decor.slice(0, OFFICES[0].slots)
        state.projects = []
        state.queue = state.queue.filter(item => !item.projectId)
        state.ideas = []
        state.money = Math.round(START_MONEY * .6 * moneyScale(yearFloat(state)))
        state.fans = Math.round(state.fans * .6)
        state.debtMonths = 0
        state.loan = null
        log(state, 'home', 'Voltou pro quarto')
        toast(state, { kind: 'info', icon: 'home', title: 'De volta ao quarto', sub: 'Recomeço com história' })
        fx(state, { type: 'move' })
      }
      if (state.usedLoan && state.year - state.usedLoan > 10) state.usedLoan = null
      return state
    }

    case 'SET_SETTING':
      state.settings = { ...state.settings, [action.key]: action.value }
      return state

    case 'DEBUG_MONEY':
      state.money += scaled(state, action.amount ?? 50000)
      return state

    default:
      return current
  }
}

export function afterLoad(state) {
  state.fx = []
  state.toasts = []
  state.projects ??= []
  state.teams ??= [{ id: MAIN_TEAM, name: 'Equipe principal' }]
  state.acquired ??= []
  state.goty ??= []
  state.mode ??= { id: 'tradicional', franchise: null, parent: null, brief: null }
  for (const person of state.staff) person.team ??= MAIN_TEAM
  updateLegacy(state)
  return state
}

export { teamOf }
