import { useGame } from '../app/GameContext.jsx'
import { ERAS, getEra } from '../game/data/eras.js'
import { GENRES, labelOf } from '../game/data/catalog.js'
import { PLATFORM_HISTORY, regionDate } from '../game/data/platformHistory.js'
import { HISTORICAL_MILESTONES } from '../game/data/industryHistory.js'

export function IndustryScreen() {
  const { state } = useGame()
  const era = getEra(state.date.year)
  const discoveries = state.world.knownGenres.filter(item => !item.base)
  return (
    <section className="screen" aria-labelledby="industry-title">
      <header className="screen-heading"><div><p className="overline">LINHA DO TEMPO DO MERCADO</p><h2 id="industry-title">Indústria</h2></div><p>Plataformas acabam. Gêneros aparecem. Ideias boas viram padrão.</p></header>
      <section className="era-hero"><div><span>ERA ATUAL · DESDE {state.world.eraStarted}</span><h3>{era.name}</h3><p>{era.description}</p></div><div>{era.keywords.map(item => <span key={item}>{item}</span>)}</div></section>
      <section className="era-timeline">{ERAS.map(item => <article key={item.id} className={item.id === era.id ? 'is-current' : state.date.year > item.endYear ? 'is-past' : ''}><time>{item.startYear}</time><span /><div><strong>{item.name}</strong><p>{item.description}</p></div></article>)}</section>
      <section className="console-archive"><header><div><p className="overline">ARQUIVO DE HARDWARE</p><h3>Lançamentos regionais</h3></div><span>{PLATFORM_HISTORY.length} plataformas catalogadas</span></header><div className="console-table"><div className="console-row is-head"><span>PLATAFORMA</span><span>EMPRESA</span><span>JAPÃO</span><span>AM. NORTE</span><span>EUROPA</span><span>GLOBAL</span></div>{PLATFORM_HISTORY.map(platform => <div key={platform.id} className={`console-row ${platform.unlockYear <= state.date.year ? 'is-released' : ''}`}><strong>{platform.label}</strong><span>{platform.company}</span><time>{regionDate(platform.launch.jp)}</time><time>{regionDate(platform.launch.na)}</time><time>{regionDate(platform.launch.eu)}</time><time>{regionDate(platform.launch.global)}</time></div>)}</div></section>
      <section className="historical-roll"><header><div><p className="overline">JOGOS E EMPRESAS REAIS</p><h3>O que o mundo comenta</h3></div><span>REFERÊNCIA HISTÓRICA</span></header>{HISTORICAL_MILESTONES.map(item => <article key={item.id} className={item.year <= state.date.year ? 'is-past' : ''}><time>{item.year}</time><div><span>{item.company}</span><strong>{item.title}</strong><p>{item.copy}</p></div></article>)}</section>
      <section className="genre-atlas"><header><div><p className="overline">ATLAS DE GÊNEROS</p><h3>{state.world.knownGenres.length} reconhecidos nesta linha do tempo</h3></div><span>{discoveries.length} nasceram durante o save</span></header><div>{state.world.knownGenres.map(genre => <article key={genre.id} className={!genre.base ? 'is-created' : ''}><span>{genre.base ? 'CLÁSSICO' : 'NOVO'}</span><h4>{genre.label}</h4>{genre.createdBy ? <p>Criado em {genre.createdYear} por {state.games.find(game => game.id === genre.createdBy)?.title ?? 'um jogo esquecido'}.</p> : <p>{labelOf(GENRES, genre.id)} já existia quando a carreira começou.</p>}</article>)}</div></section>
    </section>
  )
}
