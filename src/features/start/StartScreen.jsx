import { useMemo, useState } from 'react'
import { dispatch, deleteSlot, hasLegacySave, listSlots, loadSave } from '../../app/store.js'
import { sfx, vibrate } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { Avatar } from '../../ui/Avatar.jsx'
import { OfficeView } from '../office/OfficeView.jsx'
import { FOUNDER_PROFILES, LOOKS, traitById } from '../../game/data/staff.js'
import { START_ERAS, eraAt } from '../../game/data/economy.js'
import { GAME_MODES, modeById } from '../../game/data/modes.js'
import { STUDIO_NAME_IDEAS, FIRST_NAMES } from '../../game/data/content/names.js'
import { randomLook } from '../../game/engine/staff.js'
import { pick } from '../../game/engine/rng.js'
import { VERSION_INFO } from '../../version.js'

const STEPS = ['mode', 'name', 'studio', 'year', 'profile', 'look']

function SlotPicker({ slots, onNew, onRefresh }) {
  const [confirm, setConfirm] = useState(null)
  return (
    <section className="start-card slots-card">
      <h1>Suas carreiras</h1>
      <div className="slots">
        {slots.map(slot => slot.empty ? (
          <button key={slot.slot} type="button" className="slot slot-empty" onClick={() => { sfx.select(); onNew(slot.slot) }}>
            <span className="slot-num">{slot.slot}</span>
            <Icon name="plus" size={22} />
            <small>Nova</small>
          </button>
        ) : (
          <div key={slot.slot} className="slot">
            <button type="button" className="slot-main" onClick={() => { sfx.fanfare(); const loaded = loadSave(slot.slot); if (loaded) dispatch({ type: 'LOAD', state: loaded }) }}>
              <span className="slot-num">{slot.slot}</span>
              <Avatar look={slot.look} size={44} />
              <span className="slot-info">
                <b>{slot.studio}</b>
                <small>{slot.year} · {slot.games} jogos</small>
                <span className="slot-mode"><Icon name={modeById(slot.mode).icon} size={11} stroke={2.6} />{modeById(slot.mode).label}</span>
              </span>
            </button>
            {confirm === slot.slot ? (
              <span className="slot-confirm">
                <button type="button" className="btn btn-small btn-tomato" onClick={() => { deleteSlot(slot.slot); setConfirm(null); onRefresh() }}>Apagar</button>
                <button type="button" className="btn btn-small" onClick={() => setConfirm(null)}>Não</button>
              </span>
            ) : (
              <button type="button" className="slot-trash" aria-label="Apagar save" title="Apagar" onClick={() => { sfx.back(); setConfirm(slot.slot) }}><Icon name="x" size={16} /></button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export function StartScreen() {
  const [slots, setSlots] = useState(() => listSlots())
  const used = slots.filter(slot => !slot.empty)
  const legacy = useMemo(() => hasLegacySave(), [])
  const [creating, setCreating] = useState(() => (used.length ? null : 1))
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => ({ modeId: null, founderName: '', studioName: '', startYear: null, profileId: null, look: { ...randomLook(), extra: 'nada' } }))
  const era = eraAt(form.startYear ?? 1980)

  const view = useMemo(() => ({
    office: 0,
    era,
    decor: ['plant'],
    studioName: form.studioName || 'Gamebobo',
    staff: [{ id: 'founder', name: form.founderName, look: form.look, founder: true, trait: 'zen', energy: 100, status: 'ok', top: 'fun', working: step >= 4, pace: 'normal' }],
    working: step >= 4,
    crunch: false,
    ideas: [],
    visitor: false,
    couples: [],
    posters: [],
    trophies: 0,
    topics: ['gamepad', 'bulb', 'pizza', 'heart'],
    sound: false,
  }), [era.id, form.look, form.studioName, step])

  const current = STEPS[step]
  const canNext = {
    mode: form.modeId !== null,
    name: form.founderName.trim().length > 0,
    studio: form.studioName.trim().length > 0,
    year: form.startYear !== null,
    profile: form.profileId !== null,
    look: true,
  }[current]

  const start = () => {
    sfx.fanfare()
    dispatch({ type: 'NEW_GAME', options: { ...form, slot: creating } })
  }
  const next = () => {
    if (!canNext) return
    sfx.select()
    vibrate(8)
    if (step < STEPS.length - 1) setStep(step + 1)
    else start()
  }
  const setLook = patch => {
    sfx.click()
    setForm(f => ({ ...f, look: { ...f.look, ...patch } }))
  }

  return (
    <div className={`start era-${era.id}`} style={{ '--sky-a': era.sky[0], '--sky-b': era.sky[1] }}>
      <div className="sky" aria-hidden="true" />
      <OfficeView view={view} />
      <div className="start-logo">
        <span className="logo-word">GAME<b>BOBO</b></span>
        <span className="logo-sticker">3D</span>
        <small>{VERSION_INFO.version} · {VERSION_INFO.codename}</small>
      </div>

      {creating === null ? (
        <SlotPicker slots={slots} onNew={slot => { setCreating(slot); setStep(0) }} onRefresh={() => setSlots(listSlots())} />
      ) : (
        <section className="start-card">
          <div className="start-steps">{STEPS.map((s, i) => <i key={s} className={i < step ? 'done' : i === step ? 'now' : ''} />)}</div>

          {current === 'mode' && (
            <div className="start-step" key="mode">
              <h1>Que carreira?</h1>
              <div className="mode-tiles">
                {GAME_MODES.map(mode => (
                  <button key={mode.id} type="button" className={`mode-tile ${form.modeId === mode.id ? 'on' : ''}`} onClick={() => { sfx.select(); setForm(f => ({ ...f, modeId: mode.id })) }}>
                    <Icon name={mode.icon} size={22} />
                    <b>{mode.label}</b>
                    <small>{mode.tag}</small>
                  </button>
                ))}
              </div>
              {form.modeId && (
                <ul className="mode-rules">
                  {modeById(form.modeId).rules.map(rule => <li key={rule}><Icon name="check" size={12} stroke={3} />{rule}</li>)}
                </ul>
              )}
            </div>
          )}

          {current === 'name' && (
            <div className="start-step" key="name">
              <h1>Quem vai abrir o estúdio?</h1>
              <div className="field">
                <input autoFocus value={form.founderName} maxLength={22} placeholder="Seu nome" onChange={event => setForm(f => ({ ...f, founderName: event.target.value }))} onKeyDown={event => event.key === 'Enter' && next()} />
                <button type="button" className="icon-btn dice" aria-label="Sortear nome" onClick={() => { sfx.click(); setForm(f => ({ ...f, founderName: pick(FIRST_NAMES) })) }}><Icon name="dice" size={20} /></button>
              </div>
            </div>
          )}

          {current === 'studio' && (
            <div className="start-step" key="studio">
              <h1>Nome do estúdio</h1>
              <div className="field">
                <input autoFocus value={form.studioName} maxLength={28} placeholder="Estúdio" onChange={event => setForm(f => ({ ...f, studioName: event.target.value }))} onKeyDown={event => event.key === 'Enter' && next()} />
                <button type="button" className="icon-btn dice" aria-label="Sortear nome do estúdio" onClick={() => { sfx.click(); setForm(f => ({ ...f, studioName: pick(STUDIO_NAME_IDEAS) })) }}><Icon name="dice" size={20} /></button>
              </div>
            </div>
          )}

          {current === 'year' && (
            <div className="start-step" key="year">
              <h1>Em que ano?</h1>
              <div className="era-tiles">
                {START_ERAS.map(item => (
                  <button key={item.year} type="button" className={`era-tile ${form.startYear === item.year ? 'on' : ''}`} style={{ '--ea': eraAt(item.year).sky[0], '--eb': eraAt(item.year).sky[1] }}
                    onClick={() => { sfx.select(); setForm(f => ({ ...f, startYear: item.year })) }}>
                    <Icon name={item.icon} size={24} />
                    <b>{item.label}</b>
                    <small>{item.tag}</small>
                  </button>
                ))}
              </div>
            </div>
          )}

          {current === 'profile' && (
            <div className="start-step" key="profile">
              <h1>Seu talento</h1>
              <div className="profile-tiles">
                {FOUNDER_PROFILES.map(profile => {
                  const trait = traitById(profile.trait)
                  return (
                    <button key={profile.id} type="button" className={`profile-tile ${form.profileId === profile.id ? 'on' : ''}`} onClick={() => { sfx.select(); setForm(f => ({ ...f, profileId: profile.id })) }}>
                      <Icon name={profile.icon} size={28} />
                      <b>{profile.label}</b>
                      <small><Icon name={trait.icon} size={11} stroke={2.6} />{trait.label}</small>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {current === 'look' && (
            <div className="start-step" key="look">
              <h1>Seu visual</h1>
              <div className="look-row">
                <span className="look-label"><Icon name="smile" size={16} /></span>
                {LOOKS.skin.map(color => <button key={color} type="button" className={`swatch ${form.look.skin === color ? 'on' : ''}`} style={{ background: color }} aria-label="Tom de pele" onClick={() => setLook({ skin: color })} />)}
              </div>
              <div className="look-row">
                <span className="look-label"><Icon name="cape" size={16} /></span>
                {LOOKS.shirt.map(color => <button key={color} type="button" className={`swatch ${form.look.shirt === color ? 'on' : ''}`} style={{ background: color }} aria-label="Camiseta" onClick={() => setLook({ shirt: color })} />)}
              </div>
              <div className="look-row">
                <span className="look-label"><Icon name="brush" size={16} /></span>
                {LOOKS.hair.map(color => <button key={color} type="button" className={`swatch ${form.look.hair === color ? 'on' : ''}`} style={{ background: color }} aria-label="Cor do cabelo" onClick={() => setLook({ hair: color })} />)}
              </div>
              <div className="look-row look-styles">
                {LOOKS.hairStyle.map(style => (
                  <button key={style} type="button" className={`style-btn ${form.look.hairStyle === style ? 'on' : ''}`} onClick={() => setLook({ hairStyle: style })} aria-label={style}>
                    <Avatar look={{ ...form.look, hairStyle: style, extra: 'nada' }} size={36} />
                  </button>
                ))}
              </div>
              <div className="look-row look-extras">
                {['nada', 'oculos', 'fone', 'bone'].map(extra => (
                  <button key={extra} type="button" className={`style-btn ${form.look.extra === extra ? 'on' : ''}`} onClick={() => setLook({ extra })} aria-label={extra}>
                    <Avatar look={{ ...form.look, extra }} size={36} />
                  </button>
                ))}
                <button type="button" className="icon-btn dice" aria-label="Visual aleatório" onClick={() => setLook(randomLook())}><Icon name="dice" size={20} /></button>
              </div>
            </div>
          )}

          <div className="start-nav">
            {(step > 0 || used.length > 0) && (
              <button type="button" className="btn btn-ghost" onClick={() => { sfx.back(); if (step > 0) setStep(step - 1); else setCreating(null) }}><Icon name="back" size={16} /></button>
            )}
            <button type="button" className="btn btn-big btn-tomato" disabled={!canNext} onClick={next}>
              {step === STEPS.length - 1 ? <><Icon name="home" size={20} />Abrir o quarto</> : <>Próximo<Icon name="play" size={16} /></>}
            </button>
          </div>
          {legacy && step === 0 && <p className="legacy-note"><Icon name="info" size={12} />Saves da versão antiga (0.x) não passam para o 3D.</p>}
        </section>
      )}
    </div>
  )
}
