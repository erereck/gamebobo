let audioContext = null

export function playSound(kind, enabled = true) {
  if (!enabled) return
  try {
    const AudioEngine = window.AudioContext || window.webkitAudioContext
    if (!AudioEngine) return
    audioContext ||= new AudioEngine()
    const notes = kind === 'release' ? [392, 523, 659] : [kind === 'event' ? 220 : kind === 'confirm' ? 660 : 440]
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()
      const start = audioContext.currentTime + index * 0.07
      oscillator.type = 'square'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.025, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.07)
      oscillator.connect(gain).connect(audioContext.destination)
      oscillator.start(start)
      oscillator.stop(start + 0.075)
    })
  } catch {
    // Som é resposta tátil, nunca requisito para jogar.
  }
}
