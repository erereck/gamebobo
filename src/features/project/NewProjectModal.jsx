import { useEffect, useMemo, useState } from 'react'
import { useGame } from '../../app/GameContext.jsx'
import { FOCUSES, PLATFORMS, SCALES, THEMES } from '../../game/data/catalog.js'
import { getEra } from '../../game/data/eras.js'
import { platformAtDate } from '../../game/data/platformHistory.js'
import { projectPromiseCost, promiseFit, promiseOptionsFor, promiseScopeMonths } from '../../game/data/projectPromises.js'
import { getFranchises } from '../../game/engine/selectors.js'
import { formatMoney } from '../../game/engine/utils.js'
import { licenseFromState } from '../../game/engine/licensing.js'
import { Button } from '../../components/ui/Button.jsx'
import { Modal } from '../../components/ui/Modal.jsx'

const suggestions = ['Cubo de Domingo', 'Neon Futebol', 'Quarto 12', 'Manual do Fim', 'Cidade Baixa', 'Depois da Aula']
const defaults = { title: '', genre: 'rpg', theme: 'fantasy', scale: 'small', platform: 'pc', focus: 'gameplay', promiseId: 'world-to-explore', franchiseId: '', licenseIds: [] }

export function NewProjectModal() {
  const { state, dispatch, projectModalOpen, setProjectModalOpen } = useGame()
  const [form, setForm] = useState(defaults)
  const franchises = useMemo(() => getFranchises(state), [state])
  const scale = SCALES[form.scale]
  const era = getEra(state.date.year)
  const baseCost = Math.round(scale.cost * era.costMultiplier * (1 + state.studio.team.length * .08))
  const scopeMonths = promiseScopeMonths(form.promiseId, form.scale)
  const totalMonths = scale.months + scopeMonths
  const estimatedCost = projectPromiseCost(baseCost, scale.months, form.promiseId, form.scale)
  const entryCost = Math.round(estimatedCost * .25)
  const availableScales = Object.values(SCALES).filter(item => (item.officeLevel ?? 0) <= state.studio.officeLevel && (item.teamSize ?? 0) <= state.studio.team.length)
  const availablePlatforms = PLATFORMS.filter(item => platformAtDate(item, state.date))
  const activeLicenses = state.licenses.active
  const licenseRoyalty = activeLicenses.filter(item => form.licenseIds.includes(item.licenseId)).reduce((sum, item) => sum + item.royalty, 0)
  const commission = state.corporate.activeCommission
  const promiseOptions = useMemo(() => promiseOptionsFor({ genre: form.genre, focus: form.focus, year: state.date.year, scaleId: form.scale }, 5, form.promiseId), [form.genre, form.focus, form.scale, form.promiseId, state.date.year])

  useEffect(() => {
    if (!projectModalOpen) return
    const genre = commission?.genre ?? defaults.genre
    const scaleId = commission ? 'small' : defaults.scale
    const recommended = promiseOptionsFor({ genre, focus: defaults.focus, year: state.date.year, scaleId }, 1)[0]
    setForm({ ...defaults, genre, scale: scaleId, promiseId: recommended?.id ?? defaults.promiseId, licenseIds: commission ? [commission.licenseId] : [], title: suggestions[Math.floor(Math.random() * suggestions.length)] })
  }, [projectModalOpen, commission?.id, state.date.year])

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const toggleLicense = licenseId => setForm(current => ({ ...current, licenseIds: current.licenseIds.includes(licenseId) ? (commission?.licenseId === licenseId ? current.licenseIds : current.licenseIds.filter(id => id !== licenseId)) : current.licenseIds.length < 2 ? [...current.licenseIds, licenseId] : current.licenseIds }))
  const submit = event => {
    event.preventDefault()
    if (!form.title.trim() || state.player.money < entryCost) return
    dispatch({ type: 'START_PROJECT', payload: form })
    setProjectModalOpen(false)
  }

  return (
    <Modal open={projectModalOpen} onClose={() => setProjectModalOpen(false)} className="project-modal" label="Novo projeto">
      <form onSubmit={submit}>
        <header className="modal-titlebar">
          <div><p>ABRIR PROJETO</p><h2>Uma boa ideia cabe numa ficha.</h2></div>
          <button type="button" className="modal-close" onClick={() => setProjectModalOpen(false)} aria-label="Fechar">×</button>
        </header>
        <div className="project-form">
          {commission && <section className="commission-brief full-field"><span>{commission.concept?.toUpperCase()} · {commission.monthsLeft} MESES</span><strong>{licenseFromState(state, commission.licenseId)?.name}</strong><p>Gênero e licença vieram no brief. Escala mínima pequena · meta {commission.scoreFloor} · liberdade criativa {Math.round(commission.creativeFreedom)}%{commission.offbeat ? ' · a empresa quer algo fora do gênero habitual' : ''}.</p></section>}
          <label className="text-field full-field"><span>01 · TÍTULO</span><input value={form.title} onChange={event => update('title', event.target.value)} maxLength="32" required autoFocus /></label>
          <ChoiceGroup number="02" label="GÊNERO" name="genre" value={form.genre} options={state.world.knownGenres} onChange={update} />
          <ChoiceGroup number="03" label="TEMA" name="theme" value={form.theme} options={THEMES} onChange={update} />
          <ChoiceGroup number="04" label="FOCO" name="focus" value={form.focus} options={FOCUSES} onChange={update} />
          <PromisePicker options={promiseOptions} value={form.promiseId} genre={form.genre} focus={form.focus} scaleId={form.scale} onChange={value => update('promiseId', value)} />
          <ChoiceGroup number="06" label="ESCALA" name="scale" value={form.scale} options={availableScales} onChange={update} />
          <ChoiceGroup number="07" label="PLATAFORMA" name="platform" value={form.platform} options={availablePlatforms} onChange={update} />
          <label className="select-field"><span>FRANQUIA PRÓPRIA</span><select value={form.franchiseId} onChange={event => update('franchiseId', event.target.value)}><option value="">Jogo original</option>{franchises.map(item => <option key={item.id} value={item.id}>Continuação de {item.name}</option>)}</select></label>
          <LicensePicker state={state} activeLicenses={activeLicenses} selectedIds={form.licenseIds} commission={commission} onToggle={toggleLicense} />
          <div className="project-estimate full-field">
            <div><span>PRAZO</span><strong>{totalMonths} meses</strong></div>
            <div><span>ORÇAMENTO</span><strong>{formatMoney(estimatedCost)}</strong></div>
            <div><span>CAIXA MÍNIMO</span><strong>{formatMoney(entryCost)}</strong></div>
            {licenseRoyalty > 0 && <div><span>ROYALTIES DE IP</span><strong>{Math.round(licenseRoyalty * 100)}%</strong></div>}
            <p className={state.player.money < entryCost ? 'is-danger' : ''}>{state.player.money < entryCost ? 'O caixa não segura nem o primeiro mês.' : scopeMonths ? `A promessa acrescenta ${scopeMonths} mês${scopeMonths > 1 ? 'es' : ''} ao escopo.` : 'A promessa cabe bem nessa escala.'}</p>
          </div>
        </div>
        <footer className="modal-actions"><Button type="button" onClick={() => setProjectModalOpen(false)}>CANCELAR</Button><Button type="submit" variant="primary" disabled={state.player.money < entryCost}>ABRIR PROJETO</Button></footer>
      </form>
    </Modal>
  )
}

function ChoiceGroup({ number, label, name, value, options, onChange }) {
  return <fieldset className="choice-field"><legend>{number} · {label}</legend><select className="choice-select-mobile" aria-label={`${number} · ${label}`} value={value} onChange={event => onChange(name, event.target.value)}>{options.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select><div className="choice-grid">{options.map(option => <label key={option.id} className="choice-chip"><input type="radio" name={name} value={option.id} checked={value === option.id} onChange={() => onChange(name, option.id)} /><span>{option.label}</span></label>)}</div></fieldset>
}

function PromisePicker({ options, value, genre, focus, scaleId, onChange }) {
  return (
    <fieldset className="promise-picker full-field">
      <legend>05 · PROMESSA DA CAPA</legend>
      <p>Escolha o que este jogo precisa cumprir. As opções mais naturais vêm primeiro.</p>
      <div>{options.map((option, index) => {
        const scopeMonths = promiseScopeMonths(option.id, scaleId)
        const fit = promiseFit(option, genre, focus)
        return <label key={option.id} className={value === option.id ? 'is-selected' : ''}><input type="radio" name="promiseId" value={option.id} checked={value === option.id} onChange={() => onChange(option.id)} /><span><small>{index === 0 ? 'RECOMENDADA' : fit > 0 ? 'BOA COMBINAÇÃO' : 'APOSTA'}</small><strong>{option.label}</strong><em>{option.pitch}</em><b>{scopeMonths ? `ESCOPO +${scopeMonths} MÊS${scopeMonths > 1 ? 'ES' : ''}` : 'ESCOPO SEGURO'}</b></span></label>
      })}</div>
    </fieldset>
  )
}

function LicensePicker({ state, activeLicenses, selectedIds, commission, onToggle }) {
  return (
    <fieldset className="license-picker full-field">
      <legend>08 · LICENÇAS · ATÉ DUAS</legend>
      {activeLicenses.length ? <div>{activeLicenses.map(contract => {
        const ip = licenseFromState(state, contract.licenseId)
        const selected = selectedIds.includes(ip.id)
        const required = commission?.licenseId === ip.id
        return <label key={contract.id} className={selected ? 'is-selected' : ''}><input type="checkbox" checked={selected} onChange={() => onToggle(ip.id)} disabled={required || (!selected && selectedIds.length >= 2)} /><span><strong>{ip.name}{required ? ' · BRIEF' : ''}</strong><small>{Math.round(contract.royalty * 100)}% · até {contract.expiresYear}</small></span></label>
      })}</div> : <p>Você ainda não tem direitos contratados. O projeto continua como IP original.</p>}
      {selectedIds.length === 2 && <em>Crossover: alcance maior, duas aprovações e uma margem bem menor.</em>}
    </fieldset>
  )
}
