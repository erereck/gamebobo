import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { hashString, mulberry32 } from '../game/engine/rng.js'
import { zTexture } from './bubbles.js'

// Contrato com os móveis (furniture.js / world.js):
// - SEAT_HIP: altura da base do quadril do boneco sentado, medida a partir do root (sem a escala do boneco).
//   agents.js faz root.position.y = spot.seatY - SEAT_HIP * escala; seatY é o topo do assento.
// - Deitado (spot.lie = { x, z, y, rot }): o root vai para (lie.x, lie.y, lie.z) com rotation.y = lie.rot.
//   O boneco deita de costas com o centro do corpo em lie; com rot = 0 a cabeça fica para -z (travesseiro)
//   e os pés para +z. Ou seja: rot é o giro que deixa o travesseiro no -z local do boneco.

// ---------- medidas do boneco (sem escala; pés em y = 0, frente em +z) ----------
const THIGH = .14
const SHIN = .14
const SOLE = .05
const HIP_Y = THIGH + SHIN + SOLE
const THIGH_R = .062
const SHOULDER_X = .155
const SHOULDER_Y = .245
const UPPER = .115
const FORE = .115
const NECK_Y = .3
const HEAD_LIFT = .2
const HEAD_R = .235
const BROW_Y = .09
const LIE_CENTER = .55
const LIE_BACK = .13
const HALF_PI = Math.PI / 2
export const SEAT_HIP = HIP_Y - THIGH_R
export const DESK_TOP = .53

const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v)
const smooth = v => {
  const x = clamp01(v)
  return x * x * (3 - 2 * x)
}

// ---------- geometrias compartilhadas ----------
const M4 = new THREE.Matrix4()
const QT = new THREE.Quaternion()
const EU = new THREE.Euler()
const V1 = new THREE.Vector3()
const V2 = new THREE.Vector3()
const UP = new THREE.Vector3(0, 1, 0)

// Copia uma geometria já posicionada (para fundir várias peças num buffer só).
function piece(geometry, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1, dir = null } = {}) {
  const g = geometry.clone()
  if (dir) QT.setFromUnitVectors(UP, V2.set(...dir).normalize())
  else QT.setFromEuler(EU.set(rx, ry, rz, 'XYZ'))
  M4.compose(V1.set(x, y, z), QT, V2.set(sx, sy, sz))
  g.applyMatrix4(M4)
  return g
}

const fused = new Map()
function fuse(key, build) {
  if (!fused.has(key)) {
    const parts = build().filter(Boolean)
    fused.set(key, parts.length ? mergeGeometries(parts) : null)
  }
  return fused.get(key)
}

function torsoGeometry() {
  const profile = [[0, -.04], [.1, -.036], [.138, -.006], [.148, .05], [.146, .12], [.136, .19], [.118, .245], [.09, .285], [.05, .31], [0, .318]]
  return new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 18)
}

const G = {
  head: new THREE.SphereGeometry(HEAD_R, 26, 20),
  torso: torsoGeometry(),
  pelvis: new THREE.SphereGeometry(.142, 16, 10),
  skirt: new THREE.CylinderGeometry(.128, .2, .17, 18),
  thigh: new THREE.CapsuleGeometry(THIGH_R, .1, 4, 10),
  shorts: new THREE.CapsuleGeometry(.067, .08, 4, 10),
  shin: new THREE.CapsuleGeometry(.054, .1, 4, 10),
  shoe: new THREE.SphereGeometry(.068, 12, 9),
  upper: new THREE.CapsuleGeometry(.044, .065, 4, 8),
  fore: new THREE.CapsuleGeometry(.04, .07, 4, 8),
  hand: new THREE.SphereGeometry(.05, 12, 9),
  eye: new THREE.SphereGeometry(.031, 12, 9),
  glint: new THREE.SphereGeometry(.0105, 6, 5),
  eyeArc: new THREE.TorusGeometry(.03, .0085, 5, 12, Math.PI),
  brow: new THREE.CapsuleGeometry(.0078, .04, 3, 6).rotateZ(HALF_PI),
  mouthArc: new THREE.TorusGeometry(.036, .0095, 5, 14, Math.PI),
  mouthO: new THREE.CircleGeometry(.034, 16),
  mouthD: new THREE.CircleGeometry(.047, 16, Math.PI, Math.PI),
  tongue: new THREE.CircleGeometry(.024, 12, Math.PI, Math.PI),
  cheek: new THREE.CircleGeometry(.042, 14),
  badge: new THREE.CircleGeometry(.032, 5),
  print: new THREE.CircleGeometry(.036, 16),
  shadow: new THREE.CircleGeometry(.24, 20),
  hit: new THREE.CylinderGeometry(.3, .3, 1.2, 8),
}
G.sweat = mergeGeometries([piece(new THREE.SphereGeometry(.02, 8, 6)), piece(new THREE.ConeGeometry(.0195, .035, 8), { y: .024 })])

// ---------- materiais ----------
const materialCache = new Map()
export function mat(color, opts = {}) {
  const key = `${color}|${opts.emissive ?? ''}|${opts.rough ?? .75}|${opts.transparent ?? ''}`
  if (!materialCache.has(key)) {
    materialCache.set(key, new THREE.MeshStandardMaterial({
      color,
      roughness: opts.rough ?? .75,
      metalness: opts.metal ?? 0,
      emissive: opts.emissive ?? '#000000',
      emissiveIntensity: opts.emissiveIntensity ?? 1,
      transparent: Boolean(opts.transparent),
      opacity: opts.opacity ?? 1,
    }))
  }
  return materialCache.get(key)
}

const basicCache = new Map()
function flat(color, opts = {}) {
  const key = `${color}|${opts.opacity ?? 1}`
  if (!basicCache.has(key)) {
    basicCache.set(key, new THREE.MeshBasicMaterial({ color, transparent: (opts.opacity ?? 1) < 1, opacity: opts.opacity ?? 1, depthWrite: (opts.opacity ?? 1) >= 1 }))
  }
  return basicCache.get(key)
}

const INK = flat('#1d1a24')
const GLINT = flat('#ffffff')
const MOUTH = flat('#7a2a3a')
const MOUTH_LINE = flat('#3a2228')
const TONGUE = flat('#ff8fa3')
const CHEEK = flat('#ff8f8f', { opacity: .5 })
const SWEAT = flat('#8fd8ff')
const SHADOW = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: .16, depthWrite: false })
const HIT = new THREE.MeshBasicMaterial({ visible: false })

const shade = (hex, amount, toward = '#1d1a24') => `#${new THREE.Color(hex).lerp(new THREE.Color(toward), amount).getHexString()}`

// Camiseta listrada: textura em faixas, uma por par de cores.
const stripeCache = new Map()
function stripeMaterial(base, accent) {
  const key = `${base}|${accent}`
  if (!stripeCache.has(key)) {
    const canvas = document.createElement('canvas')
    canvas.width = 4
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = base
    ctx.fillRect(0, 0, 4, 64)
    ctx.fillStyle = accent
    for (let y = 4; y < 64; y += 16) ctx.fillRect(0, y, 4, 7)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1, 1.5)
    stripeCache.set(key, new THREE.MeshStandardMaterial({ map: texture, roughness: .75 }))
  }
  return stripeCache.get(key)
}

// ---------- visual completo a partir do look salvo ----------
// Campos novos são opcionais: o que faltar sai de um sorteio fixo pelo próprio look, então
// saves antigos ganham sempre a mesma roupa, sem precisar migrar nada.
const TOPS = ['camiseta', 'camiseta', 'moletom', 'camisa', 'listrada', 'macacao']
const BOTTOMS = ['calca', 'calca', 'calca', 'bermuda', 'saia']
const SHOES = ['#2a2a30', '#f4f1ea', '#e63946', '#3a86ff', '#8d5524', '#ffbe0b', '#52d977']
const ACCENTS = ['#ffffff', '#ffd23f', '#ff5d3a', '#3fb8ff', '#52d977', '#ff6bd6', '#1d1a24']
const CUTS = { curto: ['curto', 'curto', 'espetado', 'lateral'], longo: ['longo', 'longo', 'chanel'], rabo: ['rabo', 'rabo', 'marias'] }
const NEW_CUTS = new Set(['espetado', 'lateral', 'chanel', 'marias'])
const HATS = new Set(['gorro', 'faixa'])

export function dressLook(look = {}) {
  const random = mulberry32(hashString(`${look.skin}|${look.hair}|${look.hairStyle}|${look.shirt}|${look.pants}|${look.extra}|${look.height}`))
  const pick = list => list[Math.floor(random() * list.length)]
  const rolled = {
    top: pick(TOPS),
    bottom: pick(BOTTOMS),
    shoes: pick(SHOES),
    accent: pick(ACCENTS),
    cut: pick(CUTS[look.hairStyle] ?? [look.hairStyle ?? 'curto']),
    hat: random() < .22 ? pick(['gorro', 'faixa']) : null,
    blush: random() < .4,
    print: random() < .45,
    capBack: random() < .25,
    frames: pick(['redondo', 'quadrado']),
  }
  const extra = look.extra ?? 'nada'
  const top = look.top ?? rolled.top
  let bottom = look.bottom ?? rolled.bottom
  if (top === 'macacao' && bottom === 'saia') bottom = 'calca'
  let accent = look.accent ?? rolled.accent
  if (accent === look.shirt) accent = accent === '#ffffff' ? '#1d1a24' : '#ffffff'
  return {
    skin: look.skin ?? '#f2c7a5',
    hair: look.hair ?? '#3b2416',
    hairStyle: look.hairStyle ?? 'curto',
    shirt: look.shirt ?? '#4dabf7',
    pants: look.pants ?? '#2b3a55',
    extra,
    height: look.height ?? 1,
    top,
    bottom,
    shoes: look.shoes ?? rolled.shoes,
    accent,
    cut: NEW_CUTS.has(look.hairStyle) ? look.hairStyle : (look.cut ?? rolled.cut),
    hat: look.hat !== undefined ? look.hat : HATS.has(extra) ? extra : extra === 'nada' ? rolled.hat : null,
    blush: look.blush ?? rolled.blush,
    print: look.print ?? rolled.print,
    capBack: look.capBack ?? rolled.capBack,
    frames: look.frames ?? rolled.frames,
  }
}

// ---------- cabelo: tudo fundido em até dois buffers por corte ----------
// crown = o que some debaixo de boné/gorro; rest = o que continua aparecendo.
const R = HEAD_R
const sphereG = (r, ws = 12, hs = 9) => new THREE.SphereGeometry(r, ws, hs)
const capPiece = (extra = 0) => piece(new THREE.SphereGeometry(R + .018 + extra, 24, 12, 0, Math.PI * 2, 0, Math.PI * .5), { y: .004, z: -.006, rx: -.5 })

const HAIR = {
  curto: () => ({ crown: [capPiece(), piece(sphereG(.07), { x: .05, y: .178, z: .145, rz: -.3, sx: 1.5, sy: .6 })], rest: [], top: .26 }),
  espetado: () => ({
    crown: [capPiece(), ...[[0, 1, .25], [.45, .85, .15], [-.45, .85, .15], [.22, .78, .55], [-.22, .78, .55], [0, .72, -.55], [.55, .7, -.3], [-.55, .7, -.3]].map(dir => {
      const n = V1.set(...dir).normalize()
      return piece(new THREE.ConeGeometry(.058, .15, 6), { x: n.x * (R + .03), y: n.y * (R + .03), z: n.z * (R + .03), dir })
    })],
    rest: [],
    top: .33,
  }),
  lateral: () => ({ crown: [capPiece(), piece(sphereG(.12, 14, 10), { x: -.06, y: .165, z: .13, rx: .45, rz: .38, sx: 1.7, sy: .5, sz: .85 })], rest: [], top: .26 }),
  coque: () => ({ crown: [capPiece(), piece(sphereG(.1), { y: .2, z: -.13 })], rest: [], top: .3 }),
  black: () => {
    const crown = [piece(sphereG(.27, 18, 14), { y: .07, z: -.035 })]
    for (let i = 0; i < 14; i += 1) {
      const a = (i / 14) * Math.PI * 2
      const ring = i % 2 ? .62 : .3
      const dir = [Math.cos(a) * Math.sin(ring * Math.PI), Math.cos(ring * Math.PI), Math.sin(a) * Math.sin(ring * Math.PI)]
      if (dir[2] > .55 && dir[1] < .5) continue
      crown.push(piece(sphereG(.1), { x: dir[0] * .25, y: .07 + dir[1] * .25, z: -.035 + dir[2] * .25 }))
    }
    return { crown, rest: [], top: .38, wide: .32, hat: 1.22 }
  },
  careca: () => ({ crown: [], rest: [], top: .24 }),
  longo: () => ({
    crown: [capPiece()],
    rest: [piece(new THREE.CapsuleGeometry(.16, .16, 4, 12), { y: -.1, z: -.13, sx: 1.3, sz: .55 }), ...[-1, 1].map(s => piece(new THREE.CapsuleGeometry(.052, .2, 4, 8), { x: s * .205, y: -.07, z: .03, rz: s * .08 }))],
    top: .26,
  }),
  chanel: () => ({
    crown: [capPiece(), piece(new THREE.CapsuleGeometry(.045, .2, 4, 8), { y: .138, z: .172, rx: .55, rz: HALF_PI, sy: 1, sz: .75 })],
    rest: [piece(new THREE.SphereGeometry(R + .03, 26, 12, HALF_PI + .9, Math.PI * 2 - 1.8, Math.PI * .3, Math.PI * .42), { sx: 1.05, sz: 1.04 })],
    top: .26,
  }),
  marias: () => ({
    crown: [capPiece()],
    rest: [-1, 1].flatMap(s => [
      piece(sphereG(.035, 8, 6), { x: s * .2, y: .05, z: -.08 }),
      piece(new THREE.CapsuleGeometry(.062, .13, 4, 8), { x: s * .26, y: -.04, z: -.08, rz: s * .55 }),
    ]),
    top: .26,
  }),
  moicano: () => ({
    crown: [[.75, .55], [.45, .9], [.1, 1], [-.3, .95], [-.65, .7]].map(([z, y]) => {
      const n = V1.set(0, y, z).normalize()
      return piece(new THREE.ConeGeometry(.062, .17, 6), { y: n.y * (R + .035), z: n.z * (R + .035), dir: [0, y, z], sx: .8 })
    }),
    rest: [],
    top: .34,
  }),
  franja: () => ({ crown: [capPiece(), piece(new THREE.CapsuleGeometry(.05, .22, 4, 8), { y: .135, z: .17, rx: .55, rz: HALF_PI, sz: .7 })], rest: [], top: .26 }),
  cacheado: () => {
    const curls = []
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2
      const front = Math.sin(a) > .6
      curls.push(piece(sphereG(.075), { x: Math.cos(a) * .2, y: (front ? .17 : .1) + Math.sin(i * 1.7) * .025, z: Math.sin(a) * .18 - .03 }))
    }
    for (const [x, z] of [[0, 0], [.1, -.08], [-.1, -.08], [0, -.15]]) curls.push(piece(sphereG(.08), { x, y: .2, z }))
    return { crown: [capPiece(), ...curls.slice(12)], rest: curls.slice(0, 12), top: .3 }
  },
  rabo: () => ({ crown: [capPiece()], rest: [piece(sphereG(.04, 8, 6), { y: .06, z: -.235 }), piece(new THREE.CapsuleGeometry(.058, .17, 4, 8), { y: -.06, z: -.29, rx: .45 })], top: .26 }),
}

const hairInfo = new Map()
function hairShape(cut) {
  const key = HAIR[cut] ? cut : 'curto'
  if (!hairInfo.has(key)) {
    const spec = HAIR[key]()
    hairInfo.set(key, {
      crown: fuse(`crown|${key}`, () => spec.crown),
      rest: fuse(`rest|${key}`, () => spec.rest),
      top: spec.top,
      wide: spec.wide ?? .255,
      hat: spec.hat ?? 1,
    })
  }
  return hairInfo.get(key)
}

// ---------- acessórios de cabeça ----------
const BEANIE_R = R + .04
const BEANIE_RIM = Math.PI * .46
const ACC = {
  redondo: () => fuse('glasses|round', () => glassesParts(new THREE.TorusGeometry(.05, .011, 6, 18))),
  quadrado: () => fuse('glasses|square', () => glassesParts(new THREE.TorusGeometry(.055, .012, 6, 4), Math.PI / 4)),
  band: wide => fuse(`band|${wide}`, () => [piece(new THREE.TorusGeometry(wide, .02, 6, 22, Math.PI), { y: .02 })]),
  cups: wide => fuse(`cups|${wide}`, () => [-1, 1].map(s => piece(new THREE.CylinderGeometry(.068, .068, .06, 16), { x: s * wide, y: .0, rz: HALF_PI }))),
  bone: () => fuse('bone', () => [
    piece(new THREE.SphereGeometry(R + .03, 22, 10, 0, Math.PI * 2, 0, Math.PI * .5), { rx: -.4 }),
    piece(sphereG(.022, 8, 6), { y: (R + .03) * Math.cos(.4), z: -(R + .03) * Math.sin(.4) }),
  ]),
  brim: () => fuse('brim', () => [piece(new THREE.CylinderGeometry(.16, .16, .022, 20, 1, false, -HALF_PI, Math.PI), { y: .118, z: .15, rx: .22, sz: 1.05 })]),
  // gorro montado reto e depois inclinado para trás, para a barra ficar logo acima das sobrancelhas
  gorro: () => tilted('gorro', () => [
    piece(new THREE.SphereGeometry(BEANIE_R, 22, 12, 0, Math.PI * 2, 0, BEANIE_RIM), { sy: 1.1 }),
    piece(new THREE.TorusGeometry(BEANIE_R * Math.sin(BEANIE_RIM) + .004, .036, 8, 26), { y: BEANIE_R * Math.cos(BEANIE_RIM) * 1.1, rx: HALF_PI }),
  ], -.42),
  pompom: () => tilted('pompom', () => [piece(sphereG(.06), { y: BEANIE_R * 1.1 + .035 })], -.42),
  faixa: () => fuse('faixa', () => [piece(new THREE.TorusGeometry(.256, .026, 6, 28), { y: .07, rx: HALF_PI - .42 })]),
}

function tilted(key, build, rx) {
  if (!fused.has(key)) fuse(key, build)?.rotateX(rx)
  return fused.get(key)
}

function glassesParts(lens, rz = 0) {
  const z = Math.sqrt(R * R - .085 * .085) + .02
  return [
    piece(lens, { x: -.085, y: -.005, z, rz }),
    piece(lens, { x: .085, y: -.005, z, rz }),
    piece(new THREE.CylinderGeometry(.007, .007, .06, 6), { y: .005, z: z + .005, rz: HALF_PI }),
  ]
}

// ---------- roupas ----------
const CLOTHES = {
  hood: () => fuse('hood', () => [piece(new THREE.TorusGeometry(.105, .048, 8, 18, Math.PI * 1.25), { y: .29, z: -.03, rx: HALF_PI, rz: -Math.PI * .125 - HALF_PI + Math.PI }), piece(new THREE.BoxGeometry(.17, .07, .03), { y: .085, z: .124 })]),
  strings: () => fuse('strings', () => [-1, 1].map(s => piece(new THREE.CylinderGeometry(.006, .006, .08, 5), { x: s * .032, y: .215, z: .118 }))),
  collar: () => fuse('collar', () => [
    ...[-1, 1].map(s => piece(new THREE.ConeGeometry(.05, .075, 3), { x: s * .04, y: .278, z: .07, rx: Math.PI + .5, rz: s * -.5, sz: .4 })),
    ...[.21, .15, .09].map(y => piece(sphereG(.01, 6, 4), { y, z: .132 - Math.abs(y - .15) * .05 })),
  ]),
  bib: () => fuse('bib', () => [
    piece(new THREE.BoxGeometry(.18, .13, .03), { y: .11, z: .118 }),
    ...[-1, 1].map(s => piece(new THREE.BoxGeometry(.035, .2, .022), { x: s * .062, y: .22, z: .09, rx: -.42 })),
  ]),
  buttons: () => fuse('buttons', () => [-1, 1].map(s => piece(sphereG(.014, 6, 4), { x: s * .062, y: .165, z: .136 }))),
}

// ---------- objetos de mão (aparecem conforme a era) ----------
const PROP = {
  mug: () => [[fuse('mug', () => [piece(new THREE.CylinderGeometry(.034, .03, .07, 14), {}), piece(new THREE.TorusGeometry(.02, .007, 5, 10), { x: .036, rz: 0 })]), mat('#fffaf0', { rough: .4 })], [fuse('coffee', () => [piece(new THREE.CircleGeometry(.03, 12), { y: .031, rx: -HALF_PI })]), mat('#6b3e1f', { rough: .3 })]],
  can: () => [[fuse('can', () => [piece(new THREE.CylinderGeometry(.027, .027, .095, 12), {})]), mat('#52d977', { rough: .3 })], [fuse('canTop', () => [piece(new THREE.CylinderGeometry(.025, .027, .01, 12), { y: .05 })]), mat('#d9dde3', { rough: .25 })]],
  watch: () => [[fuse('watch', () => [piece(new THREE.BoxGeometry(.13, .075, .018), {})]), mat('#d8c48c', { rough: .5 })], [fuse('watchScreen', () => [piece(new THREE.PlaneGeometry(.06, .04), { z: .01 })]), flat('#b9c4a2')]],
  brick: () => [[fuse('brick', () => [piece(new THREE.BoxGeometry(.075, .115, .022), {})]), mat('#c9c3b8', { rough: .55 })], [fuse('brickScreen', () => [piece(new THREE.PlaneGeometry(.048, .04), { y: .02, z: .012 })]), flat('#9bbc0f')], [fuse('brickKeys', () => [piece(sphereG(.009, 6, 4), { x: .02, y: -.03, z: .012 }), piece(sphereG(.009, 6, 4), { x: .032, y: -.022, z: .012 })]), flat('#c2185b')]],
  wide: () => [[fuse('wide', () => [piece(new THREE.BoxGeometry(.13, .07, .024), {})]), mat('#6c4ab6', { rough: .4 })], [fuse('wideScreen', () => [piece(new THREE.PlaneGeometry(.06, .042), { z: .013 })]), flat('#bfe3ff')]],
  phone: () => [[fuse('phone', () => [piece(new THREE.BoxGeometry(.062, .115, .012), {})]), mat('#22252c', { rough: .3 })], [fuse('phoneScreen', () => [piece(new THREE.PlaneGeometry(.052, .1), { z: .007 })]), flat('#8fe3ff')]],
  marker: () => [[fuse('marker', () => [piece(new THREE.CylinderGeometry(.012, .012, .08, 8), { rx: HALF_PI })]), mat('#e63946', { rough: .4 })]],
  water: () => [[fuse('wateringCan', () => [piece(new THREE.CylinderGeometry(.045, .05, .08, 12), {}), piece(new THREE.CylinderGeometry(.008, .012, .1, 6), { y: .02, z: .07, rx: 1.0 }), piece(new THREE.TorusGeometry(.03, .008, 5, 10, Math.PI), { y: .04, z: -.01, ry: HALF_PI })]), mat('#52b788', { rough: .45 })]],
}

// Como cada objeto fica na mão direita (posição e giro no espaço da mão, medidos na pose de uso).
// tilt: quanto o objeto inclina com r.propTilt (regador derrama, caneca vai à boca).
const HANDHELD = { p: [-.034, -.069, .03], r: [1.394, .701, 3.128], tilt: 0, scale: 1.35 }
const CUP = { p: [-.022, -.028, .021], r: [2.349, .212, -.757], tilt: -.55 }
const PROP_POSE = {
  mug: CUP,
  can: CUP,
  watch: HANDHELD,
  brick: HANDHELD,
  wide: HANDHELD,
  phone: HANDHELD,
  marker: { p: [0, -.024, -.018], r: [1.759, -.051, -.004], tilt: 0 },
  water: { p: [0, -.027, -.024], r: [1.3, -.034, -.022], tilt: 1 },
}

const PARTY_COLORS = ['#ff5d3a', '#ffd23f', '#3fb8ff', '#52d977', '#ff6bd6', '#b57bff']
const PARTY = {
  cone: new THREE.ConeGeometry(.08, .19, 14),
  ball: new THREE.SphereGeometry(.032, 8, 6),
}

// ---------- expressões ----------
const FACE_KEYS = ['smile', 'open', 'laugh', 'happy', 'closed', 'browUp', 'browTilt', 'blush', 'eye']
const FACE0 = { smile: .3, open: 0, laugh: 0, happy: 0, closed: 0, browUp: 0, browTilt: 0, blush: 0, eye: 1 }
const FACES = {
  focus: { smile: .12, browTilt: -.2 },
  chat: { smile: .65, browUp: .25 },
  listen: { smile: .7, browUp: .35, blush: .2 },
  happy: { smile: .9, browUp: .4, blush: .4 },
  joy: { smile: 1, laugh: 1, happy: 1, browUp: .7, blush: .9 },
  sad: { smile: -1, browTilt: .9, browUp: .1, eye: .7 },
  sleep: { smile: 0, closed: 1, open: .14, browUp: -.1 },
  calm: { smile: .55, eye: .8 },
  annoyed: { smile: -.6, browTilt: -.8, eye: .85 },
  game: { smile: .75, browTilt: -.3, open: .08 },
  stretch: { closed: 1, open: .45, smile: 0, browUp: .5 },
  yawn: { closed: 1, open: 1, smile: 0, browTilt: .3 },
  puzzled: { smile: -.1, browTilt: .5, browUp: .2 },
  shrug: { smile: .05, browUp: .9, open: .12 },
  love: { smile: 1, happy: 1, blush: 1.5, browUp: .4 },
}

function feel(F, w, face) {
  for (const key of FACE_KEYS) if (key in face) F[key] += w * (face[key] - FACE0[key])
}

// Esqueleto acumulado a cada quadro (um só para todos os bonecos: nada é alocado no laço).
const RIG = {
  hipX: 0, hipY: 0, hipZ: 0, hipRX: 0, hipRY: 0, hipRZ: 0,
  spineX: 0, spineY: 0, spineZ: 0, headX: 0, headY: 0, headZ: 0,
  aX: [0, 0], aY: [0, 0], aZ: [0, 0], el: [0, 0],
  tX: [0, 0], tZ: [0, 0], kn: [0, 0],
  jump: 0, propTilt: 0,
  smile: 0, open: 0, laugh: 0, happy: 0, closed: 0, browUp: 0, browTilt: 0, blush: 0, eye: 1,
}

function resetRig(r) {
  r.hipX = r.hipY = r.hipZ = r.hipRX = r.hipRY = r.hipRZ = 0
  r.spineX = r.spineY = r.spineZ = r.headX = r.headY = r.headZ = 0
  for (let i = 0; i < 2; i += 1) r.aX[i] = r.aY[i] = r.aZ[i] = r.el[i] = r.tX[i] = r.tZ[i] = r.kn[i] = 0
  r.jump = r.propTilt = 0
  for (const key of FACE_KEYS) r[key] = FACE0[key]
}

const sideOf = i => (i ? 1 : -1)
// Braço i: x < 0 leva a mão para a frente; "fora" é sempre para longe do corpo.
function arm(r, i, w, x, out = 0, elbow = 0, twist = 0) {
  r.aX[i] += x * w
  r.aZ[i] += sideOf(i) * out * w
  r.el[i] += elbow * w
  r.aY[i] += sideOf(i) * twist * w
}
const pulse = (t, period, length) => {
  const p = (t % period) / length
  return p >= 1 ? 0 : Math.sin(p * Math.PI)
}

// Ações (parte de cima do corpo + rosto). w = peso da mistura, t = relógio do boneco.
const ACTS = {
  type(r, w, t) {
    r.spineX += .1 * w
    r.headX += .12 * w
    for (let i = 0; i < 2; i += 1) arm(r, i, w, -1.2 + Math.sin(t * 19 + i * 2.1) * .06, -.26, -.5 + Math.sin(t * 23 + i * 1.3) * .1)
    feel(r, w, FACES.focus)
  },
  talk(r, w, t) {
    const g = Math.max(0, Math.sin(t * 2.4))
    const h = Math.max(0, Math.sin(t * 2.4 + 2.6))
    arm(r, 1, w, -.35 - .5 * g, .15 + .15 * g, -1.0 - .35 * Math.sin(t * 5.2) * g)
    arm(r, 0, w, -.2 - .45 * h, .1 + .2 * h, -.6 - .5 * h)
    r.headX += Math.sin(t * 5.5) * .05 * w
    r.headZ += Math.sin(t * 1.3) * .08 * w
    r.spineY += Math.sin(t * 1.1) * .06 * w
    feel(r, w, FACES.chat)
  },
  listen(r, w, t) {
    r.headX += Math.pow(Math.max(0, Math.sin(t * 2.7)), 6) * .2 * w
    r.headZ += .1 * w
    for (let i = 0; i < 2; i += 1) arm(r, i, w, -.5, -.14, -1.0, -.9)
    feel(r, w, FACES.listen)
  },
  cheer(r, w, t, b) {
    r.jump += Math.max(0, Math.sin(t * 9)) * .18 * w * b.standing
    r.spineX -= .08 * w
    r.headX -= .2 * w
    for (let i = 0; i < 2; i += 1) arm(r, i, w, -2.75, .42 + Math.sin(t * 12 + i) * .12, -.15)
    feel(r, w, FACES.joy)
  },
  laugh(r, w, t) {
    const shake = Math.sin(t * 15)
    r.hipY += Math.abs(shake) * .012 * w
    r.spineX += (-.12 + shake * .04) * w
    r.headX -= .18 * w
    arm(r, 0, w, -.5, -.14, -1.0, -.9)
    arm(r, 1, w, -.3 + shake * .1, .35, -.7)
    feel(r, w, FACES.joy)
    r.laugh += shake * .15 * w
  },
  sad(r, w, t) {
    r.spineX += .3 * w
    r.headX += .42 * w
    r.headZ += Math.sin(t * .8) * .05 * w
    r.hipY -= .015 * w
    for (let i = 0; i < 2; i += 1) arm(r, i, w, -.18, -.1, -.15)
    feel(r, w, FACES.sad)
  },
  // Cochilo na mesa: tronco inclinado, braços cruzados sobre a mesa e a bochecha neles.
  sleep(r, w, t, b) {
    r.spineX += b.deskLean * w
    r.headX += .3 * w
    r.headZ += .32 * w
    r.headY += .15 * w
    for (let i = 0; i < 2; i += 1) arm(r, i, w, -1.05 - 1.3 * b.deskLean + Math.sin(t * 1.3) * .015, -.14, -.9, -1.25)
    feel(r, w, FACES.sleep)
  },
  doze(r, w, t, b) {
    const up = 1 - b.lying
    r.headX += .28 * w * up
    r.headZ += .32 * w
    r.spineX += .05 * w * up
    for (let i = 0; i < 2; i += 1) arm(r, i, w * up, -.45, -.15, -.7)
    for (let i = 0; i < 2; i += 1) arm(r, i, w * b.lying, -.6, -.3, -1.35)
    feel(r, w, FACES.sleep)
  },
  drink(r, w, t) {
    const sip = smooth(pulse(t, 3.4, 1.3) * 1.6)
    arm(r, 1, w, -.7 - 1.0 * sip, .06 - .1 * sip, -1.3 + .4 * sip, -.7 - .2 * sip)
    arm(r, 0, w, -.1, .05, -.25)
    r.headX -= .22 * sip * w
    r.propTilt += sip * w
    feel(r, w, FACES.calm)
    r.open -= .2 * sip * w
  },
  phone(r, w, t, b) {
    // deitado vale o mesmo: o celular fica sobre o peito e o queixo abaixa para olhar
    r.headX += .36 * w
    r.spineX += .06 * w * (1 - b.lying)
    for (let i = 0; i < 2; i += 1) arm(r, i, w, -.95, -.14, -1.4 + Math.sin(t * 9 + i * 1.7) * .05, -.7)
    feel(r, w, b.propName === 'phone' ? FACES.calm : FACES.game)
    if (b.propName !== 'phone') r.smile += Math.max(0, Math.sin(t * .9)) * .3 * w
  },
  play(r, w, t) {
    r.spineX += .08 * w
    r.headX -= .08 * w
    for (let i = 0; i < 2; i += 1) arm(r, i, w, -.85 + Math.sin(t * 17 + i * 2) * .09, -.15, -.5 + Math.sin(t * 13 + i) * .1)
    feel(r, w, FACES.game)
  },
  foos(r, w, t) {
    r.spineX += .18 * w
    r.spineY += Math.sin(t * 6) * .14 * w
    r.headX += .15 * w
    for (let i = 0; i < 2; i += 1) arm(r, i, w, -.75 + Math.sin(t * 12 + i * Math.PI) * .14, .1, -.35)
    feel(r, w, FACES.happy)
  },
  wave(r, w, t) {
    arm(r, 1, w, -2.5, .35, -.5 + Math.sin(t * 11) * .35)
    feel(r, w, FACES.happy)
  },
  point(r, w, t) {
    arm(r, 1, w, -1.95, -.12 + Math.sin(t * 2.2) * .14, -.35 + Math.sin(t * 7) * .12)
    arm(r, 0, w, -.25, .55, -1.45, .4)
    r.headX -= .12 * w
    r.headZ += Math.sin(t * 1.1) * .06 * w
    feel(r, w, FACES.puzzled)
    r.smile += .3 * w
  },
  water(r, w, t) {
    arm(r, 1, w, -1.0, -.1, -.3)
    arm(r, 0, w, -.15, .05, -.25)
    r.propTilt += (.6 + Math.sin(t * 2) * .15) * w
    r.headX += .25 * w
    feel(r, w, FACES.happy)
  },
  pet(r, w, t) {
    arm(r, 1, w, -1.05 + Math.sin(t * 6) * .12, -.12, -.15)
    arm(r, 0, w, -.3, .2, -.6)
    r.spineX += .25 * w
    r.headX += .3 * w
    feel(r, w, FACES.love)
  },
  look(r, w, t) {
    for (let i = 0; i < 2; i += 1) arm(r, i, w, .42, -.28, -.35)
    r.headX -= .14 * w
    r.headY += Math.sin(t * .45) * .35 * w
    r.spineX -= .04 * w
    feel(r, w, FACES.calm)
  },
  relax(r, w, t, b) {
    for (let i = 0; i < 2; i += 1) arm(r, i, w, -2.55, .78, -2.2)
    r.spineX -= .06 * w * (1 - b.lying)
    r.headX -= .08 * w
    feel(r, w, FACES.calm)
  },
  cross(r, w) {
    for (let i = 0; i < 2; i += 1) arm(r, i, w, -1.3, -.54, -1.2, -1.3)
    r.headZ += .1 * w
    r.headX -= .06 * w
    feel(r, w, FACES.annoyed)
  },
  highfive(r, w, t) {
    arm(r, 1, w, -2.45, -.15, -.25)
    arm(r, 0, w, -.2, .25, -.4)
    r.spineX -= .05 * w
    feel(r, w, FACES.joy)
  },
}
const ACT_NAMES = Object.keys(ACTS)
const BASE_NAMES = ['sit', 'lie', 'crouch']
const WEIGHT_NAMES = ['walk', ...BASE_NAMES, ...ACT_NAMES]
const FOCUSED = ['type', 'sleep', 'play', 'foos', 'phone', 'point', 'water', 'pet', 'drink']

// Gestos curtos que tomam conta dos braços e do rosto por um instante.
const GESTURES = {
  stretch: { dur: 2.3, apply(r, e, g) { for (let i = 0; i < 2; i += 1) arm(r, i, e, -2.95, .28, -.15); r.spineX -= .14 * e; r.headX -= .25 * e; feel(r, e, FACES.stretch) } },
  yawn: { dur: 2.1, apply(r, e, g) { arm(r, 1, e, -2.4, -.34, -.4, -1.0); r.headX -= .2 * e; feel(r, e, FACES.yawn) } },
  scratch: { dur: 1.5, apply(r, e, g) { arm(r, 1, e, -2.4, .46, -.25 + Math.sin(g * 18) * .2, -1.1); r.headZ -= .16 * e; feel(r, e, FACES.puzzled) } },
  nod: { dur: .9, apply(r, e, g) { r.headX += Math.sin(g * 14) * .16 * e; feel(r, e, FACES.happy) } },
  clap: { dur: 1.1, apply(r, e, g) { for (let i = 0; i < 2; i += 1) arm(r, i, e, -1.4, -.04 + Math.abs(Math.sin(g * 14)) * .25, -.8, -1.0); feel(r, e, FACES.joy) } },
  shrug: { dur: 1.2, apply(r, e, g) { for (let i = 0; i < 2; i += 1) arm(r, i, e, -.3, .55, -1.35, -.6); r.headZ += .14 * e; r.hipY += .015 * e; feel(r, e, FACES.shrug) } },
  wave: { dur: 1.5, apply(r, e, g) { arm(r, 1, e, -2.55, .35, -.45 + Math.sin(g * 12) * .4); feel(r, e, FACES.happy) } },
  sigh: { dur: 1.6, apply(r, e, g) { r.spineX += .14 * e; r.headX += .3 * e; for (let i = 0; i < 2; i += 1) arm(r, i, e, -.1, -.05, -.1); feel(r, e, FACES.sad) } },
}

export class Boneco {
  constructor(lookIn, { founder = false } = {}) {
    const look = dressLook(lookIn)
    this.look = look
    const seed = hashString(`${look.skin}${look.hair}${look.shirt}${look.height}`)
    this.seed = (seed % 1000) / 1000
    this.scale = look.height
    this.root = new THREE.Group()
    this.body = new THREE.Group()
    this.body.scale.setScalar(this.scale)
    this.root.add(this.body)

    const skin = mat(look.skin, { rough: .65 })
    const pants = mat(look.pants)
    const shirt = look.top === 'listrada' ? stripeMaterial(look.shirt, look.accent) : mat(look.shirt)
    const shoes = mat(look.shoes, { rough: .5 })
    const longSleeves = look.top === 'moletom' || look.top === 'camisa'

    this.hip = new THREE.Group()
    this.hip.position.y = HIP_Y
    this.body.add(this.hip)
    const pelvis = mesh(G.pelvis, pants)
    pelvis.scale.set(1, .55, .86)
    this.hip.add(pelvis)
    if (look.bottom === 'saia') {
      this.skirt = mesh(G.skirt, pants)
      this.skirt.position.y = -.055
      this.skirt.scale.z = .9
      this.hip.add(this.skirt)
    }

    this.legs = [-1, 1].map(side => {
      const thigh = new THREE.Group()
      thigh.position.x = side * .072
      const upperLeg = mesh(look.bottom === 'bermuda' ? G.shorts : G.thigh, look.bottom === 'saia' ? skin : pants)
      upperLeg.position.y = -.07
      thigh.add(upperLeg)
      const knee = new THREE.Group()
      knee.position.y = -THIGH
      thigh.add(knee)
      const shin = mesh(G.shin, look.bottom === 'calca' ? pants : skin)
      shin.position.y = -.068
      knee.add(shin)
      const shoe = mesh(G.shoe, shoes, false)
      shoe.position.set(0, -(SHIN + SOLE) + .05, .026)
      shoe.scale.set(1, .74, 1.42)
      knee.add(shoe)
      this.hip.add(thigh)
      return { thigh, knee }
    })

    this.spine = new THREE.Group()
    this.spine.position.y = .02
    this.hip.add(this.spine)
    this.torso = mesh(G.torso, shirt)
    this.torso.scale.z = .86
    this.spine.add(this.torso)
    this.dress(look, shirt, pants, founder)

    this.arms = [-1, 1].map(side => {
      const shoulder = new THREE.Group()
      shoulder.position.set(side * SHOULDER_X, SHOULDER_Y, 0)
      const upperArm = mesh(G.upper, shirt)
      upperArm.position.y = -.05
      shoulder.add(upperArm)
      const elbow = new THREE.Group()
      elbow.position.y = -UPPER
      shoulder.add(elbow)
      const fore = mesh(G.fore, longSleeves ? shirt : skin)
      fore.position.y = -.05
      elbow.add(fore)
      const hand = mesh(G.hand, skin, false)
      hand.position.y = -FORE
      hand.scale.set(1, 1.05, .88)
      elbow.add(hand)
      const grip = new THREE.Group()
      grip.position.y = -FORE - .012
      elbow.add(grip)
      this.spine.add(shoulder)
      return { shoulder, elbow, grip }
    })

    this.neck = new THREE.Group()
    this.neck.position.y = NECK_Y
    this.spine.add(this.neck)
    this.skull = new THREE.Group()
    this.skull.position.y = HEAD_LIFT
    this.neck.add(this.skull)
    this.skull.add(mesh(G.head, skin))
    this.buildFace(look)
    this.buildHair(look)

    const shadow = new THREE.Mesh(G.shadow, SHADOW)
    shadow.rotation.x = -HALF_PI
    shadow.position.y = .005
    this.root.add(shadow)
    this.shadow = shadow

    this.hit = new THREE.Mesh(G.hit, HIT)
    this.hit.position.y = .6
    this.root.add(this.hit)

    this.t = Math.random() * 10
    this.blink = 2 + Math.random() * 3
    this.w = {}
    this.goal = {}
    for (const name of WEIGHT_NAMES) this.w[name] = this.goal[name] = 0
    this.walkPhase = 0
    this.standing = 1
    this.lying = 0
    this.lift = 0
    this.deskLean = .4
    this.seatHigh = 0
    this.mood = { tired: 0, stress: 0, love: 0 }
    this.talking = 0
    this.gaze = null
    this.yaw = 0
    this.idleYaw = 0
    this.idleTimer = 1
    this.gest = null
    this.props = {}
    this.prop = null
    this.propName = null
    this.hat = null
    this.zs = null
    this.sweatT = 0
  }

  get seatHip() { return SEAT_HIP * this.scale }

  // ----- montagem -----
  dress(look, shirt, pants, founder) {
    const sp = this.spine
    if (look.top === 'moletom') {
      sp.add(mesh(CLOTHES.hood(), shirt))
      sp.add(mesh(CLOTHES.strings(), flat(look.accent === look.shirt ? '#ffffff' : look.accent), false))
    } else if (look.top === 'camisa') {
      sp.add(mesh(CLOTHES.collar(), mat(look.shirt === '#f1f3f5' ? look.accent : '#ffffff'), false))
    } else if (look.top === 'macacao') {
      sp.add(mesh(CLOTHES.bib(), pants))
      sp.add(mesh(CLOTHES.buttons(), mat('#ffd23f', { rough: .3 }), false))
    } else if (look.top === 'camiseta' && look.print) {
      const print = mesh(G.print, flat(look.accent), false)
      print.position.set(-.04, .15, .128)
      sp.add(print)
    }
    if (founder) {
      const badge = mesh(G.badge, mat('#ffd43b', { emissive: '#ffb703', emissiveIntensity: .3 }), false)
      badge.position.set(.068, .2, .118)
      badge.rotation.set(-.15, .25, Math.PI / 10)
      sp.add(badge)
    }
  }

  buildFace(look) {
    const s = this.skull
    // olhos, brilhos, olhos fechados e bochechas: um buffer para o par (menos chamadas de desenho)
    this.eyes = new THREE.Group()
    this.eyes.position.y = EYE_Y
    this.eyes.add(new THREE.Mesh(FACE.eyes(), INK), new THREE.Mesh(FACE.glints(), GLINT))
    this.happyEyes = new THREE.Mesh(FACE.happy(), INK)
    this.shutEyes = new THREE.Mesh(FACE.shut(), INK)
    this.happyEyes.visible = this.shutEyes.visible = false
    this.cheekMat = CHEEK.clone()
    this.cheeks = new THREE.Mesh(FACE.cheeks(), this.cheekMat)
    this.cheeks.renderOrder = 1
    s.add(this.eyes, this.happyEyes, this.shutEyes, this.cheeks)
    this.blushBase = look.blush ? 1 : .4
    this.brows = []
    const browMat = flat(shade(look.hair, .45))
    for (const side of [-1, 1]) {
      const brow = onHead(new THREE.Mesh(G.brow, browMat), side * .085, BROW_Y, .004)
      s.add(brow)
      this.brows.push(brow)
    }
    this.mouthArc = onHead(new THREE.Mesh(G.mouthArc, MOUTH_LINE), 0, -.09, .002)
    this.mouthO = onHead(new THREE.Mesh(G.mouthO, MOUTH), 0, -.095, .003)
    this.mouthD = onHead(new THREE.Mesh(G.mouthD, MOUTH), 0, -.078, .003)
    const tongue = new THREE.Mesh(G.tongue, TONGUE)
    tongue.position.set(0, -.02, .001)
    this.mouthD.add(tongue)
    this.mouthO.visible = this.mouthD.visible = false
    this.mouthBaseY = this.mouthArc.position.y
    s.add(this.mouthArc, this.mouthO, this.mouthD)
    this.sweat = new THREE.Mesh(G.sweat, SWEAT)
    this.sweat.position.set(.2, .1, .1)
    this.sweat.visible = false
    s.add(this.sweat)
  }

  buildHair(look) {
    const s = this.skull
    const shape = hairShape(look.cut ?? look.hairStyle)
    const hairMat = mat(look.hair, { rough: .9 })
    const hatOn = look.extra === 'bone' || look.hat === 'gorro'
    if (shape.crown && !hatOn) s.add(mesh(shape.crown, hairMat))
    if (shape.crown && hatOn && look.cut === 'black') {
      const afro = mesh(shape.crown, hairMat)
      afro.scale.setScalar(.92)
      s.add(afro)
    }
    if (shape.rest) s.add(mesh(shape.rest, hairMat))
    this.hairTop = hatOn ? Math.max(shape.top, .28 * shape.hat) : shape.top

    const lift = (shape.hat - 1) * .3
    if (look.extra === 'oculos') s.add(mesh(ACC[look.frames === 'quadrado' ? 'quadrado' : 'redondo'](), mat('#22252c', { rough: .35 }), false))
    if (look.extra === 'fone') {
      s.add(mesh(ACC.band(shape.wide), mat('#2b2f3a', { rough: .5 }), false))
      s.add(mesh(ACC.cups(shape.wide), mat(look.accent === '#ffffff' ? '#ff5d3a' : look.accent, { rough: .45 }), false))
    }
    if (look.extra === 'bone') {
      const cap = new THREE.Group()
      cap.add(mesh(ACC.bone(), mat(look.shirt, { rough: .8 })), mesh(ACC.brim(), mat(shade(look.shirt, .25), { rough: .7 }), false))
      cap.scale.setScalar(shape.hat)
      cap.position.y = lift
      if (look.capBack) cap.rotation.y = Math.PI
      s.add(cap)
    } else if (look.hat === 'gorro') {
      const beanie = mesh(ACC.gorro(), mat(look.accent === look.shirt ? '#ff5d3a' : look.accent, { rough: .95 }))
      beanie.scale.setScalar(shape.hat)
      beanie.position.y = lift
      s.add(beanie)
      const pom = mesh(ACC.pompom(), mat('#fff8ec', { rough: 1 }), false)
      pom.scale.setScalar(shape.hat)
      pom.position.y = lift
      s.add(pom)
    } else if (look.hat === 'faixa') {
      const band = mesh(ACC.faixa(), mat(look.accent === '#1d1a24' ? '#ff5d3a' : look.accent, { rough: .8 }), false)
      band.scale.setScalar(shape.hat > 1 ? 1.2 : 1)
      band.position.y = lift * .5
      s.add(band)
    }
  }

  // ----- controle -----
  // Ação dos braços e do rosto; zera as outras ações (sentar e deitar ficam como estão).
  setPose(name, value = 1) {
    if (name === 'sit' || name === 'lie' || name === 'crouch') return this.setBase(name)
    for (const key of ACT_NAMES) this.goal[key] = 0
    if (name && name in ACTS) this.goal[name] = value
  }

  setBase(name) {
    for (const key of BASE_NAMES) this.goal[key] = 0
    if (name && name !== 'stand') this.goal[name] = 1
  }

  snapBase() {
    for (const key of BASE_NAMES) this.w[key] = this.goal[key]
  }

  gesture(name) {
    if (!GESTURES[name] || this.gest) return false
    this.gest = { name, t: 0, dur: GESTURES[name].dur }
    return true
  }

  setProp(name) {
    if (this.propName === name) return
    if (this.prop) this.prop.visible = false
    this.propName = name ?? null
    this.prop = null
    if (!name || !PROP[name]) return
    if (!this.props[name]) {
      const group = new THREE.Group()
      const tilt = new THREE.Group()
      for (const [geometry, material] of PROP[name]()) tilt.add(mesh(geometry, material, false))
      group.add(tilt)
      const pose = PROP_POSE[name]
      group.position.set(...pose.p)
      group.rotation.set(...pose.r)
      group.scale.setScalar(pose.scale ?? 1)
      group.userData.tilt = tilt
      group.userData.amount = pose.tilt
      this.arms[1].grip.add(group)
      this.props[name] = group
    }
    this.prop = this.props[name]
    this.prop.visible = true
  }

  partyHat(on) {
    if (on && !this.hat) {
      const color = PARTY_COLORS[Math.floor(this.seed * PARTY_COLORS.length)]
      const group = new THREE.Group()
      const cone = mesh(PARTY.cone, mat(color, { rough: .5 }), false)
      cone.position.y = .095
      group.add(cone)
      const ball = mesh(PARTY.ball, mat('#fff8ec', { rough: .9 }), false)
      ball.position.y = .2
      group.add(ball)
      group.position.set(.03, this.hairTop - .03, -.02)
      group.rotation.set(-.15, 0, -.28)
      this.skull.add(group)
      this.hat = group
    }
    if (this.hat) this.hat.visible = Boolean(on)
  }

  // Zzz que sobem da cabeça: três sprites que crescem e somem (material único).
  ensureZ() {
    if (this.zs) return
    this.zs = []
    for (let i = 0; i < 3; i += 1) {
      const sprite = new THREE.Sprite(Z_MATERIAL())
      sprite.visible = false
      sprite.renderOrder = 9
      this.root.add(sprite)
      this.zs.push(sprite)
    }
  }

  // ----- animação -----
  update(dt, speed = 0) {
    this.t += dt
    const t = this.t
    const w = this.w
    const goal = this.goal
    goal.walk = speed > .01 ? 1 : 0
    const kAct = 1 - Math.exp(-dt * 9)
    const kBase = 1 - Math.exp(-dt * 6)
    for (const name of WEIGHT_NAMES) w[name] += (goal[name] - w[name]) * (name === 'sit' || name === 'lie' || name === 'crouch' ? kBase : kAct)
    const sit = w.sit
    const lie = w.lie
    const crouch = w.crouch
    const walk = w.walk
    this.lying = lie
    this.standing = clamp01(1 - sit - lie - crouch)
    const stand = this.standing
    const r = RIG
    resetRig(r)

    let acting = 0
    for (const name of ACT_NAMES) acting += w[name]
    acting = clamp01(acting)
    const free = 1 - acting

    // gesto em andamento: os braços e o rosto obedecem a ele
    let ge = 0
    if (this.gest) {
      const g = this.gest
      g.t += dt
      ge = smooth(g.t / .3) * smooth((g.dur - g.t) / .35)
      if (g.t >= g.dur) this.gest = null
    }
    const actScale = 1 - ge

    // respiração (mais lenta dormindo)
    const sleepy = Math.max(w.sleep, w.doze)
    const breath = Math.sin(t * (sleepy > .5 ? 1.25 : 2.1) + this.seed * 6)

    // ---- base: pernas e quadril ----
    // em pé + caminhada
    this.walkPhase += dt * 10.5 * Math.min(1.6, speed)
    const ph = this.walkPhase
    for (let i = 0; i < 2; i += 1) {
      const p = ph + i * Math.PI
      r.tX[i] += -Math.sin(p) * .55 * walk
      r.kn[i] += Math.max(0, Math.cos(p)) * .75 * walk
      r.aX[i] += -Math.sin(ph + (1 - i) * Math.PI) * .5 * walk
      r.el[i] += -.28 * walk
    }
    r.hipY += Math.abs(Math.sin(ph)) * .03 * walk
    r.hipRZ += Math.sin(ph) * .035 * walk
    r.spineY += Math.sin(ph) * .08 * walk
    r.spineX += .05 * walk
    r.headX -= Math.abs(Math.sin(ph)) * .03 * walk

    // descanso em pé: troca o peso de perna, balança de leve
    const idle = stand * (1 - walk) * free
    const shift = Math.sin(t * .5 + this.seed * 9)
    r.hipX += shift * .014 * idle
    r.hipRZ += shift * .035 * idle
    r.kn[shift > 0 ? 0 : 1] += Math.abs(shift) * .14 * idle
    r.tX[shift > 0 ? 0 : 1] -= Math.abs(shift) * .05 * idle

    // sentado: coxas no assento; canela pendurada ou apoiada no chão se der
    if (sit > .001) {
      const hipAbove = HIP_Y + this.lift / this.scale
      const reach = SHIN + SOLE
      let bend
      if (hipAbove <= reach + .005) bend = HALF_PI - Math.acos(Math.min(1, hipAbove / reach))
      else bend = 1.05 - .7 * clamp01((this.seatHigh - .3) / .1)
      const swing = (w.relax + w.phone + w.listen + w.talk + free * .6) * (hipAbove > reach + .03 ? 1 : 0)
      for (let i = 0; i < 2; i += 1) {
        r.tX[i] += (-HALF_PI + .06) * sit
        r.kn[i] += (bend + Math.sin(t * 2.3 + i * Math.PI + this.seed * 4) * .14 * Math.min(1, swing)) * sit
        r.tZ[i] += sideOf(i) * .04 * sit
      }
      r.hipRX -= .04 * sit
      for (let i = 0; i < 2; i += 1) arm(r, i, sit * free * actScale, -.55, -.12, -.55)
    }

    // deitado: corpo todo de costas sobre o colchão, um joelho dobrado
    if (lie > .001) {
      r.tX[0] += -.38 * lie
      r.kn[0] += .62 * lie
      r.tX[1] += -.04 * lie
      r.kn[1] += .06 * lie
      for (let i = 0; i < 2; i += 1) arm(r, i, lie * free * actScale, -.6, -.3, -1.25)
    }

    // agachado (fazendo carinho no gato)
    if (crouch > .001) {
      r.hipY -= .125 * crouch
      for (let i = 0; i < 2; i += 1) {
        r.tX[i] += -1.25 * crouch
        r.kn[i] += 1.9 * crouch
        r.tZ[i] += sideOf(i) * .12 * crouch
      }
      r.spineX += .2 * crouch
    }

    // ---- ações ----
    for (const name of ACT_NAMES) {
      const v = w[name] * actScale
      if (v > .002) ACTS[name](r, v, t, this)
    }
    if (this.gest) GESTURES[this.gest.name].apply(r, ge, this.gest.t, this)

    // humor de fundo: cansaço e estresse aparecem no rosto e na postura
    const { tired, stress, love } = this.mood
    if (tired > .01) {
      r.eye -= .38 * tired
      r.browTilt += .3 * tired
      r.smile -= .2 * tired
      r.spineX += .05 * tired * stand
      r.headX += .06 * tired
    }
    if (stress > .01) {
      r.browTilt -= .55 * stress
      r.smile -= .4 * stress
    }
    r.blush += love * .8

    // falando (qualquer balão de fala aberto)
    if (this.talking > .01) {
      const chatter = (.25 + .6 * Math.abs(Math.sin(t * 12.7) * Math.sin(t * 5.3))) * this.talking
      if (chatter > r.open) r.open = chatter
      r.headX += Math.sin(t * 6.5) * .035 * this.talking
    }

    // olhar: segue alguém (conversa) ou passeia sozinho quando parado
    let focus = 0
    for (const name of FOCUSED) focus += w[name]
    focus = clamp01(focus + walk * .7 + sleepy + lie * .6)
    this.idleTimer -= dt
    if (this.idleTimer <= 0) {
      this.idleTimer = 1.4 + Math.random() * 3
      this.idleYaw = Math.random() < .35 ? 0 : (Math.random() - .5) * 1.3
    }
    let yawGoal = this.idleYaw * (1 - focus)
    if (this.gaze) {
      const dx = this.gaze.x - this.root.position.x
      const dz = this.gaze.z - this.root.position.z
      let a = Math.atan2(dx, dz) - this.root.rotation.y
      a = Math.atan2(Math.sin(a), Math.cos(a))
      yawGoal = Math.max(-1.15, Math.min(1.15, a)) * (1 - clamp01(focus - .3))
    }
    this.yaw += (yawGoal - this.yaw) * (1 - Math.exp(-dt * 5))
    r.headY += this.yaw * .72
    r.spineY += this.yaw * .25 * stand

    // ---- aplica ----
    const s = this.scale
    this.body.rotation.x = -HALF_PI * lie
    this.body.position.set(0, LIE_BACK * s * lie, LIE_CENTER * s * lie)
    this.hip.position.set(r.hipX, HIP_Y + r.hipY + r.jump, r.hipZ)
    this.hip.rotation.set(r.hipRX, r.hipRY, r.hipRZ)
    this.spine.rotation.set(r.spineX, r.spineY, r.spineZ)
    this.neck.rotation.set(r.headX, r.headY, r.headZ)
    this.torso.scale.set(1 + breath * .008, 1 + breath * .014, .86 + breath * .01)
    for (let i = 0; i < 2; i += 1) {
      const a = this.arms[i]
      a.shoulder.rotation.set(r.aX[i], r.aY[i], r.aZ[i] + sideOf(i) * (.14 + breath * .012))
      a.elbow.rotation.x = r.el[i]
      const leg = this.legs[i]
      leg.thigh.rotation.set(r.tX[i], 0, r.tZ[i])
      leg.knee.rotation.x = r.kn[i]
    }
    if (this.skirt) this.skirt.scale.y = 1 - .45 * Math.max(sit, crouch)
    if (this.prop) this.prop.userData.tilt.rotation.x = r.propTilt * this.prop.userData.amount

    this.applyFace(r, dt)

    // sombra sempre no chão (ou no colchão, deitado)
    const jumpShrink = 1 - r.jump * 1.4
    this.shadow.position.y = .006 - this.lift * (1 - lie)
    this.shadow.scale.set((1 + .2 * lie) * jumpShrink, (1 + 1.4 * lie) * jumpShrink, 1)

    this.updateZ(sleepy * (r.closed > .5 ? 1 : 0), dt)
  }

  applyFace(r, dt) {
    this.blink -= dt
    let eye = r.eye
    if (this.blink < 0) {
      eye *= .1
      if (this.blink < -.13) this.blink = 1.8 + Math.random() * 3.6
    }
    const closed = r.closed > .5
    const happy = !closed && r.happy > .5
    this.eyes.visible = !closed && !happy
    this.eyes.scale.y = Math.max(.08, Math.min(1.15, eye))
    this.happyEyes.visible = happy
    this.shutEyes.visible = closed
    for (let i = 0; i < 2; i += 1) {
      const brow = this.brows[i]
      brow.position.y = BROW_Y + .018 * r.browUp - (r.browTilt < 0 ? .006 * -r.browTilt : 0)
      brow.rotation.z = sideOf(i) * -.45 * r.browTilt
    }
    this.cheekMat.opacity = Math.min(.85, .3 + .2 * this.blushBase + .3 * Math.max(0, r.blush))
    const laugh = r.laugh > .35
    const open = !laugh && r.open > .1
    this.mouthD.visible = laugh
    this.mouthO.visible = open
    this.mouthArc.visible = !laugh && !open
    if (laugh) this.mouthD.scale.set(1, .55 + .45 * Math.min(1.2, r.laugh), 1)
    else if (open) this.mouthO.scale.set(.75 + .3 * Math.min(1, r.open), .3 + 1.1 * Math.min(1, r.open), 1)
    else {
      const m = Math.max(-1, Math.min(1, r.smile))
      this.mouthArc.rotation.z = m >= 0 ? Math.PI : 0
      this.mouthArc.scale.set(.8 + .25 * Math.abs(m), .22 + .78 * Math.abs(m), 1)
      this.mouthArc.position.y = this.mouthBaseY + (m >= 0 ? .006 : -.008) * Math.abs(m)
    }
    // gota de suor no estresse
    const stressed = this.mood.stress > .5 && this.lying < .5
    this.sweat.visible = stressed
    if (stressed) {
      this.sweatT = (this.sweatT + dt * .7) % 1
      this.sweat.position.y = .12 - this.sweatT * .12
      this.sweat.scale.setScalar(Math.sin(this.sweatT * Math.PI) * 1.1)
    }
  }

  updateZ(amount, dt) {
    if (amount < .5 && !this.zs) return
    this.ensureZ()
    const on = amount >= .5
    if (on) {
      this.skull.getWorldPosition(V1)
      this.root.worldToLocal(V1)
    }
    for (let i = 0; i < 3; i += 1) {
      const z = this.zs[i]
      z.visible = on
      if (!on) continue
      const p = (this.t * .42 + i / 3) % 1
      z.position.set(V1.x + .12 + p * .16 + Math.sin(p * 7 + i) * .04, V1.y + .2 + p * .55, V1.z)
      z.scale.setScalar(.2 * Math.sin(p * Math.PI) * (.7 + i * .15))
    }
  }

  dispose() {
    this.root.removeFromParent()
  }
}

let zMaterial = null
function Z_MATERIAL() {
  if (!zMaterial) zMaterial = new THREE.SpriteMaterial({ map: zTexture(), transparent: true, depthWrite: false })
  return zMaterial
}

// Põe um detalhe do rosto colado na esfera da cabeça, virado para fora.
function onHead(object, x, y, lift = 0) {
  const z = Math.sqrt(Math.max(0, R * R - x * x - y * y))
  V1.set(x, y, z).normalize()
  object.position.copy(V1).multiplyScalar(R + .004 + lift)
  object.rotation.order = 'YXZ'
  object.rotation.set(-Math.asin(V1.y), Math.atan2(V1.x, V1.z), 0)
  return object
}

// Matriz de um detalhe colado na esfera da cabeça (mesma regra de onHead), para fundir pares.
const FACE_EULER = new THREE.Euler(0, 0, 0, 'YXZ')
function faceMatrix(x, y, lift, sx = 1, sy = 1, sz = 1, rz = 0) {
  const z = Math.sqrt(Math.max(0, R * R - x * x - y * y))
  const n = new THREE.Vector3(x, y, z).normalize()
  FACE_EULER.set(-Math.asin(n.y), Math.atan2(n.x, n.z), rz, 'YXZ')
  return new THREE.Matrix4().compose(n.clone().multiplyScalar(R + .004 + lift), new THREE.Quaternion().setFromEuler(FACE_EULER), new THREE.Vector3(sx, sy, sz))
}
const EYE_Y = -.006
const eyeAt = s => faceMatrix(s * .083, EYE_Y, -.004, 1, 1.3, .5)
const FACE = {
  eyes: () => fuse('eyes', () => [-1, 1].map(s => G.eye.clone().applyMatrix4(eyeAt(s)).translate(0, -EYE_Y, 0))),
  glints: () => fuse('glints', () => [-1, 1].map(s => G.glint.clone().translate(.012, .013, .028).applyMatrix4(eyeAt(s)).translate(0, -EYE_Y, 0))),
  happy: () => fuse('happyEyes', () => [-1, 1].map(s => G.eyeArc.clone().applyMatrix4(faceMatrix(s * .083, -.012, .002)))),
  shut: () => fuse('shutEyes', () => [-1, 1].map(s => G.eyeArc.clone().applyMatrix4(faceMatrix(s * .083, -.016, .002, 1, 1, 1, Math.PI)))),
  cheeks: () => fuse('cheeks', () => [-1, 1].map(s => G.cheek.clone().applyMatrix4(faceMatrix(s * .142, -.058, .003)))),
}

function mesh(geometry, material, cast = true) {
  const m = new THREE.Mesh(geometry, material)
  m.castShadow = cast
  return m
}

// ---------- gato ----------
const CAT = {
  body: new THREE.CapsuleGeometry(.092, .2, 5, 12).rotateX(HALF_PI),
  belly: new THREE.SphereGeometry(.08, 12, 9),
  head: new THREE.SphereGeometry(.1, 16, 12),
  ear: new THREE.ConeGeometry(.042, .085, 4).rotateY(Math.PI / 4).scale(1, 1, .55),
  muzzle: new THREE.SphereGeometry(.042, 10, 8),
  nose: new THREE.SphereGeometry(.013, 6, 5),
  leg: new THREE.CapsuleGeometry(.024, .08, 3, 6),
  paw: new THREE.SphereGeometry(.03, 8, 6),
  tail: new THREE.CapsuleGeometry(.022, .075, 3, 6),
  eyeArc: new THREE.TorusGeometry(.017, .006, 4, 10, Math.PI),
  whiskers: mergeGeometries([-1, 1].flatMap(s => [
    piece(new THREE.BoxGeometry(.08, .004, .004), { x: s * .06, y: -.03, z: .09, rz: s * .12, ry: s * -.3 }),
    piece(new THREE.BoxGeometry(.08, .004, .004), { x: s * .06, y: -.045, z: .09, rz: s * -.08, ry: s * -.3 }),
  ])),
}
const CAT_PATCH = { '#3b3b3b': '#f5f5f5', '#f0a24a': '#ffe2b8', '#f5f5f5': '#ffffff', '#c9a27a': '#6b4f3a', '#8e8e8e': '#f0f0f0' }

// Gato do escritório: anda, senta, se lambe, dorme enrolado e ronrona no carinho.
export class Gato {
  constructor(color = '#f0a24a') {
    this.root = new THREE.Group()
    const fur = mat(color, { rough: .9 })
    const patchColor = CAT_PATCH[color] ?? '#ffffff'
    const patch = mat(patchColor, { rough: .95 })
    const points = color === '#c9a27a' ? patch : fur
    this.pivot = new THREE.Group()
    this.root.add(this.pivot)

    this.body = mesh(CAT.body, fur)
    this.body.position.set(0, .17, 0)
    this.pivot.add(this.body)
    const belly = mesh(CAT.belly, color === '#c9a27a' ? fur : patch, false)
    belly.position.set(0, -.03, .07)
    belly.scale.set(.85, .8, 1)
    this.body.add(belly)

    this.head = new THREE.Group()
    this.head.position.set(0, .27, .17)
    this.pivot.add(this.head)
    const skull = mesh(CAT.head, fur)
    skull.scale.set(1.1, .95, 1)
    this.head.add(skull)
    for (const s of [-1, 1]) {
      const ear = mesh(CAT.ear, points)
      ear.position.set(s * .058, .08, -.005)
      ear.rotation.set(-.1, s * .25, s * -.3)
      this.head.add(ear)
    }
    const muzzle = mesh(CAT.muzzle, color === '#c9a27a' ? patch : patch, false)
    muzzle.position.set(0, -.035, .072)
    muzzle.scale.set(1.35, .8, .9)
    this.head.add(muzzle)
    const nose = new THREE.Mesh(CAT.nose, flat('#ff8fa3'))
    nose.position.set(0, -.012, .108)
    this.head.add(nose)
    this.head.add(new THREE.Mesh(CAT.whiskers, flat(color === '#3b3b3b' ? '#d9d9d9' : '#3a3440')))
    this.eyes = []
    this.arcs = []
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(G.eye, INK)
      eye.scale.set(.62, .8, .4)
      eye.position.set(s * .045, .012, .088)
      eye.rotation.y = s * .4
      const glint = new THREE.Mesh(G.glint, GLINT)
      glint.position.set(.012, .014, .028)
      eye.add(glint)
      this.head.add(eye)
      this.eyes.push(eye)
      const arcEye = new THREE.Mesh(CAT.eyeArc, INK)
      arcEye.position.set(s * .045, .006, .092)
      arcEye.rotation.y = s * .4
      arcEye.visible = false
      this.head.add(arcEye)
      this.arcs.push(arcEye)
    }

    // rabo em três gomos para ondular
    this.tail = []
    let parent = this.pivot
    for (let i = 0; i < 3; i += 1) {
      const seg = new THREE.Group()
      seg.position.set(0, i ? .085 : .2, i ? 0 : -.16)
      const bit = mesh(CAT.tail, i === 2 ? points : fur)
      bit.position.y = .045
      seg.add(bit)
      parent.add(seg)
      this.tail.push(seg)
      parent = seg
    }

    this.legs = []
    for (const [x, z] of [[-.055, .1], [.055, .1], [-.055, -.1], [.055, -.1]]) {
      const hip = new THREE.Group()
      hip.position.set(x, .12, z)
      const leg = mesh(CAT.leg, fur)
      leg.position.y = -.055
      hip.add(leg)
      const paw = mesh(CAT.paw, color === '#3b3b3b' || color === '#8e8e8e' ? patch : fur, false)
      paw.position.set(0, -.105, .012)
      paw.scale.set(1, .6, 1.2)
      hip.add(paw)
      this.pivot.add(hip)
      this.legs.push(hip)
    }

    const shadow = new THREE.Mesh(G.shadow, SHADOW)
    shadow.rotation.x = -HALF_PI
    shadow.scale.set(.7, 1.2, 1)
    shadow.position.y = .005
    this.root.add(shadow)
    this.shadow = shadow
    this.hit = new THREE.Mesh(new THREE.BoxGeometry(.32, .4, .55), HIT)
    this.hit.position.y = .2
    this.root.add(this.hit)

    this.t = Math.random() * 5
    this.sleeping = 0
    this.sitting = 0
    this.walking = 0
    this.purr = 0
    this.groom = 0
    this.blink = 2
    this.lift = 0
  }

  update(dt, speed) {
    this.t += dt
    const t = this.t
    this.walking += ((speed > .01 ? 1 : 0) - this.walking) * Math.min(1, dt * 8)
    this.purr = Math.max(0, this.purr - dt)
    if (this.groom > 0) this.groom = Math.max(0, this.groom - dt)
    else if (this.sitting > .8 && Math.random() < dt * .08) this.groom = 2.4
    const s = this.sleeping
    const sit = this.sitting * (1 - s)
    const walk = this.walking
    const groom = this.groom > 0 ? smooth(Math.min(this.groom, 2.4 - this.groom) / .3) * sit : 0

    // corpo: senta erguendo o peito, dorme enrolado como pãozinho
    const breath = Math.sin(t * (s > .5 ? 1.6 : 2.6))
    this.body.position.set(0, .17 - .085 * s - .02 * sit + Math.abs(Math.sin(t * 16)) * .01 * walk, -.025 * sit)
    this.body.rotation.x = -.55 * sit
    this.body.scale.set(1 + .12 * s + breath * .02 * s, 1 - .12 * s, 1 - .2 * s)
    this.head.position.set(.06 * s, .27 + .07 * sit - .14 * s, .17 - .03 * sit - .02 * s)
    const vibe = this.purr > 0 ? Math.sin(t * 60) * .012 : 0
    this.head.rotation.set(.35 * s + groom * (.55 + Math.sin(t * 9) * .2) + Math.sin(t * 1.2) * .06 * (1 - s), .7 * s + groom * .35, .25 * s + vibe + (this.purr > 0 ? .18 : 0))

    // patas: diagonais alternadas andando; somem por baixo ao dormir
    const step = Math.sin(t * 15) * .55 * walk
    this.legs.forEach((leg, i) => {
      const front = i < 2
      const phase = (i === 0 || i === 3) ? step : -step
      leg.visible = s < .6
      leg.position.y = .12 + (front ? .04 * sit : -.05 * sit)
      leg.rotation.x = phase + (front ? -.1 * sit - (i === 1 ? groom * 1.1 : 0) : -1.2 * sit)
    })
    // rabo: levantado andando, enrolado em volta do corpo dormindo, varrendo o chão sentado
    const wag = Math.sin(t * (walk > .5 ? 3 : 1.6))
    this.tail.forEach((seg, i) => {
      seg.rotation.x = i === 0 ? -.35 - .6 * walk + .9 * sit + .95 * s : (.35 * walk - .2 * sit) + .25 * s
      seg.rotation.z = (wag * (.25 + i * .12)) * (1 - s) + (i ? .7 : .9) * s
      seg.rotation.y = .4 * sit * (i ? .6 : 1)
    })
    if (this.tail[0]) this.tail[0].position.set(0, .2 - .1 * s - .08 * sit, -.16 + .02 * sit)

    // olhos: piscam; fecham felizes no ronrom e fechados dormindo
    this.blink -= dt
    let eyeY = .8
    if (this.blink < 0) {
      eyeY = .1
      if (this.blink < -.14) this.blink = 2 + Math.random() * 4
    }
    const shut = s > .5 || this.purr > 0
    for (let i = 0; i < 2; i += 1) {
      this.eyes[i].visible = !shut
      this.eyes[i].scale.y = eyeY
      this.arcs[i].visible = shut
      this.arcs[i].rotation.z = s > .5 ? Math.PI : 0
    }
    this.shadow.position.y = .005 - this.lift
    this.shadow.scale.set(.7 + .2 * s, 1.2 - .3 * s, 1)
  }
}
