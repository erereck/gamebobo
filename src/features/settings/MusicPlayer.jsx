import { Icon } from '../../components/ui/Icon.jsx'
import { MUSIC_TRACK } from '../../app/music.js'

export function MusicPlayer({ settings, dispatch }) {
  const playing = settings.musicPlaying !== false
  const muted = settings.musicMuted === true
  const volume = Math.round((settings.musicVolume ?? .18) * 100)
  const audible = playing && !muted && volume > 0
  const toggleMute = () => volume === 0 && !muted
    ? dispatch({ type: 'SET_MUSIC_VOLUME', volume: .18 })
    : dispatch({ type: 'TOGGLE_MUSIC_MUTE' })

  return (
    <section className={audible ? 'desk-player is-playing' : 'desk-player'} aria-label="Música da bancada">
      <img src={MUSIC_TRACK.coverUrl} alt="Capa de stock music" />
      <div className="desk-player-copy">
        <span><i aria-hidden="true" />{audible ? 'TOCANDO NA BANCADA' : playing ? 'SEM SOM' : 'PAUSADA'}</span>
        <strong>{MUSIC_TRACK.title}</strong>
        <small>{MUSIC_TRACK.artist} · {MUSIC_TRACK.duration}</small>
      </div>
      <button type="button" className="deck-control deck-play" onClick={() => dispatch({ type: 'TOGGLE_MUSIC_PLAYBACK' })} aria-label={playing ? 'Pausar música' : 'Tocar música'} title={playing ? 'Pausar' : 'Tocar'}>
        <Icon name={playing ? 'pause' : 'play'} size={22} />
      </button>
      <div className="deck-volume">
        <button type="button" className="deck-control" onClick={toggleMute} aria-label={muted || volume === 0 ? 'Ativar música' : 'Mutar música'} title={muted || volume === 0 ? 'Ativar música' : 'Mutar música'}>
          <Icon name={muted || volume === 0 ? 'speakerOff' : 'speaker'} size={19} />
        </button>
        <input type="range" min="0" max="100" step="1" value={volume} onChange={event => dispatch({ type: 'SET_MUSIC_VOLUME', volume: Number(event.target.value) / 100 })} aria-label="Volume da música" />
        <output aria-live="polite">{muted ? 'MUDO' : `${volume}%`}</output>
      </div>
    </section>
  )
}
