import trackUrl from '../assets/music/stock-music.mp3'

let music = null

function element() {
  if (music || typeof Audio === 'undefined') return music
  music = new Audio(trackUrl)
  music.loop = true
  music.preload = 'auto'
  return music
}

export function syncMusic(playing, volume = .22) {
  try {
    const player = element()
    if (!player) return
    player.volume = Math.max(0, Math.min(1, volume))
    if (playing) player.play().catch(() => {})
    else player.pause()
  } catch {
    // Música é atmosfera; o navegador pode bloquear até o primeiro toque.
  }
}
