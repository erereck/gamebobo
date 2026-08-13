import { useMemo, useState } from 'react'
import { useGame } from '../app/GameContext.jsx'
import { availableSalesDecades, decadeOf, getAllTimeChart, getChartSummary, getDecadeChart } from '../game/engine/charts.js'
import { SALES_SOURCES } from '../game/data/salesHistory.js'

const units = value => value >= 100 ? `${value.toFixed(0)} mi` : value >= 10 ? `${value.toFixed(1)} mi` : `${value.toFixed(2)} mi`
const sourceLabel = { archive: 'ARQUIVO', player: 'VOCÊ', cohort: 'TURMA DO ANO', rival: 'LINHA ALTERNATIVA' }

export function ChartsScreen() {
  const { state } = useGame()
  const decades = availableSalesDecades(state)
  const currentDecade = decadeOf(state.date.year)
  const [selectedDecade, setSelectedDecade] = useState(currentDecade)
  const [mode, setMode] = useState('decade')
  const safeDecade = decades.includes(selectedDecade) ? selectedDecade : decades.at(-1)
  const chart = useMemo(() => mode === 'all' ? getAllTimeChart(state) : getDecadeChart(state, safeDecade), [state, mode, safeDecade])
  const summary = useMemo(() => getChartSummary(state), [state])
  const leader = chart[0]
  const cohort = state.competitors.filter(item => item.cohort)
  const maxSales = Math.max(...chart.map(item => item.salesNow), 1)

  return (
    <section className="screen charts-screen" aria-labelledby="charts-title">
      <header className="screen-heading"><div><p className="overline">CÓPIAS, CAUDA E ACIDENTES HISTÓRICOS</p><h2 id="charts-title">Parada de milhões</h2></div><p>O arquivo real é o chão. Sua linha do tempo pode pisar em cima dele.</p></header>
      <section className="chart-hero">
        <div className="chart-hero-rank"><span>Nº</span><strong>01</strong><small>{mode === 'all' ? 'DE TODOS OS TEMPOS' : `DA DÉCADA DE ${safeDecade}`}</small></div>
        <div className="chart-hero-title"><span>{leader ? sourceLabel[leader.source] : 'SEM DADOS'}</span><h3>{leader?.title ?? 'As prateleiras ainda estão vazias'}</h3><p>{leader ? `${leader.studio} · ${leader.year} · ${leader.platform}` : 'Avance o calendário para a parada começar.'}</p></div>
        <div className="chart-hero-sales"><small>VENDAS ACUMULADAS</small><strong>{leader ? units(leader.salesNow) : '—'}</strong><span>{leader?.figureType === 'estimate' ? 'ESTIMATIVA EDITORIAL' : leader?.source === 'archive' ? 'NÚMERO REPORTADO' : 'SIMULAÇÃO DA RUN'}</span></div>
      </section>
      <section className="chart-control-strip">
        <div className="chart-mode"><button type="button" className={mode === 'decade' ? 'is-active' : ''} onClick={() => setMode('decade')}>POR DÉCADA</button><button type="button" className={mode === 'all' ? 'is-active' : ''} onClick={() => setMode('all')}>TODOS OS TEMPOS</button></div>
        <div className="chart-decades" aria-label="Escolher década">{decades.map(decade => <button type="button" key={decade} disabled={mode === 'all'} className={mode === 'decade' && safeDecade === decade ? 'is-active' : ''} onClick={() => { setSelectedDecade(decade); setMode('decade') }}>{decade}s</button>)}</div>
      </section>
      <div className="chart-layout">
        <section className="sales-roll" aria-label="Top 20 de vendas">
          <header><span>POS.</span><span>JOGO / ESTÚDIO</span><span>ANO</span><span>CÓPIAS</span></header>
          {chart.map(item => <article key={`${item.source}-${item.id}`} className={`chart-row is-${item.source} ${item.breakout ? 'is-breakout' : ''}`}><b>{String(item.rank).padStart(2, '0')}</b><div><span>{sourceLabel[item.source]}{item.breakout ? ' · ESTOURO' : ''}</span><strong>{item.title}</strong><small>{item.studio} · {item.platform}</small><i style={{ width: `${Math.max(2, item.salesNow / maxSales * 100)}%` }} /></div><time>{item.year}</time><em>{units(item.salesNow)}{item.figureType === 'estimate' ? '*' : ''}</em></article>)}
          {chart.length < 20 && Array.from({ length: 20 - chart.length }, (_, index) => <article className="chart-row is-empty" key={`empty-${index}`}><b>{String(chart.length + index + 1).padStart(2, '0')}</b><div><strong>—</strong><small>posição ainda sem registro</small></div><time>—</time><em>—</em></article>)}
          <footer><span>* estimativa editorial; números reportados podem usar critérios diferentes.</span>{mode === 'decade' && <a href={SALES_SOURCES[safeDecade]} target="_blank" rel="noreferrer">FONTE DO RETRATO ↗</a>}</footer>
        </section>
        <aside className="chart-sidebar">
          <section className="million-club"><span>CLUBE DO MILHÃO</span><strong>{summary.millionSellers}</strong><p>jogos atravessaram 1 milhão nesta linha do tempo</p><dl><div><dt>Seu melhor lugar</dt><dd>{summary.playerBest ? `#${summary.playerBest}` : '—'}</dd></div><div><dt>Melhor da turma</dt><dd>{summary.cohortBest ? `#${summary.cohortBest}` : '—'}</dd></div></dl></section>
          <section className="chart-legend"><strong>COMO LER</strong><p><i className="legend-player" /> seu catálogo</p><p><i className="legend-cohort" /> estúdio que começou com você</p><p><i className="legend-archive" /> jogo do arquivo histórico</p><p><i className="legend-rival" /> lançamento alternativo</p></section>
          <p className="chart-note">Vendas históricas entram aos poucos: 55% no primeiro ano e o restante pela cauda. Um clássico não nasce com seu lifetime pronto.</p>
        </aside>
      </div>
      <section className="cohort-tape">
        <header><div><p className="overline">A TURMA QUE ABRIU A PORTA COM VOCÊ</p><h3>Classe de {state.meta.startYear}</h3></div><span>NINGUÉM RECEBE ROTEIRO</span></header>
        <div>{cohort.map(studio => { const best = [...studio.games].sort((a, b) => b.sales - a.sales)[0]; return <article key={studio.id} className={studio.status === 'estourou' ? 'is-breakout' : ''}><span>{studio.status.toUpperCase()}</span><h4>{studio.name}</h4><p>{studio.voice}</p><dl><div><dt>Lançamentos</dt><dd>{studio.games.length}</dd></div><div><dt>Reputação</dt><dd>{studio.reputation}</dd></div></dl>{best ? <footer><small>MAIOR JOGO</small><strong>{best.title}</strong><em>{units(best.sales / 1000000)}</em></footer> : <footer><small>AINDA FAZENDO O PRIMEIRO</small><strong>Sem lançamento</strong><em>—</em></footer>}</article> })}</div>
      </section>
    </section>
  )
}
