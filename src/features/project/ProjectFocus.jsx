import { useEffect, useState } from 'react'
import { useGame } from '../../app/GameContext.jsx'
import { FOCUSES, PLATFORMS, THEMES, labelOf } from '../../game/data/catalog.js'
import { formatMoney } from '../../game/engine/utils.js'
import { Button } from '../../components/ui/Button.jsx'
import { ProgressBar } from '../../components/ui/ProgressBar.jsx'
import { WorkbenchCard } from '../../components/ui/WorkbenchCard.jsx'
import { licenseFromState } from '../../game/engine/licensing.js'

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
  const phase = progress < 30 ? 'PROTÓTIPO' : progress < 72 ? 'PRODUÇÃO' : 'FECHAMENTO'
  const pressure = project.pressure > 65 ? 'CRÍTICA' : project.pressure > 35 ? 'ALTA' : 'CONTROLADA'
  return (
    <WorkbenchCard kicker="NA SUA MESA" meta="EM PRODUÇÃO" className="project-focus">
      <div className="project-active">
        <div className="project-title-row">
          <div className="project-title-copy"><p className="overline">{labelOf(state.world.knownGenres, project.genre)} · {labelOf(THEMES, project.theme)} · {labelOf(PLATFORMS, project.platform)}</p>
            {editingTitle ? <form className="project-title-editor" onSubmit={event => { event.preventDefault(); dispatch({ type: 'RENAME_PROJECT', title: draftTitle }); setEditingTitle(false) }}><label className="sr-only" htmlFor="project-title-edit">Novo nome do jogo</label><input id="project-title-edit" value={draftTitle} onChange={event => setDraftTitle(event.target.value)} maxLength={56} autoFocus /><button type="submit">SALVAR</button><button type="button" onClick={() => { setDraftTitle(project.title); setEditingTitle(false) }}>CANCELAR</button></form> : <div className="project-title-display"><h2>{project.title}</h2><button type="button" onClick={() => setEditingTitle(true)} aria-label={`Editar nome de ${project.title}`}>EDITAR NOME</button></div>}
          </div>
          <span className="phase-stamp">{phase}</span>
        </div>
        {project.licenseIds?.length > 0 && <div className="project-rights-line"><span>LICENCIADO</span>{project.licenseIds.map(id => <strong key={id}>{licenseFromState(state, id)?.name}</strong>)}</div>}
        <div className="progress-copy"><strong>{progress}%</strong><span>{Math.floor(project.progress)} de {project.totalMonths} meses</span></div>
        <ProgressBar value={progress} label={`Progresso de ${project.title}`} />
        <div className="project-readout">
          <div><span>FOCO</span><strong>{labelOf(FOCUSES, project.focus)}</strong></div>
          <div><span>GASTO</span><strong>{formatMoney(project.costSpent)}</strong></div>
          <div><span>HYPE / PRESSÃO</span><strong>{project.hype} / {pressure}</strong></div>
        </div>
        <p className="project-note">{project.publisher ? `${project.publisher.name} está cobrando uma data.` : project.story ? `Nota no caderno: ${project.story}.` : progress < 30 ? 'Ainda há mais hipótese que jogo.' : project.announced ? 'Agora tem gente acompanhando cada atraso.' : 'A lista de tarefas cresce no mesmo ritmo da build.'}</p>
      </div>
    </WorkbenchCard>
  )
}
