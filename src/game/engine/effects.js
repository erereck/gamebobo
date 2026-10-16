import { eraBar } from '../data/economy.js'
import { expectedPoints } from './quality.js'
import { scaled } from './state.js'
import { clamp } from './rng.js'

// Aplica um pacote de efeitos e devolve fichinhas para a interface mostrar.
// ctx.projectId escolhe o projeto afetado; sem ele, o primeiro jogo em produção.
export function applyEffects(state, effects = {}, ctx = {}) {
  const chips = []
  if (!effects) return chips
  if (effects.money) {
    const value = scaled(state, effects.money)
    state.money += value
    chips.push({ key: 'money', value })
  }
  if (effects.fansPct) {
    const raw = state.fans * effects.fansPct
    const value = Math.round(Math.sign(effects.fansPct) * Math.max(20, Math.abs(raw)))
    const applied = Math.max(-state.fans, value)
    state.fans += applied
    chips.push({ key: 'fans', value: applied })
  }
  if (effects.rp) {
    state.rp = Math.max(0, state.rp + effects.rp)
    chips.push({ key: 'rp', value: effects.rp })
  }
  if (effects.energy || effects.mood) {
    for (const person of state.staff) {
      if (effects.energy) person.energy = clamp(person.energy + effects.energy, 0, 100)
      if (effects.mood) person.mood = clamp(person.mood + effects.mood, 0, 100)
    }
    if (effects.energy) chips.push({ key: 'energy', value: effects.energy })
    if (effects.mood) chips.push({ key: 'mood', value: effects.mood })
  }
  if (effects.nextScore) {
    state.buffs.score += effects.nextScore
    chips.push({ key: 'score', value: effects.nextScore })
  }
  if (effects.salesMult) {
    state.buffs.sales *= effects.salesMult
    chips.push({ key: 'sales', value: Math.round((effects.salesMult - 1) * 100) })
  }
  const project = (ctx.projectId && state.projects?.find(item => item.id === ctx.projectId)) || state.projects?.find(item => item.kind === 'game') || null
  if (project && project.kind === 'game') {
    if (effects.hype) {
      project.hype = clamp(project.hype + effects.hype, 0, 100)
      chips.push({ key: 'hype', value: effects.hype })
    }
    if (effects.bugs) {
      const unit = Math.max(1, expectedPoints(project.size, project.startYear) / 250)
      const value = Math.round(effects.bugs * unit)
      project.bugs = Math.max(0, project.bugs + value)
      chips.push({ key: 'bugs', value })
    }
    if (effects.weeks) {
      project.totalWeeks = Math.max(project.week + 1, project.totalWeeks + effects.weeks)
      chips.push({ key: 'weeks', value: effects.weeks })
    }
  }
  if (project && effects.pts) {
    const unit = eraBar(project.startYear ?? state.year) * 10
    for (const [key, amount] of Object.entries(effects.pts)) {
      const value = Math.round(amount * unit)
      project.pts[key] = Math.max(0, (project.pts[key] ?? 0) + value)
      chips.push({ key, value })
    }
  }
  return chips
}

export function resolveChoice(choice, random = Math.random) {
  if (choice.gamble) {
    const win = random() < choice.gamble.chance
    return { effects: win ? choice.gamble.win : choice.gamble.lose, text: win ? choice.winText : choice.loseText, win }
  }
  return { effects: choice.effects, text: choice.result, win: null }
}
