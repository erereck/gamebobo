import trackUrl from '../assets/music/stock-music.mp3'
import coverUrl from '../assets/music/stock-music-cover.png'

export const MUSIC_TRACK = Object.freeze({
  title: 'stock music',
  artist: 'leafotario',
  duration: '1:26',
  trackUrl,
  coverUrl,
})

let music = null

function musicElement() {
  if (music || typeof Audio === 'undefined') return music
  music = new Audio(trackUrl)
  music.loop = true
  music.preload = 'auto'
  music.playsInline = true
  if ('mediaSession' in navigator && typeof MediaMetadata !== 'undefined') {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: MUSIC_TRACK.title,
      artist: MUSIC_TRACK.artist,
      album: 'Gamebobo',
      artwork: [{ src: coverUrl, sizes: '711x709', type: 'image/png' }],
    })
  }
  return music
}

export function syncMusic({ playing = true, muted = false, volume = .18 } = {}) {
  try {
    const player = musicElement()
    if (!player) return
    player.volume = Math.max(0, Math.min(1, Number(volume) || 0))
    player.muted = Boolean(muted)
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'
    if (playing) player.play().catch(() => {})
    else player.pause()
  } catch {
    // Música é atmosfera. O jogo continua caso o navegador bloqueie mídia.
  }
}
