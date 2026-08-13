import { useGame } from '../../app/GameContext.jsx'
import { SCALES, STATS } from '../../game/data/catalog.js'
import { MONTH_NAMES } from '../../game/engine/world.js'
import { WorkbenchCard } from '../../components/ui/WorkbenchCard.jsx'
import { formatMoney } from '../../game/engine/utils.js'
import { phaseForId, projectPhase } from '../../game/data/projectPromises.js'

export function MonthActions() {
  const { state, dispatch, setProjectModalOpen } = useGame()
  const project = state.currentProject
  const promoteCost = project ? Math.round(1200 + SCALES[project.scale].cost * 0.06) : 0
  const weakest = [...STATS].sort((a, b) => state.player.stats[a.id] - state.player.stats[b.id])[0]
  const currentPhase = project ? phaseForId(projectPhase(project)) : null
  const actions = state.currentContract ? [
    { key: 'C', title: `Entregar ${state.currentContract.title}`, detail: `${state.currentContract.monthsLeft} meses restantes`, effect: `+${formatMoney(state.currentContract.pay)}`, action: 'contract' },
    { key: 'D', title: 'Descansar', detail: 'O contrato espera um mês', effect: '-ESTRESSE', action: 'rest' },
  ] : project ? [
    { key: 'A', title: currentPhase.action, detail: currentPhase.detail, effect: currentPhase.effect, action: 'develop', disabled: state.player.energy < 8 },
    ...(project.announced ? [{ key: 'M', title: 'Divulgar o jogo', detail: `Custa ${formatMoney(promoteCost)}`, effect: '+5–16 HYPE · +3 PRESSÃO', action: 'promote', disabled: state.player.money < promoteCost }] : []),
    { key: 'F', title: 'Pegar um freelance', detail: 'O projeto fica parado', effect: '+CAIXA · −19 EN', action: 'work', disabled: state.player.energy < 15 },
    { key: 'D', title: 'Descansar', detail: 'O prazo anda sem você', effect: '+30–44 EN', action: 'rest' },
  ] : [
    { key: 'N', title: 'Abrir projeto', detail: 'Escolher o próximo jogo', effect: 'CRIAR', action: 'new' },
    { key: 'T', title: 'Trabalhar', detail: 'Freelance e assistência', effect: '+CAIXA · −14 EN', action: 'work', disabled: state.player.energy < 15 },
    { key: 'E', title: `Estudar ${weakest.label.toLowerCase()}`, detail: `${formatMoney(900)} e um mês`, effect: '+3–6 ATRIBUTO', action: 'study', stat: weakest.id, disabled: state.player.money < 900 },
    { key: 'P', title: 'Pesquisar tecnologia', detail: `${formatMoney(1800)} e um mês`, effect: '+7–12 PESQ.', action: 'research', disabled: state.player.money < 1800 },
    { key: 'D', title: 'Descansar', detail: 'Dormir em horário normal', effect: '+30–44 EN', action: 'rest' },
  ]
  const act = item => item.action === 'new' ? setProjectModalOpen(true) : dispatch({ type: 'MONTH_ACTION', payload: { action: item.action, stat: item.stat } })
  return (
    <WorkbenchCard kicker="ESTE MÊS" meta="ESCOLHA UMA" className="month-card">
      <h2>{project ? `Como tocar ${project.title}?` : `O que fazer em ${MONTH_NAMES[state.date.month]}?`}</h2>
      <div className="month-actions">{actions.map(item => (
        <button type="button" key={item.action} disabled={item.disabled || state.queue.length > 0} onClick={() => act(item)}>
          <span className="action-key">{item.key}</span><span><strong>{item.title}</strong><small>{item.detail}</small></span><em>{item.effect}</em>
        </button>
      ))}</div>
    </WorkbenchCard>
  )
}
