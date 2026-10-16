import { PRESS_BANDS, PRESS_HEADLINES, PRESS_QUESTIONS, pressBand, pressMediumFor, pressQuestionById } from '../data/content/press.js'
import { genreById, themeById } from '../data/genres.js'
import { projectTypeById } from '../data/modes.js'
import { applyEffects, resolveChoice } from './effects.js'
import { absWeek, fx, log } from './state.js'
import { localStaff } from './teams.js'
import { clamp, makeId, pick, weighted } from './rng.js'

// Uma pergunta não volta antes de dois anos de jogo.
const RECENT_WEEKS = 96
const QUESTIONS_PER_PRESS = 3

// Nota extrema sempre chama a imprensa; o resto, metade das vezes. Relançamento nunca.
export function wantsPress(score, typeId, random = Math.random) {
  if (projectTypeById(typeId).quick) return false
  if (score >= 8.5 || score <= 4.5) return true
  return random() < .5
}

// Resumo do lançamento que as perguntas usam como condição.
export function pressContext(state, { project, game, breakdown, letdown, isNewCombo }) {
  const flags = []
  if (project.sequelOf) flags.push('sequel')
  if ((project.crunchWeeks ?? 0) >= 2 || project.pace === 'crunch') flags.push('crunch')
  if ((breakdown?.parts?.bugs ?? 0) <= -5) flags.push('bugs')
  if (letdown) flags.push('letdown')
  if (game.breakout) flags.push('viral')
  if (state.games.length === 1) flags.push('first')
  if (localStaff(state).length === 1) flags.push('solo')
  if (game.size === 'grande' || game.size === 'aaa') flags.push('big')
  if (game.publisher) flags.push('publisher')
  if (game.genre2) flags.push('hybrid')
  if ((game.platforms?.length ?? 1) > 1) flags.push('multi')
  if (state.market?.trend?.genre === game.genre) flags.push('trend')
  if (project.demo) flags.push('demo')
  if (isNewCombo) flags.push('combo')
  return {
    band: pressBand(game.score),
    score: game.score,
    genre: game.genre,
    genre2: game.genre2 ?? null,
    theme: game.theme,
    type: game.type,
    year: state.year,
    medium: pressMediumFor(state.year).id,
    flags,
  }
}

export function questionFits(question, ctx) {
  const when = question.when ?? {}
  if (when.band && !when.band.includes(ctx.band)) return false
  // Gênero e tema contam como assunto: basta um dos dois bater.
  if (when.genre || when.theme) {
    const genreHit = when.genre?.some(id => id === ctx.genre || id === ctx.genre2)
    const themeHit = when.theme?.includes(ctx.theme)
    if (!genreHit && !themeHit) return false
  }
  if (when.type && !when.type.includes(ctx.type)) return false
  if (when.medium && !when.medium.includes(ctx.medium)) return false
  if (when.flags && !when.flags.every(flag => ctx.flags.includes(flag))) return false
  if (when.minYear && ctx.year < when.minYear) return false
  if (when.maxYear && ctx.year > when.maxYear) return false
  return true
}

// Pergunta específica pesa mais que coringa; pergunta recente quase some.
function weightOf(state, question) {
  const specific = Object.keys(question.when ?? {}).filter(key => key !== 'band').length
  const last = state.seenEvents?.[`press:${question.id}`]
  const fresh = last === undefined || absWeek(state) - last > RECENT_WEEKS ? 1 : .06
  return (1 + specific * 2.5) * fresh
}

const onlyAboutScore = question => Object.keys(question.when ?? {}).join() === 'band'

// Abre com uma pergunta sobre a nota e completa com o que combina com o jogo.
// Depois da abertura, outra pergunta só sobre a nota fica rara.
export function pickPressQuestions(state, ctx, random = Math.random) {
  const pool = PRESS_QUESTIONS.filter(question => questionFits(question, ctx))
  const picked = []
  const opener = weighted(pool.filter(question => question.when?.band), question => weightOf(state, question), random)
  if (opener) picked.push(opener)
  const later = question => weightOf(state, question) * (onlyAboutScore(question) ? .25 : 1)
  while (picked.length < QUESTIONS_PER_PRESS) {
    const next = weighted(pool.filter(question => !picked.includes(question)), later, random)
    if (!next) break
    picked.push(next)
  }
  return picked
}

// Monta a coletiva logo depois do lançamento. Devolve o item da fila ou null.
export function createPress(state, release, random = Math.random) {
  const { game } = release
  if (!wantsPress(game.score, game.type, random)) return null
  const ctx = pressContext(state, release)
  const questions = pickPressQuestions(state, ctx, random)
  if (questions.length < QUESTIONS_PER_PRESS) return null
  const medium = pressMediumFor(state.year)
  const tw = absWeek(state)
  for (const question of questions) state.seenEvents[`press:${question.id}`] = tw
  return {
    kind: 'press',
    id: makeId('q'),
    gameId: game.id,
    medium: medium.id,
    host: pick(medium.hosts, random),
    band: ctx.band,
    questions: questions.map(question => question.id),
    vars: {
      game: game.title,
      genre: genreById(game.genre)?.label ?? '',
      theme: themeById(game.theme)?.label ?? '',
      score: (Math.round(game.score * 10) / 10).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
      studio: state.studio?.name ?? 'estúdio',
    },
    answers: [],
    headline: null,
  }
}

export const fillPress = (text, vars = {}) => String(text ?? '').replace(/\{(\w+)\}/g, (match, key) => vars[key] ?? match)

// Efeito final de uma resposta: padrão do tom na faixa de nota + ajuste da própria resposta.
export function answerEffects(answer, band) {
  const preset = PRESS_BANDS[band] ?? PRESS_BANDS.meh
  if (answer.tone !== 'polemico') return { effects: answer.fx ?? preset[answer.tone] ?? {} }
  const base = preset.polemico
  const extra = answer.gamble ?? {}
  return { gamble: { chance: extra.chance ?? base.chance, win: extra.win ?? base.win, lose: extra.lose ?? base.lose } }
}

// Aplica os efeitos da coletiva. nextHype vira bônus do próximo projeto; copiesPct mexe no jogo lançado.
export function applyPressEffects(state, effects = {}, game = null) {
  const { nextHype, copiesPct, ...rest } = effects
  const chips = applyEffects(state, rest)
  if (nextHype) {
    state.buffs.hype = clamp((state.buffs.hype ?? 0) + nextHype, -20, 40)
    chips.push({ key: 'hype', value: nextHype })
  }
  if (copiesPct > 0 && game?.onMarket) {
    const extra = Math.round(Math.max(0, game.copies - game.sold) * copiesPct)
    if (extra > 0) {
      game.copies += extra
      chips.push({ key: 'copies', value: extra })
    }
  }
  return chips
}

function headlineFor(answers, random) {
  const count = tone => answers.filter(answer => answer.tone === tone).length
  const spicy = answers.filter(answer => answer.tone === 'polemico')
  let key = 'misto'
  if (spicy.length >= 2) key = spicy.filter(answer => answer.win).length >= spicy.length / 2 ? 'polemicoWin' : 'polemicoLose'
  else if (count('humilde') >= 2) key = 'humilde'
  else if (count('confiante') >= 2) key = 'confiante'
  return { key, text: pick(PRESS_HEADLINES[key], random) }
}

// Responde a pergunta da vez. Devolve false quando a resposta não vale.
// at: qual pergunta a tela mostrava; resposta atrasada (clique duplo) é ignorada.
export function answerPress(state, item, index, random = Math.random, at = null) {
  if (item?.kind !== 'press' || item.answers.length >= item.questions.length) return false
  if (at !== null && at !== undefined && at !== item.answers.length) return false
  const question = pressQuestionById(item.questions[item.answers.length])
  const answer = question?.answers?.[index]
  if (!answer) return false
  const game = state.games.find(entry => entry.id === item.gameId) ?? null
  const plan = answerEffects(answer, item.band)
  const outcome = plan.gamble
    ? resolveChoice({ gamble: plan.gamble, winText: answer.win, loseText: answer.lose }, random)
    : { effects: plan.effects, text: answer.reaction, win: null }
  const chips = applyPressEffects(state, outcome.effects, game)
  item.answers.push({ index, tone: answer.tone, text: fillPress(outcome.text, item.vars), win: outcome.win, chips })
  if (outcome.win === true) fx(state, { type: 'cheer' })
  else if (outcome.win === false) fx(state, { type: 'sigh' })
  else if (outcome.effects?.nextHype > 0) fx(state, { type: 'hype', amount: outcome.effects.nextHype })
  if (item.answers.length === item.questions.length) {
    item.headline = headlineFor(item.answers, random)
    state.stats.interviews = (state.stats.interviews ?? 0) + 1
    log(state, 'newspaper', item.headline.text)
  }
  return true
}

// "Sem comentários": fecha a coletiva no meio. Sem efeito, só fica na história.
export function leavePress(state, item) {
  if (item?.kind !== 'press' || item.headline) return
  log(state, 'newspaper', `Sem comentários sobre ${item.vars?.game ?? 'o jogo'}`)
}
