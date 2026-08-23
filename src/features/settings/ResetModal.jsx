import { useGame } from '../../app/GameContext.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { CareerSetupForm } from '../onboarding/CareerSetupForm.jsx'

export function ResetModal() {
  const { state, activeSlot, dispatch, resetModalOpen, setResetModalOpen, setView } = useGame()
  const reset = options => {
    dispatch({ type: 'RESET_CAREER', options })
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
  }
  return (
    <Modal open={resetModalOpen} onClose={() => setResetModalOpen(false)} className="reset-modal" label="Nova carreira">
      <div className="reset-setup">
        <span className="event-tag">SLOT {String(activeSlot).padStart(2, '0')} · OUTRA LINHA DO TEMPO</span>
        <p className="overline">REINICIAR ESTE SLOT</p>
        <h2>Voltar para a primeira página?</h2>
        <p>Você pode trocar fundador, estúdio, época, perfil inicial e moeda. Somente este slot será substituído; os outros saves permanecem intactos.</p>
        <CareerSetupForm compact hasExistingSave initialOptions={initialOptions} onSubmit={reset} onCancel={() => setResetModalOpen(false)} />
      </div>
    </Modal>
  )
}
