import { useEffect, useState } from 'react'
import { dispatch } from '../../app/store.js'
import { sfx, vibrate } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { Cover } from '../../ui/Cover.jsx'
import { Chips } from '../../ui/Chips.jsx'
import { fmtNum, fmtScore, scoreColor } from '../../ui/format.js'
import { PRESS_TONES, pressMediumById, pressQuestionById } from '../../game/data/content/press.js'
import { answerEffects, fillPress } from '../../game/engine/press.js'
import { hashString } from '../../game/engine/rng.js'
import './press.css'

const MEDIUM_COLOR = { revista: '#ff5d3a', tv: '#3fb8ff', portal: '#52d977', stream: '#b57bff' }
const SUSPENSE_MS = 900

// Microfone de repórter com a plaquinha do veículo.
function Mic({ color, initials }) {
  return (
    <svg className="press-mic" width="58" height="88" viewBox="0 0 64 96" aria-hidden="true">
      <defs><clipPath id="press-mic-head"><circle cx="32" cy="24" r="17" /></clipPath></defs>
      <rect x="27" y="50" width="10" height="42" rx="4" fill="#2b2734" stroke="#1d1a24" strokeWidth="2.5" />
      <rect x="16" y="40" width="32" height="20" rx="4" fill={color} stroke="#1d1a24" strokeWidth="2.5" />
      <text x="32" y="54" textAnchor="middle" fontFamily="'Martian Mono', monospace" fontWeight="700" fontSize="10" fill="#1d1a24">{initials}</text>
      <circle cx="32" cy="24" r="18" fill="#d9d2e6" stroke="#1d1a24" strokeWidth="2.5" />
      <g clipPath="url(#press-mic-head)" stroke="#8a82a0" strokeWidth="1.6">
        <path d="M10 15h44M10 22h44M10 29h44M10 36h44M18 4v40M25 4v40M32 4v40M39 4v40M46 4v40" />
      </g>
      <ellipse cx="25" cy="16" rx="4" ry="2.6" fill="#fff" opacity=".8" />
    </svg>
  )
}

const initialsOf = name => name.split(/\s+/).filter(word => /^[A-ZÀ-Ú0-9&]/.test(word)).map(word => word[0]).join('').slice(0, 3)
const slugOf = name => name.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '')

// Antes do clique: ícone + seta. A polêmica mostra o dado e a chance.
const PREVIEW = [
  { key: 'fansPct', icon: 'fans', big: .025 },
  { key: 'mood', icon: 'smile', big: 7 },
  { key: 'energy', icon: 'bolt', big: 10 },
  { key: 'nextHype', icon: 'megaphone', big: 8 },
  { key: 'copiesPct', icon: 'disc', big: .03 },
  { key: 'money', icon: 'cash', big: 2000 },
  { key: 'rp', icon: 'flask', big: 6 },
]

function Preview({ answer, band }) {
  const plan = answerEffects(answer, band)
  if (plan.gamble) {
    return (
      <span className="chips chips-preview">
        <span className="chip chip-mini press-odds"><Icon name="dice" size={13} stroke={2.6} />{Math.round(plan.gamble.chance * 100)}%</span>
      </span>
    )
  }
  const items = PREVIEW.filter(meta => plan.effects[meta.key])
  return (
    <span className="chips chips-preview">
      {items.map(meta => {
        const value = plan.effects[meta.key]
        const arrow = value > 0 ? '▲' : '▼'
        return (
          <span key={meta.key} className={`chip chip-mini ${value > 0 ? 'chip-good' : 'chip-bad'}`}>
            <Icon name={meta.icon} size={13} stroke={2.6} />
            <b>{Math.abs(value) >= meta.big ? arrow + arrow : arrow}</b>
          </span>
        )
      })}
    </span>
  )
}

function ToneTag({ tone, win = null }) {
  const info = PRESS_TONES[tone] ?? PRESS_TONES.humilde
  return (
    <span className={`press-tone tone-${tone} ${win === false ? 'lost' : ''}`} style={{ '--tone': info.color }}>
      <Icon name={info.icon} size={11} stroke={2.8} />{info.label}
    </span>
  )
}

function Pips({ total, current, done }) {
  return (
    <span className="press-pips" aria-label={`Pergunta ${Math.min(current + 1, total)} de ${total}`}>
      {Array.from({ length: total }, (_, i) => <i key={i} className={i < done ? 'done' : i === current ? 'on' : ''} />)}
      <b>{Math.min(current + 1, total)}/{total}</b>
    </span>
  )
}

// Soma as fichinhas das três respostas para o resumo.
function totals(answers) {
  const sums = new Map()
  for (const answer of answers) for (const chip of answer.chips ?? []) sums.set(chip.key, (sums.get(chip.key) ?? 0) + chip.value)
  return [...sums].filter(([, value]) => value).map(([key, value]) => ({ key, value }))
}

// Coletiva de imprensa: três perguntas, uma de cada vez, e a manchete do dia seguinte.
export function PressModal({ item, state }) {
  const game = state.games.find(entry => entry.id === item.gameId)
  const questions = item.questions.map(pressQuestionById)
  const medium = pressMediumById(item.medium)
  const [seen, setSeen] = useState(item.answers.length)
  const [suspense, setSuspense] = useState(false)
  const answered = item.answers.length
  const total = questions.length
  const reacting = answered > seen
  const finished = !reacting && seen >= total
  const question = questions[Math.min(seen, total - 1)]
  const reaction = reacting ? item.answers[seen] : null
  const broken = !game || questions.some(entry => !entry)

  useEffect(() => {
    if (broken) dispatch({ type: 'CLOSE' })
  }, [broken])

  useEffect(() => {
    sfx.whoosh()
    vibrate(12)
  }, [])

  // A polêmica segura o suspense um instante antes de mostrar se colou.
  useEffect(() => {
    const last = item.answers[answered - 1]
    if (!last || answered <= seen) return undefined
    if (last.win === null || last.win === undefined) {
      setSuspense(false)
      sfx.select()
      return undefined
    }
    const ticks = setInterval(() => sfx.tick(), 110)
    const id = setTimeout(() => {
      clearInterval(ticks)
      setSuspense(false)
      if (last.win) { sfx.fanfare(); vibrate([20, 40, 20]) } else { sfx.sad(); vibrate(60) }
    }, SUSPENSE_MS)
    return () => { clearTimeout(id); clearInterval(ticks) }
  }, [answered])

  if (broken) return null
  const vars = item.vars ?? {}
  const color = MEDIUM_COLOR[medium.id] ?? '#ffd23f'
  const issue = (hashString(item.id) % 180) + 12
  const viewers = fmtNum(Math.max(12, Math.round(state.fans * .03)))
  const answer = index => {
    sfx.click()
    vibrate(10)
    if (question.answers[index]?.tone === 'polemico') setSuspense(true)
    dispatch({ type: 'PRESS_ANSWER', index, at: seen })
  }
  // Clique duplo não pula pergunta: nunca passa da última resposta dada.
  const next = () => { sfx.click(); setSeen(value => Math.min(value + 1, answered)) }
  const close = () => { sfx.click(); dispatch({ type: 'CLOSE' }) }
  const chosen = reaction ? question.answers[reaction.index] : null

  return (
    <div className="modal-backdrop press-backdrop">
      <article className={`press-card medium-${medium.id} ${finished ? 'is-done' : ''}`} style={{ '--medium': color }}>
        {!finished && (
          <div className="press-set">
            <div className="press-screen">
              <header className="press-head">
                {medium.id === 'revista' && <span className="press-mast"><b>{item.host}</b><small>Nº {issue}</small></span>}
                {medium.id === 'tv' && <span className="press-live"><i />AO VIVO</span>}
                {medium.id === 'portal' && <span className="press-url"><i /><i /><i /><small>{slugOf(item.host)}.com.br</small></span>}
                {medium.id === 'stream' && <span className="press-live is-stream"><i />AO VIVO<small><Icon name="eye" size={11} stroke={2.6} />{viewers}</small></span>}
                <Pips total={total} current={seen} done={reacting ? seen + 1 : seen} />
              </header>
              <p key={question.id} className="press-q">
                {medium.id === 'revista' && <span className="press-q-tag">P.</span>}
                {fillPress(question.q, vars)}
              </p>
              {medium.id !== 'revista' && <span className="press-third"><Icon name={medium.icon} size={12} stroke={2.6} />{item.host}</span>}
            </div>
            <Mic color={color} initials={initialsOf(item.host)} />
          </div>
        )}

        {!finished && !reacting && (
          <div className="press-answers">
            {question.answers.map((option, index) => (
              <button key={option.tone} type="button" className="press-answer" onClick={() => answer(index)}>
                <ToneTag tone={option.tone} />
                <span className="press-answer-label">{option.label}</span>
                <Preview answer={option} band={item.band} />
              </button>
            ))}
          </div>
        )}

        {reacting && suspense && (
          <div className="press-suspense" aria-live="polite">
            <span className="press-said">“{chosen?.label}”</span>
            <span className="press-dots"><i /><i /><i /></span>
          </div>
        )}

        {reacting && !suspense && (
          <div className={`press-reaction ${reaction.win === false ? 'bad' : reaction.win ? 'good' : ''}`}>
            <div className="press-reaction-top">
              <ToneTag tone={reaction.tone} win={reaction.win} />
              {reaction.win !== null && reaction.win !== undefined && <span className="press-stamp">{reaction.win ? 'COLOU!' : 'PEGOU MAL'}</span>}
            </div>
            <span className="press-said">“{chosen?.label}”</span>
            <p className="press-react-text">{reaction.text}</p>
            <Chips items={reaction.chips} big />
            <button type="button" className="btn btn-big btn-tomato press-next" autoFocus onClick={next}>
              {seen + 1 >= total ? 'Manchete' : 'Próxima'}<Icon name="play" size={16} stroke={2.6} />
            </button>
          </div>
        )}

        {finished && (
          <div className="press-summary">
            <div className="press-paper">
              <span className="press-kicker"><Icon name="newspaper" size={12} stroke={2.6} />{medium.label} · {item.host}</span>
              <div className="press-paper-body">
                <Cover game={game} width={70} />
                <div>
                  <h2 className="press-headline">{item.headline?.text ?? 'Entrevista encerrada'}</h2>
                  <span className="press-game">{game.title}<b style={{ background: scoreColor(game.score) }}>{fmtScore(game.score)}</b></span>
                </div>
              </div>
            </div>
            <div className="press-tones">{item.answers.map((entry, i) => <ToneTag key={i} tone={entry.tone} win={entry.win} />)}</div>
            <Chips items={totals(item.answers)} big />
            <button type="button" className="btn btn-big btn-tomato press-next" autoFocus onClick={close}>Encerrar</button>
          </div>
        )}

        {!finished && !reacting && (
          <button type="button" className="link-btn press-skip" onClick={close}>Sem comentários</button>
        )}
      </article>
    </div>
  )
}
