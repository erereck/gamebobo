import { useState } from 'react'
import { useGame } from '../../app/store.js'
import { sfx } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { Cover } from '../../ui/Cover.jsx'
import { fmtMoney, fmtNum, fmtScore, scoreColor } from '../../ui/format.js'
import { GENRES, THEMES, genreById, themeById, unlockedGenres, unlockedThemes } from '../../game/data/genres.js'
import { platformById } from '../../game/data/platforms.js'
import { ACHIEVEMENTS } from '../../game/data/content/achievements.js'
import { OUTLETS } from '../../game/data/content/critics.js'

const TABS = [
  { id: 'games', label: 'Jogos', icon: 'cartridge' },
  { id: 'combos', label: 'Combos', icon: 'puzzle' },
  { id: 'trophies', label: 'Troféus', icon: 'trophy' },
  { id: 'log', label: 'História', icon: 'book' },
]

function GameDetail({ game, onBack }) {
  return (
    <div className="game-detail">
      <button type="button" className="btn btn-small btn-ghost" onClick={onBack}><Icon name="back" size={14} />Voltar</button>
      <div className="gd-top">
        <Cover game={game} width={110} />
        <div>
          <b className="gd-title">{game.title}</b>
          <span className="gd-meta">{genreById(game.genre)?.label} · {themeById(game.theme)?.label}</span>
          <span className="gd-meta">{platformById(game.platform)?.label} · {game.year}</span>
          <span className="gd-score" style={{ background: scoreColor(game.score) }}>{fmtScore(game.score)}</span>
        </div>
      </div>
      <div className="gd-critics">
        {game.scores.map((score, i) => (
          <span key={i} className="gd-critic"><small>{OUTLETS.find(o => o.id === game.outlets?.[i])?.name ?? 'Crítico'}</small><b style={{ color: scoreColor(score) }}>{score}</b></span>
        ))}
      </div>
      <div className="gd-stats">
        <span><Icon name="disc" size={16} /><b>{fmtNum(game.sold)}</b><small>cópias</small></span>
        <span><Icon name="cash" size={16} /><b>{fmtMoney(game.revenue)}</b><small>receita</small></span>
        <span><Icon name="chart" size={16} /><b>{game.peak ? `#${game.peak}` : '—'}</b><small>pico</small></span>
        <span><Icon name="bug" size={16} /><b>{fmtNum(game.bugs)}</b><small>bugs</small></span>
      </div>
    </div>
  )
}

export function CollectionPanel() {
  const state = useGame()
  const [tab, setTab] = useState('games')
  const [detail, setDetail] = useState(null)
  const genres = unlockedGenres(state.year, ['online'])
  const themes = unlockedThemes(state.year)
  const discovered = Object.keys(state.combos).length
  const game = detail ? state.games.find(g => g.id === detail) : null

  return (
    <div className="collection">
      <div className="seg seg-4">
        {TABS.map(item => (
          <button key={item.id} type="button" className={tab === item.id ? 'on' : ''} onClick={() => { sfx.click(); setTab(item.id); setDetail(null) }}>
            <Icon name={item.icon} size={15} />{item.label}
          </button>
        ))}
      </div>

      {tab === 'games' && (game ? <GameDetail game={game} onBack={() => setDetail(null)} /> : (
        <div className="shelf-grid">
          {[...state.games].reverse().map(item => (
            <button key={item.id} type="button" className="shelf-item" onClick={() => { sfx.click(); setDetail(item.id) }}>
              <Cover game={item} width={92} />
              <span className="shelf-score" style={{ background: scoreColor(item.score) }}>{fmtScore(item.score)}</span>
              {item.scores.every(s => s >= 9) && <span className="hof"><Icon name="crown" size={12} stroke={2.6} /></span>}
            </button>
          ))}
          {!state.games.length && <p className="empty">Nenhum cartucho ainda.</p>}
        </div>
      ))}

      {tab === 'combos' && (
        <div className="combos">
          <div className="combos-count"><b>{discovered}</b> de {GENRES.length * THEMES.length} combinações testadas</div>
          <div className="combo-grid" style={{ gridTemplateColumns: `28px repeat(${themes.length}, 22px)` }}>
            <span />
            {themes.map(theme => <span key={theme.id} className="cg-head" title={theme.label}><Icon name={theme.icon} size={14} stroke={2.4} /></span>)}
            {genres.map(genre => (
              <div key={genre.id} className="cg-row">
                <span className="cg-head" title={genre.label}><Icon name={genre.icon} size={14} stroke={2.4} /></span>
                {themes.map(theme => {
                  const rating = state.combos[`${genre.id}:${theme.id}`]
                  return <span key={theme.id} className={`cg-cell r-${rating ?? 'x'}`} title={`${genre.label} + ${theme.label}`} />
                })}
              </div>
            ))}
          </div>
          <div className="combo-legend"><span className="r-3" />perfeito<span className="r-2" />bom<span className="r-1" />neutro<span className="r-0" />estranho</div>
        </div>
      )}

      {tab === 'trophies' && (
        <div className="trophies">
          {state.trophies.length > 0 && (
            <div className="trophy-shelf">
              {state.trophies.map((trophy, i) => (
                <span key={i} className="trophy" title={`${trophy.label} ${trophy.year} · ${trophy.title}`}>
                  <Icon name="trophy" size={26} /><small>{trophy.year}</small>
                </span>
              ))}
            </div>
          )}
          {state.goty?.length > 0 && (
            <div className="goty-list">
              <b className="shelf-title">Jogos do Ano</b>
              {[...state.goty].reverse().slice(0, 30).map(entry => (
                <div key={entry.year} className={`goty-row ${entry.mine ? 'mine' : ''}`}>
                  <span className="goty-year">{entry.year}</span>
                  <span className="goty-title"><b>{entry.title}</b><small>{entry.studio}</small></span>
                  {entry.mine && <Icon name="trophy" size={16} />}
                </div>
              ))}
            </div>
          )}
          <div className="ach-count"><b>{state.achievements.length}</b> de {ACHIEVEMENTS.length} conquistas</div>
          <div className="ach-grid">
            {ACHIEVEMENTS.map(item => {
              const got = state.achievements.includes(item.id)
              return (
                <span key={item.id} className={`ach rar-${item.rarity} ${got ? 'got' : ''}`} title={got ? item.label : '???'}>
                  <Icon name={got ? item.icon : 'lock'} size={20} />
                  <small>{got ? item.label : '???'}</small>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'log' && (
        <ol className="log">
          {state.log.map((entry, i) => (
            <li key={i}><Icon name={entry.icon} size={14} /><span>{entry.text}</span><small>{entry.at.split('·')[0]}</small></li>
          ))}
        </ol>
      )}
    </div>
  )
}
