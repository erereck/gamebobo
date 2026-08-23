import { useEffect, useMemo, useState } from 'react'
import { useGame } from '../../app/GameContext.jsx'
import { FOCUSES, PLATFORMS, SCALES, THEMES } from '../../game/data/catalog.js'
import { platformAtDate } from '../../game/data/platformHistory.js'
import { promiseOptionsFor, promiseScopeMonths } from '../../game/data/projectPromises.js'
import { getFranchises } from '../../game/engine/selectors.js'
import { formatMoney } from '../../game/engine/utils.js'
import { licenseFromState } from '../../game/engine/licensing.js'
import { PROJECT_TYPES, projectTypeForId } from '../../game/data/projectTypes.js'
import { availableAccessories, CONTROL_SCHEMES, supportsMotion } from '../../game/data/hardwareFeatures.js'
import { availableProductionUnits, calculateProjectPlan, projectCapacity, projectCount } from '../../game/engine/production.js'
import { Button } from '../../components/ui/Button.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Icon } from '../../components/ui/Icon.jsx'
import { CompactMultiChoice, CompactSingleChoice } from './CompactMultiChoice.jsx'

const suggestions = ['Cubo de Domingo', 'Neon Futebol', 'Quarto 12', 'Manual do Fim', 'Cidade Baixa', 'Depois da Aula']
const freshForm = () => ({
  title: '', projectType: 'original', genres: ['rpg'], themes: ['fantasy'], focus: 'gameplay', scale: 'small', platforms: ['pc'],
  delegatedPlatformIds: [], productionUnitId: 'founder', promiseId: 'world-to-explore', franchiseId: '', sourceGameIds: [], licenseIds: [], accessoryId: '', controlScheme: 'standard',
})

export function NewProjectModal() {
  const { state, dispatch, projectModalOpen, setProjectModalOpen } = useGame()
  const [form, setForm] = useState(freshForm)
  const [openDropdown, setOpenDropdown] = useState(null)
  const franchises = useMemo(() => getFranchises(state), [state])
  const units = useMemo(() => availableProductionUnits(state), [state])
  const type = projectTypeForId(form.projectType)
  const primaryGenre = form.genres[0]
  const primaryTheme = form.themes[0]
  const scale = SCALES[form.scale]
  const availablePlatforms = PLATFORMS.filter(item => platformAtDate(item, state.date))
  const selectedUnit = units.find(item => item.id === form.productionUnitId)
  const availableScales = Object.values(SCALES).filter(item => selectedUnit?.subsidiaryId
    ? item.id !== 'blockbuster' || selectedUnit.skill >= 82
    : (item.officeLevel ?? 0) <= state.studio.officeLevel && (item.teamSize ?? 0) <= state.studio.team.length)
  const promiseOptions = useMemo(() => promiseOptionsFor({ genre: primaryGenre, focus: form.focus, year: state.date.year, scaleId: form.scale }, 5, form.promiseId), [primaryGenre, form.focus, form.scale, form.promiseId, state.date.year])
  const scopeMonths = promiseScopeMonths(form.promiseId, form.scale)
  const plan = calculateProjectPlan(state, { ...form, genre: primaryGenre, theme: primaryTheme, scopeMonths })
  const entryCost = Math.round((plan?.estimatedCost ?? 0) * .25)
  const activeLicenses = state.licenses.active
  const licenseRoyalty = activeLicenses.filter(item => form.licenseIds.includes(item.licenseId)).reduce((sum, item) => sum + item.royalty, 0)
  const accessories = availableAccessories(form.platforms, state.date.year)
  const motionAvailable = supportsMotion(form.platforms)
  const commission = state.corporate.activeCommission
  const hasCapacity = projectCount(state) < projectCapacity(state) && units.length > 0
  const sourceCountValid = type.requiresSource ? form.sourceGameIds.length === 1 : type.minSources ? form.sourceGameIds.length >= type.minSources && form.sourceGameIds.length <= type.maxSources : true
  const franchiseValid = !type.requiresFranchise || Boolean(form.franchiseId)
  const commissionBlocksParallel = Boolean(commission && state.currentProject)
  const canSubmit = Boolean(form.title.trim() && plan && hasCapacity && selectedUnit && sourceCountValid && franchiseValid && !commissionBlocksParallel && state.player.money >= entryCost)
  const delegationCapacity = Math.floor(state.studio.team.length / 2) + (state.studio.subsidiaries?.length ?? 0)

  useEffect(() => {
    if (!projectModalOpen) return
    const unit = availableProductionUnits(state)[0]
    const genre = commission?.genre ?? 'rpg'
    const recommended = promiseOptionsFor({ genre, focus: 'gameplay', year: state.date.year, scaleId: 'small' }, 1)[0]
    setOpenDropdown(null)
    setForm({
      ...freshForm(),
      title: suggestions[Math.floor(Math.random() * suggestions.length)],
      genres: [genre],
      productionUnitId: unit?.id ?? '',
      promiseId: recommended?.id ?? 'world-to-explore',
      licenseIds: commission ? [commission.licenseId] : [],
    })
  }, [projectModalOpen, commission?.id, state.date.year])

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const closeDropdowns = () => setOpenDropdown(null)
  const setDropdown = (id, isOpen) => setOpenDropdown(current => isOpen ? id : current === id ? null : current)
  const toggleFromList = (key, value, max = 2) => setForm(current => {
    const list = current[key]
    if (list.includes(value)) return list.length === 1 ? current : { ...current, [key]: list.filter(id => id !== value) }
    return list.length >= max ? current : { ...current, [key]: [...list, value] }
  })
  const togglePlatform = id => setForm(current => {
    const selected = current.platforms.includes(id)
    if (selected && current.platforms.length === 1) return current
    if (!selected && current.platforms.length >= 4) return current
    const platforms = selected ? current.platforms.filter(value => value !== id) : [...current.platforms, id]
    const delegatedPlatformIds = current.delegatedPlatformIds.filter(value => platforms.slice(1).includes(value))
    const accessoryId = current.accessoryId && availableAccessories(platforms, state.date.year).some(item => item.id === current.accessoryId) ? current.accessoryId : ''
    const controlScheme = supportsMotion(platforms) ? current.controlScheme : 'standard'
    return { ...current, platforms, delegatedPlatformIds, accessoryId, controlScheme }
  })
  const toggleDelegation = platformId => setForm(current => {
    const selected = current.delegatedPlatformIds.includes(platformId)
    if (!selected && current.delegatedPlatformIds.length >= delegationCapacity) return current
    return { ...current, delegatedPlatformIds: selected ? current.delegatedPlatformIds.filter(id => id !== platformId) : [...current.delegatedPlatformIds, platformId] }
  })
  const toggleLicense = licenseId => setForm(current => ({ ...current, licenseIds: current.licenseIds.includes(licenseId) ? (commission?.licenseId === licenseId ? current.licenseIds : current.licenseIds.filter(id => id !== licenseId)) : current.licenseIds.length < 2 ? [...current.licenseIds, licenseId] : current.licenseIds }))

  const inheritGame = game => setForm(current => {
    const inheritedLicenses = (game.licenseIds ?? []).filter(id => activeLicenses.some(contract => contract.licenseId === id))
    const oldPlatforms = game.platforms?.length ? game.platforms : [game.platform]
    const firstNewPlatform = availablePlatforms.find(platform => !oldPlatforms.includes(platform.id))?.id ?? current.platforms[0]
    return {
      ...current,
      genres: (game.genres?.length ? game.genres : [game.genre]).slice(0, 2),
      themes: (game.themes?.length ? game.themes : [game.theme]).slice(0, 2),
      focus: game.focus,
      promiseId: game.promiseId ?? current.promiseId,
      franchiseId: game.franchiseId ?? current.franchiseId,
      licenseIds: commission ? [commission.licenseId] : inheritedLicenses.slice(0, 2),
      platforms: current.projectType === 'port' ? [firstNewPlatform] : current.platforms,
      delegatedPlatformIds: [],
    }
  })

  const chooseFranchise = franchiseId => {
    const franchise = franchises.find(item => item.id === franchiseId)
    const latest = franchise?.games[0]
    setForm(current => ({ ...current, franchiseId, projectType: franchiseId && current.projectType === 'original' ? 'sequel' : current.projectType }))
    if (latest) inheritGame(latest)
  }

  const chooseType = projectType => setForm(current => ({
    ...current,
    projectType,
    sourceGameIds: [],
    franchiseId: ['sequel', 'spinoff'].includes(projectType) ? current.franchiseId : projectType === 'original' ? '' : current.franchiseId,
    delegatedPlatformIds: [],
  }))

  const toggleSource = game => setForm(current => {
    const collection = current.projectType === 'collection'
    const selected = current.sourceGameIds.includes(game.id)
    let sourceGameIds
    if (!collection) sourceGameIds = selected ? [] : [game.id]
    else if (selected) sourceGameIds = current.sourceGameIds.filter(id => id !== game.id)
    else sourceGameIds = current.sourceGameIds.length >= 4 ? current.sourceGameIds : [...current.sourceGameIds, game.id]
    return { ...current, sourceGameIds }
  })
  const sourceChanged = game => {
    toggleSource(game)
    if (form.projectType !== 'collection') inheritGame(game)
  }
  const platformBlockedByPort = platform => type.id === 'port' && form.sourceGameIds.some(id => {
    const source = state.games.find(game => game.id === id)
    return (source?.platforms?.length ? source.platforms : [source?.platform]).includes(platform.id)
  })

  const submit = event => {
    event.preventDefault()
    if (!canSubmit) return
    dispatch({ type: 'START_PROJECT', payload: { ...form, genre: primaryGenre, theme: primaryTheme } })
    setProjectModalOpen(false)
  }

  return (
    <Modal open={projectModalOpen} onClose={() => setProjectModalOpen(false)} className="project-modal project-modal-expanded" label="Novo projeto">
      <form onSubmit={submit}>
        <header className="modal-titlebar">
          <div><p>ABRIR PROJETO · {projectCount(state)}/{projectCapacity(state)} FRENTES</p><h2>Escolha o que este jogo realmente é.</h2></div>
          <button type="button" className="modal-close" onClick={() => setProjectModalOpen(false)} aria-label="Fechar" title="Fechar"><Icon name="close" size={24} /></button>
        </header>
        <div className="project-form">
          {commission && <section className="commission-brief full-field"><span>{commission.concept?.toUpperCase()} · {commission.monthsLeft} MESES</span><strong>{licenseFromState(state, commission.licenseId)?.name}</strong><p>{commissionBlocksParallel ? 'A encomenda corporativa precisa ocupar a equipe principal antes de abrir outra frente.' : `Gênero e licença vieram no brief · meta ${commission.scoreFloor}.`}</p></section>}
          {!hasCapacity && <section className="commission-brief full-field"><span>CAPACIDADE LOTADA</span><strong>Não existe outro time livre.</strong><p>Monte uma equipe interna maior ou compre um estúdio para abrir outra frente simultânea.</p></section>}
          <label className="text-field full-field"><span>01 · TÍTULO</span><input value={form.title} onChange={event => update('title', event.target.value)} maxLength="56" required autoFocus /></label>

          <CompactSingleChoice number="02" label="TIPO DE PROJETO" value={form.projectType} options={PROJECT_TYPES} onChange={chooseType} descriptions open={openDropdown === 'type'} onOpenChange={isOpen => setDropdown('type', isOpen)} />

          {type.requiresFranchise && <label className="select-field full-field"><span>03 · FRANQUIA</span><select value={form.franchiseId} onFocus={closeDropdowns} onPointerDown={closeDropdowns} onChange={event => chooseFranchise(event.target.value)}><option value="">Selecione uma franquia</option>{franchises.map(item => <option key={item.id} value={item.id}>{item.name} · {item.games.length} jogos · média {item.average}</option>)}</select><small>Ao escolher, gênero, tema, foco, promessa e licenças válidas são puxados do jogo anterior.</small></label>}

          {(type.requiresSource || type.minSources) && <SourcePicker games={state.games} selectedIds={form.sourceGameIds} collection={type.id === 'collection'} onToggle={sourceChanged} />}

          <CompactMultiChoice number="04" label="GÊNEROS · ATÉ 2" value={form.genres} options={state.world.knownGenres} onToggle={id => toggleFromList('genres', id)} max={2} open={openDropdown === 'genres'} onOpenChange={isOpen => setDropdown('genres', isOpen)} />
          <CompactMultiChoice number="05" label="TEMAS · ATÉ 2" value={form.themes} options={THEMES} onToggle={id => toggleFromList('themes', id)} max={2} open={openDropdown === 'themes'} onOpenChange={isOpen => setDropdown('themes', isOpen)} />
          <ChoiceGroup number="06" label="FOCO" name="focus" value={form.focus} options={FOCUSES} onChange={update} onDropdownOpen={closeDropdowns} />
          <PromisePicker options={promiseOptions} value={form.promiseId} genre={primaryGenre} focus={form.focus} scaleId={form.scale} onChange={value => update('promiseId', value)} />
          <ChoiceGroup number="08" label="ESCALA" name="scale" value={form.scale} options={availableScales} onChange={update} onDropdownOpen={closeDropdowns} />

          <CompactMultiChoice
            number="09"
            label="PLATAFORMAS · ATÉ 4"
            value={form.platforms}
            options={availablePlatforms}
            onToggle={togglePlatform}
            max={4}
            fullField
            isOptionDisabled={platformBlockedByPort}
            note="A primeira marcada é a plataforma principal. Cada extra amplia mercado e escopo."
            open={openDropdown === 'platforms'}
            onOpenChange={isOpen => setDropdown('platforms', isOpen)}
          />

          {form.platforms.length > 1 && <fieldset className="delegation-picker full-field"><legend>10 · PORTS PARALELOS</legend><p>Delegar reduz o atraso do multiplataforma. Capacidade atual: {delegationCapacity}.</p><div>{form.platforms.slice(1).map(id => {
            const platform = PLATFORMS.find(item => item.id === id)
            return <label key={id}><input type="checkbox" checked={form.delegatedPlatformIds.includes(id)} disabled={!form.delegatedPlatformIds.includes(id) && form.delegatedPlatformIds.length >= delegationCapacity} onChange={() => toggleDelegation(id)} /><span><strong>{platform?.label}</strong><small>{form.delegatedPlatformIds.includes(id) ? 'delegado' : 'feito pela mesma equipe'}</small></span></label>
          })}</div></fieldset>}

          <label className="select-field"><span>11 · EQUIPE DE PRODUÇÃO</span><select value={form.productionUnitId} onFocus={closeDropdowns} onPointerDown={closeDropdowns} onChange={event => update('productionUnitId', event.target.value)}>{units.map(unit => <option key={unit.id} value={unit.id}>{unit.name} · força {unit.skill}</option>)}</select><small>{state.currentProject ? 'Times secundários progridem sozinhos a cada mês.' : 'A primeira frente sempre usa a equipe principal.'}</small></label>

          <label className="select-field"><span>12 · ACESSÓRIO</span><select value={form.accessoryId} onFocus={closeDropdowns} onPointerDown={closeDropdowns} onChange={event => update('accessoryId', event.target.value)}><option value="">Nenhum</option>{accessories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><small>{form.accessoryId ? accessories.find(item => item.id === form.accessoryId)?.copy : 'Somente periféricos relevantes da plataforma e da época aparecem aqui.'}</small></label>

          {motionAvailable && <label className="select-field"><span>13 · CONTROLES DE MOVIMENTO</span><select value={form.controlScheme} onFocus={closeDropdowns} onPointerDown={closeDropdowns} onChange={event => update('controlScheme', event.target.value)}>{CONTROL_SCHEMES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select><small>No Wii, por exemplo, movimento pode ser obrigatório, opcional ou ignorado.</small></label>}

          {!type.requiresFranchise && <label className="select-field"><span>FRANQUIA PRÓPRIA</span><select value={form.franchiseId} onFocus={closeDropdowns} onPointerDown={closeDropdowns} onChange={event => chooseFranchise(event.target.value)}><option value="">Nova franquia</option>{franchises.map(item => <option key={item.id} value={item.id}>Usar {item.name}</option>)}</select><small>Útil para remake, remaster, port e coletânea ligados a uma série existente.</small></label>}

          <LicensePicker state={state} activeLicenses={activeLicenses} selectedIds={form.licenseIds} commission={commission} onToggle={toggleLicense} />

          <div className="project-estimate full-field">
            <div><span>PRAZO</span><strong>{plan?.totalMonths ?? '—'} meses</strong></div>
            <div><span>ORÇAMENTO</span><strong>{plan ? formatMoney(plan.estimatedCost) : '—'}</strong></div>
            <div><span>CAIXA MÍNIMO</span><strong>{formatMoney(entryCost)}</strong></div>
            <div><span>PLATAFORMAS</span><strong>{form.platforms.length}</strong></div>
            {licenseRoyalty > 0 && <div><span>ROYALTIES DE IP</span><strong>{Math.round(licenseRoyalty * 100)}%</strong></div>}
            <p className={!canSubmit ? 'is-danger' : ''}>{!sourceCountValid ? type.id === 'collection' ? 'A coletânea precisa de 2 a 4 jogos.' : 'Escolha o jogo-base.' : !franchiseValid ? 'Escolha a franquia.' : !hasCapacity ? 'Todos os times estão ocupados.' : commissionBlocksParallel ? 'A encomenda atual precisa da equipe principal.' : state.player.money < entryCost ? 'O caixa não segura nem a entrada do projeto.' : `Plano: ${type.label.toLowerCase()}, ${form.genres.length} gênero${form.genres.length > 1 ? 's' : ''}, ${form.platforms.length} plataforma${form.platforms.length > 1 ? 's' : ''}.`}</p>
          </div>
        </div>
        <footer className="modal-actions"><Button type="button" onClick={() => setProjectModalOpen(false)}>CANCELAR</Button><Button type="submit" variant="primary" disabled={!canSubmit}>ABRIR PROJETO</Button></footer>
      </form>
    </Modal>
  )
}

function ChoiceGroup({ number, label, name, value, options, onChange, descriptions = false, onDropdownOpen }) {
  return <fieldset className="choice-field"><legend>{number} · {label}</legend><select className="choice-select-mobile" aria-label={`${number} · ${label}`} value={value} onFocus={onDropdownOpen} onPointerDown={onDropdownOpen} onChange={event => onChange(name, event.target.value)}>{options.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select><div className="choice-grid">{options.map(option => <label key={option.id} className="choice-chip"><input type="radio" name={name} value={option.id} checked={value === option.id} onChange={() => onChange(name, option.id)} /><span>{option.label}{descriptions && option.description ? <small>{option.description}</small> : null}</span></label>)}</div></fieldset>
}

function SourcePicker({ games, selectedIds, collection, onToggle }) {
  return <fieldset className="source-picker full-field"><legend>03 · {collection ? 'JOGOS DA COLETÂNEA · 2 A 4' : 'JOGO-BASE'}</legend>{games.length ? <div>{games.slice(0, 30).map(game => <label key={game.id} className={selectedIds.includes(game.id) ? 'is-selected' : ''}><input type={collection ? 'checkbox' : 'radio'} name={collection ? undefined : 'sourceGame'} checked={selectedIds.includes(game.id)} disabled={collection && !selectedIds.includes(game.id) && selectedIds.length >= 4} onChange={() => onToggle(game)} /><span><strong>{game.title}</strong><small>{game.released} · nota {game.score} · {(game.platforms ?? [game.platform]).map(id => PLATFORMS.find(platform => platform.id === id)?.label ?? id).join(' + ')}</small></span></label>)}</div> : <p>Você precisa ter um jogo lançado para usar este formato.</p>}</fieldset>
}

function PromisePicker({ options, value, genre, focus, scaleId, onChange }) {
  return <fieldset className="promise-picker full-field"><legend>07 · PROMESSA DA CAPA</legend><p>Escolha o que este jogo precisa cumprir. As opções mais naturais vêm primeiro.</p><div>{options.map((option, index) => {
    const scopeMonths = promiseScopeMonths(option.id, scaleId)
    return <label key={option.id} className={value === option.id ? 'is-selected' : ''}><input type="radio" name="promiseId" value={option.id} checked={value === option.id} onChange={() => onChange(option.id)} /><span><small>{index === 0 ? 'RECOMENDADA' : 'OPÇÃO'}</small><strong>{option.label}</strong><em>{option.pitch}</em><b>{scopeMonths ? `ESCOPO +${scopeMonths} MÊS${scopeMonths > 1 ? 'ES' : ''}` : 'ESCOPO SEGURO'}</b></span></label>
  })}</div></fieldset>
}

function LicensePicker({ state, activeLicenses, selectedIds, commission, onToggle }) {
  return <fieldset className="license-picker full-field"><legend>14 · LICENÇAS · ATÉ DUAS</legend>{activeLicenses.length ? <div>{activeLicenses.map(contract => {
    const ip = licenseFromState(state, contract.licenseId)
    const selected = selectedIds.includes(ip.id)
    const required = commission?.licenseId === ip.id
    return <label key={contract.id} className={selected ? 'is-selected' : ''}><input type="checkbox" checked={selected} onChange={() => onToggle(ip.id)} disabled={required || (!selected && selectedIds.length >= 2)} /><span><strong>{ip.name}{required ? ' · BRIEF' : ''}</strong><small>{Math.round(contract.royalty * 100)}% · até {contract.expiresYear}</small></span></label>
  })}</div> : <p>Você ainda não tem direitos contratados. O projeto continua como IP original.</p>}{selectedIds.length === 2 && <em>Crossover: alcance maior, duas aprovações e uma margem bem menor.</em>}</fieldset>
}
