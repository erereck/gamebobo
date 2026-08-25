import { useEffect, useMemo, useState } from 'react'
import { useGame } from '../../app/GameContext.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { formatMoney } from '../../game/engine/utils.js'
import { dateLabel } from '../../game/engine/world.js'
import { gameModeForId } from '../../game/engine/gameModes.js'
import { VERSION_INFO as versionInfo } from '../../version.js'
import { CareerSetupForm } from './CareerSetupForm.jsx'
import { GameModeSelect } from './GameModeSelect.jsx'

export function StartScreen() {
  const { activeSlot, saveSlots, startCareer, continueCareer, deleteCareer } = useGame()
  const [selectedId, setSelectedId] = useState(activeSlot)
  const [setupStep, setSetupStep] = useState('closed')
  const [modeId, setModeId] = useState('traditional')
  const selected = useMemo(() => saveSlots.find(slot => slot.id === selectedId) ?? saveSlots[0], [saveSlots, selectedId])
  const usedSlots = saveSlots.filter(slot => !slot.empty).length

  useEffect(() => {
    if (!saveSlots.some(slot => slot.id === selectedId)) setSelectedId(activeSlot)
  }, [activeSlot, saveSlots, selectedId])

  const selectSlot = slotId => {
    setSelectedId(slotId)
    setSetupStep('closed')
    setModeId('traditional')
  }

  const removeSelected = () => {
    if (!selected || selected.empty) return
    if (!window.confirm(`Apagar definitivamente o slot ${String(selected.id).padStart(2, '0')} (${selected.studioName})?`)) return
    deleteCareer(selected.id)
    setSetupStep('closed')
  }

  const beginSetup = () => {
    setModeId('traditional')
    setSetupStep('mode')
  }

  const selectedMode = gameModeForId(modeId)

  return (
    <main className="start-screen">
      <header className="start-brand">
        <div className="brand-lockup" aria-label="Gamebobo"><div className="brand-disk" aria-hidden="true"><span>GB</span></div><div><h1>GAMEBOBO</h1><p>um jogo sobre fazer jogos</p></div></div>
        <span>v{versionInfo.version} · {versionInfo.codename}</span>
      </header>
      <div className="start-desk">
        <section className="start-cover" aria-labelledby="start-title">
          <div className="cover-issue"><span>EDIÇÃO ZERO</span><strong>1980—2020</strong></div>
          <p className="overline">UMA CARREIRA INTEIRA CABE AQUI</p>
          <h2 id="start-title">Faça jogos.<br />Aguente o resto.</h2>
          <p>Comece num quarto, atravesse gerações e deixe uma indústria diferente daquela que encontrou.</p>
          <div className="cover-disk" aria-hidden="true"><span>GB</span><i>10</i></div>
          <footer><span>SAVE LOCAL</span><span>SEM CONTA</span><span>10 LINHAS DO TEMPO</span></footer>
        </section>

        <section className="start-file save-manager">
          <div className="save-manager-sheet">
            <span className="file-tab">ARQUIVO · {usedSlots}/10</span>
            <div className="save-manager-heading"><p className="overline">ESCOLHA UMA LINHA DO TEMPO</p><h2>Seus saves.</h2><p>Cada slot é independente. O autosave grava somente na carreira aberta.</p></div>

            <div className="save-slot-grid" aria-label="Slots de save">
              {saveSlots.map(slot => {
                const mode = slot.empty ? null : gameModeForId(slot.modeId)
                return <button key={slot.id} type="button" className={`save-slot ${slot.id === selected?.id ? 'is-selected' : ''} ${slot.empty ? 'is-empty' : ''}`} onClick={() => selectSlot(slot.id)}>
                  <span>SLOT {String(slot.id).padStart(2, '0')}</span>
                  {slot.empty ? <><strong>VAZIO</strong><small>nova linha do tempo</small></> : <><strong>{slot.studioName}</strong><small>{slot.playerName} · {dateLabel({ year: slot.year, month: slot.month })}</small><em>{mode.label} · {slot.games} jogos · rep. {slot.reputation}</em></>}
                </button>
              })}
            </div>

            {selected?.empty && setupStep === 'mode' ? (
              <div className="slot-setup mode-step">
                <div className="slot-detail-title"><span>NOVO SAVE · SLOT {String(selected.id).padStart(2, '0')}</span><strong>Primeiro, escolha as regras.</strong></div>
                <GameModeSelect value={modeId} onChange={setModeId} onContinue={() => setSetupStep('details')} onCancel={() => setSetupStep('closed')} />
              </div>
            ) : selected?.empty && setupStep === 'details' ? (
              <div className="slot-setup">
                <div className="slot-detail-title"><span>NOVO SAVE · {selectedMode.label.toUpperCase()}</span><strong>Quem está abrindo essa porta?</strong></div>
                <CareerSetupForm initialOptions={{ modeId }} hasExistingSave={false} onSubmit={options => startCareer({ ...options, modeId }, selected.id)} onCancel={() => setSetupStep('mode')} />
              </div>
            ) : selected?.empty ? (
              <div className="slot-detail is-empty">
                <span>SLOT {String(selected.id).padStart(2, '0')} · DISPONÍVEL</span>
                <h2>Nenhuma carreira aqui.</h2>
                <p>Começar neste espaço não toca em nenhum dos outros {usedSlots} save{usedSlots === 1 ? '' : 's'}. Antes dos nomes e do ano, você escolhe que tipo de carreira este save vai ser.</p>
                <Button variant="primary" onClick={beginSetup}>CRIAR CARREIRA NESTE SLOT</Button>
              </div>
            ) : selected ? (
              <div className="slot-detail">
                <span>SLOT {String(selected.id).padStart(2, '0')} · {gameModeForId(selected.modeId).label.toUpperCase()}</span>
                <h2>{selected.studioName}</h2>
                <p className="continue-founder">{selected.playerName} · {dateLabel({ year: selected.year, month: selected.month })}</p>
                <dl><div><dt>CAIXA</dt><dd>{formatMoney(selected.money, selected.currency)}</dd></div><div><dt>JOGOS</dt><dd>{selected.games}</dd></div><div><dt>REPUTAÇÃO</dt><dd>{selected.reputation}/100</dd></div><div><dt>COMEÇOU EM</dt><dd>{selected.startYear}</dd></div></dl>
                <p className="continue-note">Modo: <strong>{gameModeForId(selected.modeId).label}</strong> · {gameModeForId(selected.modeId).description}</p>
                <div className="slot-detail-actions"><Button onClick={removeSelected}>APAGAR SLOT</Button><Button variant="primary" onClick={() => continueCareer(selected.id)}>CONTINUAR CARREIRA</Button></div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  )
}
