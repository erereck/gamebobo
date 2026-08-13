import { useGame } from '../app/GameContext.jsx'
import { FOCUSES, PLATFORMS, labelOf } from '../game/data/catalog.js'
import { getFranchises } from '../game/engine/selectors.js'
import { formatMoney, formatNumber } from '../game/engine/utils.js'
import { Button } from '../components/ui/Button.jsx'
import { licenseFromState } from '../game/engine/licensing.js'

export function ProjectsScreen() {
  const { state, setProjectModalOpen } = useGame()
  const franchises = getFranchises(state)
  return (
    <section className="screen" aria-labelledby="projects-title">
      <header className="screen-heading"><div><p className="overline">CATÁLOGO</p><h2 id="projects-title">Projetos</h2></div><Button variant="primary" onClick={() => setProjectModalOpen(true)} disabled={Boolean(state.currentProject)}>+ NOVO JOGO</Button></header>
      {state.currentProject && <CurrentProject project={state.currentProject} genres={state.world.knownGenres} />}
      <div className="projects-layout">
        <div className="game-library">
          {state.games.length ? state.games.map(game => <GameBox key={game.id} game={game} genres={state.world.knownGenres} state={state} />) : <div className="empty-panel"><strong>A prateleira está vazia.</strong><p>O primeiro lançamento aparece aqui, mesmo se vender mal.</p></div>}
        </div>
        <aside className="franchise-ledger"><div className="card-kicker"><span>FRANQUIAS</span><span>{franchises.length}</span></div>{franchises.length ? franchises.map(item => <article key={item.id}><strong>{item.name}</strong><span>{item.games.length} {item.games.length === 1 ? 'jogo' : 'jogos'} · média {item.average}</span><small>{formatNumber(item.sales)} cópias · fôlego {item.heat}%</small></article>) : <p>Nenhuma sequência publicada.</p>}</aside>
      </div>
    </section>
  )
}

function CurrentProject({ project, genres }) {
  const progress = Math.min(100, Math.round(project.progress / project.totalMonths * 100))
  return <article className="current-project-row"><span>EM PRODUÇÃO</span><strong>{project.title}</strong><small>{labelOf(genres, project.genre)} · {progress}%</small></article>
}

function GameBox({ game, genres, state }) {
  const profit = game.revenue - game.costSpent
  return (
    <article className="game-box">
      <span className="box-label">LANÇADO · {game.released}{game.rivals?.length ? ` · ${game.rivals.length} CONFRONTO` : ''}</span>
      <h3>{game.title}</h3>
      <p>{labelOf(genres, game.genre)} · {labelOf(FOCUSES, game.focus)} · {labelOf(PLATFORMS, game.platform)}</p>
      {game.licenseIds?.length > 0 && <div className="box-licenses">{game.licenseIds.map(id => <span key={id}>{licenseFromState(state, id)?.name}</span>)}</div>}
      <div className="box-score"><strong>{game.score}</strong><span>/ 100</span></div>
      <dl><div><dt>VENDAS</dt><dd>{formatNumber(game.sales)}</dd></div><div><dt>RESULTADO</dt><dd className={profit < 0 ? 'negative' : ''}>{formatMoney(profit)}</dd></div><div><dt>CONFIANÇA</dt><dd>{game.trust}/100</dd></div></dl>
    </article>
  )
}
