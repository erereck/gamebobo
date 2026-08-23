import { useGame } from '../app/GameContext.jsx'
import { FOCUSES, PLATFORMS, labelOf } from '../game/data/catalog.js'
import { getFranchises } from '../game/engine/selectors.js'
import { formatMoney, formatNumber } from '../game/engine/utils.js'
import { projectTypeForId } from '../game/data/projectTypes.js'
import { accessoryForId } from '../game/data/hardwareFeatures.js'
import { projectCapacity, projectCount } from '../game/engine/production.js'
import { Button } from '../components/ui/Button.jsx'
import { licenseFromState } from '../game/engine/licensing.js'

export function ProjectsScreen() {
  const { state, dispatch, setProjectModalOpen } = useGame()
  const franchises = getFranchises(state)
  const active = [state.currentProject, ...(state.parallelProjects ?? [])].filter(Boolean)
  const full = projectCount(state) >= projectCapacity(state)
  return (
    <section className="screen" aria-labelledby="projects-title">
      <header className="screen-heading"><div><p className="overline">CATÁLOGO · {projectCount(state)}/{projectCapacity(state)} FRENTES</p><h2 id="projects-title">Projetos</h2></div><Button variant="primary" onClick={() => setProjectModalOpen(true)} disabled={full}>+ NOVO JOGO</Button></header>
      {active.length > 0 && <section className="active-projects"><header><div><p className="overline">EM PRODUÇÃO</p><h3>{active.length} frente{active.length > 1 ? 's' : ''} ao mesmo tempo</h3></div><span>{full ? 'CAPACIDADE LOTADA' : `${projectCapacity(state) - projectCount(state)} TIME LIVRE`}</span></header><div>{active.map(project => <ActiveProject key={project.id} project={project} state={state} focused={state.currentProject?.id === project.id} onFocus={() => dispatch({ type: 'FOCUS_PROJECT', projectId: project.id })} onDemo={() => dispatch({ type: 'RELEASE_DEMO', projectId: project.id })} />)}</div></section>}
      <div className="projects-layout">
        <div className="game-library">
          {state.games.length ? state.games.map(game => <GameBox key={game.id} game={game} genres={state.world.knownGenres} state={state} />) : <div className="empty-panel"><strong>A prateleira está vazia.</strong><p>O primeiro lançamento aparece aqui, mesmo se vender mal.</p></div>}
        </div>
        <aside className="franchise-ledger"><div className="card-kicker"><span>FRANQUIAS</span><span>{franchises.length}</span></div>{franchises.length ? franchises.map(item => <article key={item.id}><strong>{item.name}</strong><span>{item.games.length} {item.games.length === 1 ? 'jogo' : 'jogos'} · média {item.average}</span><small>{formatNumber(item.sales)} cópias · fôlego {item.heat}%</small></article>) : <p>Nenhuma série publicada ainda.</p>}</aside>
      </div>
    </section>
  )
}

function ActiveProject({ project, state, focused, onFocus, onDemo }) {
  const progress = Math.min(100, Math.round(project.progress / project.totalMonths * 100))
  const type = projectTypeForId(project.projectType)
  const platforms = (project.platforms ?? [project.platform]).map(id => PLATFORMS.find(item => item.id === id)?.label ?? id)
  const demoReady = !project.demo && progress >= 25 && !state.queue.length
  return <article className={`active-project-card ${focused ? 'is-focused' : ''}`}><div className="active-project-head"><span>{focused ? 'FOCO DO MÊS' : project.productionUnitName?.toUpperCase() ?? 'TIME PARALELO'}</span><strong>{project.title}</strong><small>{type.short} · {platforms.join(' + ')}</small></div><div className="active-project-progress"><i style={{ width: `${progress}%` }} /><span>{progress}%</span></div><p>{labelOf(state.world.knownGenres, project.genre)}{project.genres?.length > 1 ? ` + ${project.genres.slice(1).map(id => labelOf(state.world.knownGenres, id)).join(' + ')}` : ''} · {project.promiseName}</p>{project.accessoryId && <em>{accessoryForId(project.accessoryId)?.name}</em>}<div className="active-project-actions">{!focused && <Button size="small" onClick={onFocus}>TRAZER PARA O FOCO</Button>}<Button size="small" variant={demoReady ? 'primary' : undefined} onClick={onDemo} disabled={!demoReady}>{project.demo ? `DEMO ${project.demo.reception}/100` : progress < 25 ? 'DEMO EM 25%' : 'LANÇAR DEMO'}</Button></div></article>
}

function GameBox({ game, genres, state }) {
  const profit = game.revenue - game.costSpent
  const type = projectTypeForId(game.projectType)
  const platforms = (game.platforms ?? [game.platform]).map(id => labelOf(PLATFORMS, id)).join(' + ')
  return (
    <article className="game-box">
      <span className="box-label">{type.short} · {game.released}{game.rivals?.length ? ` · ${game.rivals.length} CONFRONTO` : ''}</span>
      <h3>{game.title}</h3>
      <p>{(game.genres ?? [game.genre]).map(id => labelOf(genres, id)).join(' + ')} · {labelOf(FOCUSES, game.focus)} · {platforms}</p>
      {game.sourceTitles?.length > 0 && <small className="box-promise">BASE · {game.sourceTitles.join(' + ')}</small>}
      {game.promiseName && <small className="box-promise">PROMESSA · {game.promiseName}</small>}
      {game.licenseIds?.length > 0 && <div className="box-licenses">{game.licenseIds.map(id => <span key={id}>{licenseFromState(state, id)?.name}</span>)}</div>}
      <div className="box-score"><strong>{game.score}</strong><span>/ 100</span></div>
      <dl><div><dt>VENDAS</dt><dd>{formatNumber(game.sales)}</dd></div><div><dt>RESULTADO</dt><dd className={profit < 0 ? 'negative' : ''}>{formatMoney(profit)}</dd></div><div><dt>CONFIANÇA</dt><dd>{game.trust}/100</dd></div></dl>
    </article>
  )
}
