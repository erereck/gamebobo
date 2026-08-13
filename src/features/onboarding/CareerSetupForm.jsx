import { useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button.jsx'
import { TRAITS } from '../../game/data/traits.js'
import { CURRENCIES, formatMoney } from '../../game/engine/utils.js'

const defaultOptions = {
  playerName: '',
  studioName: '',
  age: 21,
  startYear: 2003,
  traitId: 'visionary',
  currency: 'BRL',
}

export function CareerSetupForm({ initialOptions, hasExistingSave = false, onSubmit, onCancel, compact = false }) {
  const [form, setForm] = useState({ ...defaultOptions, ...initialOptions })
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const valid = form.playerName.trim().length >= 2 && form.studioName.trim().length >= 2
  const selectedTrait = useMemo(() => TRAITS.find(item => item.id === form.traitId), [form.traitId])

  const submit = event => {
    event.preventDefault()
    if (!valid) return
    onSubmit({
      ...form,
      playerName: form.playerName.trim(),
      studioName: form.studioName.trim(),
      age: Number(form.age),
      startYear: Number(form.startYear),
    })
  }

  return (
    <form className={`career-setup-form ${compact ? 'is-compact' : ''}`} onSubmit={submit}>
      <div className="setup-fields">
        <label className="setup-field">
          <span>SEU NOME</span>
          <input autoFocus={!compact} name="playerName" maxLength="28" autoComplete="name" value={form.playerName} onChange={event => update('playerName', event.target.value)} placeholder="Como vão te chamar?" />
        </label>
        <label className="setup-field">
          <span>NOME DO ESTÚDIO</span>
          <input name="studioName" maxLength="32" value={form.studioName} onChange={event => update('studioName', event.target.value)} placeholder="A placa na porta" />
        </label>
        <label className="setup-field setup-age">
          <span>IDADE NO COMEÇO</span>
          <input type="number" min="16" max="60" inputMode="numeric" value={form.age} onChange={event => update('age', event.target.value)} />
        </label>
      </div>

      <fieldset className="setup-block">
        <legend>EM QUE ANO A GARAGEM ABRE?</legend>
        <div className="setup-decades">{[1980, 1990, 2000, 2010, 2020].map(year => <button key={year} type="button" className={Math.floor(form.startYear / 10) * 10 === year ? 'is-active' : ''} onClick={() => update('startYear', year)}>{year}s</button>)}</div>
        <label className="setup-year"><span>ANO EXATO</span><input type="range" min="1980" max="2020" value={form.startYear} onChange={event => update('startYear', Number(event.target.value))} /><strong>{form.startYear}</strong></label>
      </fieldset>

      <fieldset className="setup-block">
        <legend>O QUE VOCÊ TRAZ PARA A MESA?</legend>
        <div className="setup-traits">{TRAITS.map(trait => <label key={trait.id}><input type="radio" name="trait" value={trait.id} checked={form.traitId === trait.id} onChange={() => update('traitId', trait.id)} /><span><strong>{trait.name}</strong><small>{trait.description}</small></span></label>)}</div>
        <p className="setup-trait-note">Seu primeiro ponto forte: <strong>{selectedTrait?.name}</strong>. Não é classe fixa; é só onde a carreira começa.</p>
      </fieldset>

      <fieldset className="setup-block setup-currency">
        <legend>MOEDA DA INTERFACE</legend>
        <div>{Object.values(CURRENCIES).map(currency => <button key={currency.code} type="button" className={form.currency === currency.code ? 'is-active' : ''} onClick={() => update('currency', currency.code)}><strong>{currency.short}</strong><span>{currency.label}</span></button>)}</div>
        <p>O balanceamento não muda. {formatMoney(12800, form.currency)} será o caixa inicial exibido.</p>
      </fieldset>

      {hasExistingSave && <p className="setup-overwrite">Começar outra carreira substitui o save atual deste navegador.</p>}
      <div className="setup-actions">
        {onCancel && <Button type="button" onClick={onCancel}>VOLTAR</Button>}
        <Button type="submit" variant="primary" disabled={!valid}>{hasExistingSave ? 'SUBSTITUIR E COMEÇAR' : 'ABRIR A GARAGEM'}</Button>
      </div>
    </form>
  )
}
