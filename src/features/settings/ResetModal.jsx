import { useState } from 'react'
import { useGame } from '../../app/GameContext.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Modal } from '../../components/ui/Modal.jsx'

export function ResetModal() {
  const { dispatch, resetModalOpen, setResetModalOpen, setView } = useGame()
  const [startYear, setStartYear] = useState(2003)
  const reset = () => {
    dispatch({ type: 'RESET_CAREER', startYear })
    setResetModalOpen(false)
    setView('career')
  }
  return (
    <Modal open={resetModalOpen} onClose={() => setResetModalOpen(false)} className="reset-modal" label="Nova carreira">
      <div className="decision-sheet career-reset"><span className="event-tag">NOVA CARREIRA</span><p className="overline">OUTRA LINHA DO TEMPO</p><h2>Em que ano começa a garagem?</h2><p className="decision-body">Escolha qualquer ano de 1980 a 2020. Plataformas, empresas e marcos históricos entram no calendário na data correspondente.</p><div className="decade-picker">{[1980, 1990, 2000, 2010, 2020].map(year => <button key={year} type="button" className={Math.floor(startYear / 10) * 10 === year ? 'is-active' : ''} onClick={() => setStartYear(year)}>{year}s</button>)}</div><label className="year-picker"><span>ANO EXATO</span><input type="range" min="1980" max="2020" value={startYear} onChange={event => setStartYear(Number(event.target.value))} /><strong>{startYear}</strong></label><p className="save-warning">Esta ação substitui o save atual deste navegador.</p><div className="modal-actions"><Button onClick={() => setResetModalOpen(false)}>CANCELAR</Button><Button variant="primary" onClick={reset}>COMEÇAR EM {startYear}</Button></div></div>
    </Modal>
  )
}
