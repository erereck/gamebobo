import { useGame } from '../../app/GameContext.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { CareerSetupForm } from '../onboarding/CareerSetupForm.jsx'

export function ResetModal() {
  const { state, dispatch, resetModalOpen, setResetModalOpen, setView } = useGame()
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
        <span className="event-tag">OUTRA LINHA DO TEMPO</span>
        <p className="overline">NOVA CARREIRA</p>
        <h2>Voltar para a primeira página?</h2>
        <p>Você pode trocar fundador, estúdio, época, perfil inicial e moeda antes de substituir o save.</p>
        <CareerSetupForm compact hasExistingSave initialOptions={initialOptions} onSubmit={reset} onCancel={() => setResetModalOpen(false)} />
      </div>
    </Modal>
  )
}
