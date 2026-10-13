// Efeitos sintetizados na hora: nada para baixar, tudo curto e baixinho.
let ctx = null
let master = null
let enabled = true

function audio() {
  if (!enabled) return null
  try {
    const Engine = window.AudioContext || window.webkitAudioContext
    if (!Engine) return null
    if (!ctx) {
      ctx = new Engine()
      master = ctx.createGain()
      master.gain.value = .5
      master.connect(ctx.destination)
    }
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  } catch {
    return null
  }
}

export function setSoundEnabled(value) {
  enabled = value
}

function tone(freq, { start = 0, dur = .1, type = 'square', vol = .05, slide = 0, attack = .005 } = {}) {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + start
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur)
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(vol, t + attack)
  gain.gain.exponentialRampToValueAtTime(.0001, t + dur)
  osc.connect(gain).connect(master)
  osc.start(t)
  osc.stop(t + dur + .02)
}

function noise({ start = 0, dur = .08, vol = .05, freq = 1200 } = {}) {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + start
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  const src = ac.createBufferSource()
  src.buffer = buffer
  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = freq
  const gain = ac.createGain()
  gain.gain.value = vol
  src.connect(filter).connect(gain).connect(master)
  src.start(t)
}

export const sfx = {
  click: () => tone(880, { dur: .04, vol: .03, type: 'triangle' }),
  select: () => { tone(660, { dur: .05, vol: .035, type: 'triangle' }); tone(990, { start: .045, dur: .06, vol: .03, type: 'triangle' }) },
  back: () => tone(440, { dur: .06, vol: .03, type: 'triangle', slide: -120 }),
  coin: () => { tone(988, { dur: .06, vol: .035 }); tone(1319, { start: .06, dur: .14, vol: .035 }) },
  cash: () => { noise({ dur: .05, vol: .05, freq: 3000 }); tone(1568, { start: .04, dur: .2, vol: .03, type: 'triangle' }) },
  tick: () => tone(1200, { dur: .025, vol: .025, type: 'square' }),
  flip: () => { noise({ dur: .06, vol: .06, freq: 1800 }); tone(520, { dur: .05, vol: .02, type: 'triangle' }) },
  stamp: () => { noise({ dur: .12, vol: .14, freq: 220 }); tone(110, { dur: .18, vol: .08, type: 'sine', slide: -40 }) },
  fanfare: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, { start: i * .1, dur: i === 3 ? .45 : .12, vol: .04, type: 'square' })),
  sad: () => [392, 370, 349, 311].forEach((f, i) => tone(f, { start: i * .18, dur: .2, vol: .035, type: 'triangle', slide: i === 3 ? -60 : 0 })),
  levelup: () => [523, 784, 1047, 1568].forEach((f, i) => tone(f, { start: i * .06, dur: .1, vol: .03, type: 'square' })),
  pop: () => tone(740, { dur: .07, vol: .035, type: 'sine', slide: 300 }),
  alert: () => { tone(880, { dur: .08, vol: .04, type: 'square' }); tone(880, { start: .12, dur: .08, vol: .04, type: 'square' }) },
  whoosh: () => noise({ dur: .18, vol: .04, freq: 900 }),
  drum: () => noise({ dur: .05, vol: .07, freq: 260 }),
  chime: () => [1047, 1319, 1568].forEach((f, i) => tone(f, { start: i * .08, dur: .25, vol: .025, type: 'sine' })),
  // Voz de boneco: duas sílabas aleatórias, tipo simlês de bolso.
  blip: (voice = 1) => {
    const base = 300 * voice
    tone(base * (1 + Math.random() * .5), { dur: .06, vol: .018, type: 'square', slide: Math.random() * 80 - 40 })
    tone(base * (1 + Math.random() * .6), { start: .07, dur: .06, vol: .015, type: 'square', slide: Math.random() * 80 - 40 })
  },
}

export function vibrate(pattern = 12) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // sem vibração
  }
}
