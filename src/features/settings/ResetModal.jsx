import { useGame } from '../../app/GameContext.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { gameModeForId } from '../../game/engine/gameModes.js'
import { CareerSetupForm } from '../onboarding/CareerSetupForm.jsx'

export function ResetModal() {
  const { state, activeSlot, dispatch, resetModalOpen, setResetModalOpen, setView } = useGame()
  const mode = gameModeForId(state.careerMode?.id)
  const reset = options => {
    dispatch({ type: 'RESET_CAREER', options: { ...options, modeId: mode.id } })
    setResetModalOpen(false)
    setView('career')
  }
  const initialOptions = {
    playerName: state.player.name,
    studioName: state.studio.name,
    age: state.player.age,
    startYear: state.meta.startYear,
    traitId: state.player.traitId,
    currency: state.settings.currency,
    modeId: mode.id,
  }
  return (
    <Modal open={resetModalOpen} onClose={() => setResetModalOpen(false)} className="reset-modal" label="Nova carreira">
      <div className="reset-setup">
        <span className="event-tag">SLOT {String(activeSlot).padStart(2, '0')} · {mode.label.toUpperCase()}</span>
        <p className="overline">REINICIAR ESTE SLOT</p>
        <h2>Voltar para a primeira página?</h2>
        <p>Você pode trocar fundador, estúdio, época, perfil inicial e moeda. O modo <strong>{mode.label}</strong> permanece preso a este slot; para trocar de modo, crie outra carreira.</p>
        <CareerSetupForm compact hasExistingSave initialOptions={initialOptions} onSubmit={reset} onCancel={() => setResetModalOpen(false)} />
      </div>
    </Modal>
  )
}
