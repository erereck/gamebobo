import { useState } from 'react'
import { useGame } from '../../app/GameContext.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { formatMoney } from '../../game/engine/utils.js'
import { dateLabel } from '../../game/engine/world.js'
import { VERSION_INFO as versionInfo } from '../../version.js'
import { CareerSetupForm } from './CareerSetupForm.jsx'

export function StartScreen() {
  const { state: savedCareer, startCareer, continueCareer } = useGame()
  const [showSetup, setShowSetup] = useState(!savedCareer)

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
          <div className="cover-disk" aria-hidden="true"><span>GB</span><i>?</i></div>
          <footer><span>SAVE LOCAL</span><span>SEM CONTA</span><span>LINHA DO TEMPO ÚNICA</span></footer>
        </section>

        <section className="start-file">
          {savedCareer && !showSetup ? (
            <div className="continue-sheet">
              <span className="file-tab">SAVE ENCONTRADO</span>
              <p className="overline">ÚLTIMA EDIÇÃO</p>
              <h2>{savedCareer.studio.name}</h2>
              <p className="continue-founder">{savedCareer.player.name}, {savedCareer.player.age} · {dateLabel(savedCareer.date)}</p>
              <dl><div><dt>CAIXA</dt><dd>{formatMoney(savedCareer.player.money, savedCareer.settings.currency)}</dd></div><div><dt>JOGOS</dt><dd>{savedCareer.games.length}</dd></div><div><dt>REPUTAÇÃO</dt><dd>{savedCareer.player.reputation}/100</dd></div><div><dt>COMEÇOU EM</dt><dd>{savedCareer.meta.startYear}</dd></div></dl>
              <p className="continue-note">Este save mora somente neste navegador. Continuar não altera nada até sua próxima decisão.</p>
              <Button variant="primary" onClick={continueCareer}>CONTINUAR CARREIRA</Button>
              <button type="button" className="start-new-link" onClick={() => setShowSetup(true)}>ou começar outra linha do tempo</button>
            </div>
          ) : (
            <div className="setup-sheet">
              <span className="file-tab">FICHA DE INSCRIÇÃO</span>
              <div className="setup-heading"><p className="overline">ANTES DO PRIMEIRO JOGO</p><h2>Quem está abrindo essa porta?</h2><p>Esses dados passam a fazer parte do histórico da carreira.</p></div>
              <CareerSetupForm hasExistingSave={Boolean(savedCareer)} onSubmit={startCareer} onCancel={savedCareer ? () => setShowSetup(false) : undefined} />
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
