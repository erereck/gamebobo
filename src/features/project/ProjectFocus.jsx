import { useEffect, useState } from 'react'
import { useGame } from '../../app/GameContext.jsx'
import { FOCUSES, PLATFORMS, SCALES, THEMES, labelOf } from '../../game/data/catalog.js'
import { PROJECT_PHASES, projectPhase, promiseForId } from '../../game/data/projectPromises.js'
import { formatMoney } from '../../game/engine/utils.js'
import { Button } from '../../components/ui/Button.jsx'
import { ProgressBar } from '../../components/ui/ProgressBar.jsx'
import { WorkbenchCard } from '../../components/ui/WorkbenchCard.jsx'
import { licenseFromState } from '../../game/engine/licensing.js'
import { Icon } from '../../components/ui/Icon.jsx'

const AUDIENCE = { casual: 'PÚBLICO AMPLO', hardcore: 'PÚBLICO DE NICHO', balanced: 'PÚBLICO MISTO' }

export function ProjectFocus() {
  const { state, dispatch, setProjectModalOpen } = useGame()
  const project = state.currentProject
  const [editingTitle, setEditingTitle] = useState(false)
  const [draftTitle, setDraftTitle] = useState(project?.title ?? '')
  useEffect(() => setDraftTitle(project?.title ?? ''), [project?.id, project?.title])
  if (!project) {
    return (
      <WorkbenchCard kicker="NA SUA MESA" meta="NADA ABERTO" className="project-focus">
        <div className="project-empty">
          <div className="empty-disk" aria-hidden="true"><span>?</span></div>
          <p className="overline">O PC ESTÁ LIVRE</p>
          <h2>Qual é o próximo?</h2>
          <p>Escolha uma ideia que caiba no caixa. O resto aparece durante o trabalho.</p>
          <Button variant="primary" onClick={() => setProjectModalOpen(true)}>+ NOVO JOGO</Button>
        </div>
      </WorkbenchCard>
    )
  }
  const progress = Math.min(100, Math.round(project.progress / project.totalMonths * 100))
  const phase = projectPhase(project)
  const phaseIndex = PROJECT_PHASES.findIndex(item => item.id === phase)
  const pressure = project.pressure > 65 ? 'CRÍTICA' : project.pressure > 35 ? 'ALTA' : 'CONTROLADA'
  const promise = promiseForId(project.promiseId)
  const playtestCost = Math.max(450, Math.round(SCALES[project.scale].cost * .055))
  return (
    <WorkbenchCard kicker="NA SUA MESA" meta="EM PRODUÇÃO" className="project-focus">
      <div className="project-active">
        <div className="project-title-row">
          <div className="project-title-copy"><p className="overline">{labelOf(state.world.knownGenres, project.genre)} · {labelOf(THEMES, project.theme)} · {labelOf(PLATFORMS, project.platform)}</p>
            {editingTitle ? <form className="project-title-editor" onSubmit={event => { event.preventDefault(); dispatch({ type: 'RENAME_PROJECT', title: draftTitle }); setEditingTitle(false) }}><label className="sr-only" htmlFor="project-title-edit">Novo nome do jogo</label><input id="project-title-edit" value={draftTitle} onChange={event => setDraftTitle(event.target.value)} maxLength={56} autoFocus /><button type="submit">SALVAR</button><button type="button" onClick={() => { setDraftTitle(project.title); setEditingTitle(false) }}>CANCELAR</button></form> : <div className="project-title-display"><h2>{project.title}</h2><button type="button" className="project-edit-button" onClick={() => setEditingTitle(true)} aria-label={`Editar nome de ${project.title}`} title="Editar nome"><Icon name="edit" size={16} /></button></div>}
          </div>
          <span className="phase-stamp">{PROJECT_PHASES[phaseIndex].label}</span>
        </div>
        {project.licenseIds?.length > 0 && <div className="project-rights-line"><span>LICENCIADO</span>{project.licenseIds.map(id => <strong key={id}>{licenseFromState(state, id)?.name}</strong>)}</div>}
        <ol className="phase-rail" aria-label="Etapas do projeto">{PROJECT_PHASES.map((item, index) => <li key={item.id} className={index < phaseIndex ? 'is-done' : index === phaseIndex ? 'is-current' : ''}><span>{index < phaseIndex ? '✓' : index + 1}</span>{item.label}</li>)}</ol>
        <div className="project-promise">
          <span>PROMESSA DA CAPA</span>
          <strong>{promise.label}</strong>
          <p>{promise.pitch}</p>
          <small>{AUDIENCE[project.promiseAudience] ?? AUDIENCE.balanced}{project.scopeMonths ? ` · +${project.scopeMonths} MÊS DE ESCOPO` : ' · ESCOPO SEGURO'}</small>
        </div>
        <div className="progress-copy"><strong>{progress}%</strong><span>{Math.floor(project.progress)} de {project.totalMonths} meses</span></div>
        <ProgressBar value={progress} label={`Progresso de ${project.title}`} />
        <div className="project-readout">
          <div><span>FOCO</span><strong>{labelOf(FOCUSES, project.focus)}</strong></div>
          <div><span>PENDÊNCIAS</span><strong className={(project.bugs ?? 0) >= 6 ? 'is-hot' : ''}>{project.bugs ?? 0}</strong></div>
          <div><span>GASTO</span><strong>{formatMoney(project.costSpent)}</strong></div>
          <div><span>HYPE / PRESSÃO</span><strong>{project.hype} / {pressure}</strong></div>
        </div>
        <PlaytestSlip project={project} phase={phase} cost={playtestCost} money={state.player.money} disabled={state.queue.length > 0} onRun={() => dispatch({ type: 'RUN_PLAYTEST' })} />
      </div>
    </WorkbenchCard>
  )
}

function PlaytestSlip({ project, phase, cost, money, disabled, onRun }) {
  if (project.playtest) return (
    <section className="playtest-slip">
      <header><span>RELATÓRIO DE PLAYTEST</span><strong>{project.playtest.min}–{project.playtest.max}</strong></header>
      <div><p><b>FUNCIONA</b>{project.playtest.strength}</p><p><b>TRAVA</b>{project.playtest.issue}</p></div>
    </section>
  )
  if (phase === 'prototype') return <p className="playtest-locked"><span>PLAYTEST</span> Abre assim que o primeiro protótipo ficar de pé.</p>
  return (
    <section className="playtest-ready">
      <div><span>BUILD JOGÁVEL</span><strong>Quer ouvir gente de fora?</strong><small>Faixa de nota + um problema concreto. Não passa o mês.</small></div>
      <button type="button" onClick={onRun} disabled={disabled || money < cost}>TESTAR · {formatMoney(cost)}</button>
    </section>
  )
}
