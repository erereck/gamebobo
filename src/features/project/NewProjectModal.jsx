import { useEffect, useMemo, useState } from 'react'
import { useGame } from '../../app/GameContext.jsx'
import { FOCUSES, PLATFORMS, SCALES, THEMES } from '../../game/data/catalog.js'
import { getFranchises } from '../../game/engine/selectors.js'
import { formatMoney } from '../../game/engine/utils.js'
import { getEra } from '../../game/data/eras.js'
import { platformAtDate } from '../../game/data/platformHistory.js'
import { licenseFromState } from '../../game/engine/licensing.js'
import { Button } from '../../components/ui/Button.jsx'
import { Modal } from '../../components/ui/Modal.jsx'

const suggestions = ['Cubo de Domingo', 'Neon Futebol', 'Quarto 12', 'Manual do Fim', 'Cidade Baixa', 'Depois da Aula']

const defaults = {
  title: '', genre: 'rpg', theme: 'fantasy', scale: 'small', platform: 'pc', focus: 'gameplay', franchiseId: '', licenseIds: [],
}

export function NewProjectModal() {
  const { state, dispatch, projectModalOpen, setProjectModalOpen } = useGame()
  const [form, setForm] = useState(defaults)
  const franchises = useMemo(() => getFranchises(state), [state])
  const scale = SCALES[form.scale]
  const era = getEra(state.date.year)
  const estimatedCost = Math.round(scale.cost * era.costMultiplier * (1 + state.studio.team.length * 0.08))
  const entryCost = Math.round(estimatedCost * 0.25)
  const availableScales = Object.values(SCALES).filter(item => (item.officeLevel ?? 0) <= state.studio.officeLevel && (item.teamSize ?? 0) <= state.studio.team.length)
  const availablePlatforms = PLATFORMS.filter(item => platformAtDate(item, state.date))
  const activeLicenses = state.licenses.active
  const licenseRoyalty = activeLicenses.filter(item => form.licenseIds.includes(item.licenseId)).reduce((sum, item) => sum + item.royalty, 0)
  const commission = state.corporate.activeCommission

  useEffect(() => {
    if (!projectModalOpen) return
    setForm({ ...defaults, genre: commission?.genre ?? defaults.genre, scale: commission ? 'small' : defaults.scale, licenseIds: commission ? [commission.licenseId] : [], title: suggestions[Math.floor(Math.random() * suggestions.length)] })
  }, [projectModalOpen, commission?.id])

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
          <div><p>ABRIR PROJETO</p><h2>Seis decisões. Depois começa o trabalho.</h2></div>
          <button type="button" className="modal-close" onClick={() => setProjectModalOpen(false)} aria-label="Fechar">×</button>
        </header>
        <div className="project-form">
          {commission && <section className="commission-brief full-field"><span>{commission.concept?.toUpperCase()} · {commission.monthsLeft} MESES</span><strong>{licenseFromState(state, commission.licenseId)?.name}</strong><p>Gênero e licença vieram no brief. Escala mínima pequena · meta {commission.scoreFloor} · liberdade criativa {Math.round(commission.creativeFreedom)}%{commission.offbeat ? ' · a empresa quer algo fora do gênero habitual' : ''}.</p></section>}
          <label className="text-field full-field"><span>01 · TÍTULO</span><input value={form.title} onChange={event => update('title', event.target.value)} maxLength="32" required autoFocus /></label>
          <ChoiceGroup number="02" label="GÊNERO" name="genre" value={form.genre} options={state.world.knownGenres} onChange={update} />
          <ChoiceGroup number="03" label="TEMA" name="theme" value={form.theme} options={THEMES} onChange={update} />
          <ChoiceGroup number="04" label="ESCALA" name="scale" value={form.scale} options={availableScales} onChange={update} />
          <ChoiceGroup number="05" label="PLATAFORMA" name="platform" value={form.platform} options={availablePlatforms} onChange={update} />
          <ChoiceGroup number="06" label="FOCO" name="focus" value={form.focus} options={FOCUSES} onChange={update} />
          <label className="select-field"><span>FRANQUIA PRÓPRIA</span><select value={form.franchiseId} onChange={event => update('franchiseId', event.target.value)}><option value="">Jogo original</option>{franchises.map(item => <option key={item.id} value={item.id}>Continuação de {item.name}</option>)}</select></label>
          <fieldset className="license-picker full-field"><legend>07 · LICENÇAS · ATÉ DUAS</legend>{activeLicenses.length ? <div>{activeLicenses.map(contract => { const ip = licenseFromState(state, contract.licenseId); const selected = form.licenseIds.includes(ip.id); const required = commission?.licenseId === ip.id; return <label key={contract.id} className={selected ? 'is-selected' : ''}><input type="checkbox" checked={selected} onChange={() => toggleLicense(ip.id)} disabled={required || (!selected && form.licenseIds.length >= 2)} /><span><strong>{ip.name}{required ? ' · BRIEF' : ''}</strong><small>{Math.round(contract.royalty * 100)}% · até {contract.expiresYear}</small></span></label> })}</div> : <p>Você ainda não tem direitos contratados. O projeto continua como IP original.</p>} {form.licenseIds.length === 2 && <em>Crossover: alcance maior, duas aprovações e uma margem bem menor.</em>}</fieldset>
          <div className="project-estimate full-field">
            <div><span>PRAZO</span><strong>{scale.months} meses</strong></div>
            <div><span>ORÇAMENTO</span><strong>{formatMoney(estimatedCost)}</strong></div>
            <div><span>CAIXA MÍNIMO</span><strong>{formatMoney(entryCost)}</strong></div>
            {licenseRoyalty > 0 && <div><span>ROYALTIES DE IP</span><strong>{Math.round(licenseRoyalty * 100)}%</strong></div>}
            <p className={state.player.money < entryCost ? 'is-danger' : ''}>{state.player.money < entryCost ? 'O caixa não segura nem o primeiro mês.' : 'É uma previsão. Problema novo costuma cobrar à parte.'}</p>
          </div>
        </div>
        <footer className="modal-actions"><Button type="button" onClick={() => setProjectModalOpen(false)}>CANCELAR</Button><Button type="submit" variant="primary" disabled={state.player.money < entryCost}>ABRIR PROJETO</Button></footer>
      </form>
    </Modal>
  )
}

function ChoiceGroup({ number, label, name, value, options, onChange }) {
  return (
    <fieldset className="choice-field"><legend>{number} · {label}</legend><div className="choice-grid">
      {options.map(option => <label key={option.id} className="choice-chip"><input type="radio" name={name} value={option.id} checked={value === option.id} onChange={() => onChange(name, option.id)} /><span>{option.label}</span></label>)}
    </div></fieldset>
  )
}
