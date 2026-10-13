import { CAMELO_ITEMS } from '../data/content/camelo.js'
import { DECOR, MARKETING, OFFICES, PHASES, PHASE_FOCUS, START_MONEY, TECHS, moneyScale } from '../data/economy.js'
import { traitById } from '../data/staff.js'
import { applyEffects, resolveChoice } from './effects.js'
import { eventById, fillText, ideaById } from './events.js'
import { freelaNeed } from './freelas.js'
import { polishMore, releaseProject, startFreela, startGameProject } from './project.js'
import { checkAchievements, updateLegacy } from './progress.js'
import { createGame, fx, log, scaled, toast, yearFloat } from './state.js'
import { techHypeMultiplier } from './staff.js'
import { tick } from './tick.js'
import { clamp, makeId } from './rng.js'

export const decorCost = (state, item) => scaled(state, item.cost)
export const officeCost = (state, level) => scaled(state, OFFICES[level].cost)
export const trainCost = (state, person) => scaled(state, 1400 + person.level * 450)
export const techCost = (state, tech) => scaled(state, tech.cost)

function popQueue(state) {
  state.queue.shift()
}

function choose(state, index, random) {
  const item = state.queue[0]
  if (!item || item.result) return
  let choice = null
  if (item.kind === 'event') choice = eventById(item.eventId)?.choices?.[index]
  if (item.kind === 'idea') choice = ideaById(item.ideaId)?.choices?.[index]
  if (!choice) return
  const outcome = resolveChoice(choice, random)
  const chips = applyEffects(state, outcome.effects)
  item.result = { index, text: fillText(outcome.text, state, item.ctx), chips, win: outcome.win }
  if (item.kind === 'idea' && index === 0) state.stats.ideasAccepted += 1
  if (outcome.win === true) fx(state, { type: 'cheer' })
  if (outcome.win === false) fx(state, { type: 'sigh' })
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
      if (item?.kind !== 'phase' || !state.project) return current
      const list = PHASE_FOCUS[PHASES[item.phase].id]
      if (!list.some(focus => focus.id === action.focus)) return current
      state.project.focus[item.phase] = action.focus
      popQueue(state)
      return state
    }

    case 'RELEASE': {
      if (state.queue[0]?.kind !== 'ready' || !state.project) return current
      popQueue(state)
      releaseProject(state, random)
      return state
    }

    case 'POLISH_MORE': {
      if (state.queue[0]?.kind !== 'ready' || !state.project) return current
      popQueue(state)
      polishMore(state)
      return state
    }

    case 'START_GAME': {
      if (state.project) return current
      startGameProject(state, action.choice)
      return state
    }

    case 'START_FREELA': {
      if (state.project) return current
      const item = state.freelas.find(freela => freela.id === action.id)
      if (!item) return current
      startFreela(state, item, freelaNeed(item, yearFloat(state)))
      return state
    }

    case 'CANCEL_PROJECT': {
      if (!state.project) return current
      log(state, 'x', `Cancelou ${state.project.title}`)
      state.project = null
      state.ideas = []
      for (const person of state.staff) person.mood = clamp(person.mood - 10, 0, 100)
      return state
    }

    case 'SET_PACE': {
      if (!state.project) return current
      state.project.pace = action.pace
      fx(state, { type: 'pace', pace: action.pace })
      return state
    }

    case 'MARKET': {
      const project = state.project
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
      project.lastMarketing = { id: channel.id, win, gained }
      toast(state, { kind: win === false ? 'bad' : 'good', icon: channel.icon, title: win === false ? 'Flopou' : win ? 'Viralizou!' : channel.label, chips })
      fx(state, { type: 'hype', amount: gained })
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
      if (!candidate || state.staff.length >= OFFICES[state.office].cap) return current
      const fee = Math.round(candidate.salary * moneyScale(yearFloat(state)))
      state.money -= fee
      candidate.hiredAt = state.year
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
        state.office = 0
        state.decor = state.decor.slice(0, OFFICES[0].slots)
        state.project = null
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
  updateLegacy(state)
  return state
}
