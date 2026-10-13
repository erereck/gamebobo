import { useMemo, useState } from 'react'
import { dispatch, loadSave, peekSave, hasLegacySave } from '../../app/store.js'
import { sfx, vibrate } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { Avatar } from '../../ui/Avatar.jsx'
import { OfficeView } from '../office/OfficeView.jsx'
import { FOUNDER_PROFILES, LOOKS, traitById } from '../../game/data/staff.js'
import { START_ERAS, eraAt } from '../../game/data/economy.js'
import { STUDIO_NAME_IDEAS, FIRST_NAMES } from '../../game/data/content/names.js'
import { randomLook } from '../../game/engine/staff.js'
import { pick } from '../../game/engine/rng.js'
import { VERSION_INFO } from '../../version.js'

const STEPS = ['name', 'studio', 'year', 'profile', 'look']

export function StartScreen() {
  const save = useMemo(() => peekSave(), [])
  const legacy = useMemo(() => hasLegacySave(), [])
  const [mode, setMode] = useState(save ? 'continue' : 'new')
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => ({ founderName: '', studioName: '', startYear: null, profileId: null, look: { ...randomLook(), extra: 'nada' } }))
  const era = eraAt(form.startYear ?? save?.year ?? 1980)

  const view = useMemo(() => ({
    office: 0,
    era,
    decor: ['plant'],
    studioName: form.studioName || 'Gamebobo',
    staff: [{ id: 'founder', name: form.founderName, look: mode === 'continue' && save?.look ? save.look : form.look, founder: true, trait: 'zen', energy: 100, status: 'ok', top: 'fun' }],
    working: step >= 3,
    pace: 'normal',
    ideas: [],
    visitor: false,
    couples: [],
    posters: [],
    trophies: 0,
    topics: ['gamepad', 'bulb', 'pizza', 'heart'],
    sound: false,
  }), [era.id, form.look, form.studioName, step, mode])

  const current = STEPS[step]
  const canNext = {
    name: form.founderName.trim().length > 0,
    studio: form.studioName.trim().length > 0,
    year: form.startYear !== null,
    profile: form.profileId !== null,
    look: true,
  }[current]

  const next = () => {
    if (!canNext) return
    sfx.select()
    vibrate(8)
    if (step < STEPS.length - 1) setStep(step + 1)
    else start()
  }
  const start = () => {
    sfx.fanfare()
    dispatch({ type: 'NEW_GAME', options: form })
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

      {mode === 'continue' && save ? (
        <section className="start-card">
          <div className="save-card">
            <Avatar look={save.look} size={64} />
            <div>
              <b>{save.studio}</b>
              <small>{save.founder} · {save.year} · {save.games} jogos</small>
            </div>
          </div>
          <button type="button" className="btn btn-big btn-tomato" onClick={() => { sfx.fanfare(); const loaded = loadSave(); if (loaded) dispatch({ type: 'LOAD', state: loaded }) }}>
            <Icon name="play" size={20} /> Continuar
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => { sfx.click(); setMode('new') }}>Nova carreira</button>
        </section>
      ) : (
        <section className="start-card">
          <div className="start-steps">{STEPS.map((s, i) => <i key={s} className={i < step ? 'done' : i === step ? 'now' : ''} />)}</div>

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
            {step > 0 && <button type="button" className="btn btn-ghost" onClick={() => { sfx.back(); setStep(step - 1) }}><Icon name="back" size={16} /></button>}
            <button type="button" className="btn btn-big btn-tomato" disabled={!canNext} onClick={next}>
              {step === STEPS.length - 1 ? <><Icon name="home" size={20} />Abrir o quarto</> : <>Próximo<Icon name="play" size={16} /></>}
            </button>
          </div>
          {legacy && step === 0 && <p className="legacy-note"><Icon name="info" size={12} />Saves da versão antiga não passam para o 3D.</p>}
          {save && <button type="button" className="link-btn" onClick={() => setMode('continue')}>Voltar ao save</button>}
        </section>
      )}
    </div>
  )
}
