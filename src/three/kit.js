import * as THREE from 'three'

// Peças compartilhadas do cenário: geometrias e materiais em cache, para que
// vinte e quatro mesas custem quase o mesmo que uma.

const geos = new Map()
const r3 = value => Math.round(value * 1000) / 1000

export function geo(key, make) {
  let geometry = geos.get(key)
  if (!geometry) {
    geometry = make()
    geos.set(key, geometry)
  }
  return geometry
}

export const boxGeo = (w, h, d) => geo(`box|${r3(w)}|${r3(h)}|${r3(d)}`, () => new THREE.BoxGeometry(w, h, d))
export const cylGeo = (rt, rb, h, seg = 12) => geo(`cyl|${r3(rt)}|${r3(rb)}|${r3(h)}|${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg))
export const sphereGeo = (r, ws = 12, hs = 9) => geo(`sph|${r3(r)}|${ws}|${hs}`, () => new THREE.SphereGeometry(r, ws, hs))
export const planeGeo = (w, h) => geo(`pla|${r3(w)}|${r3(h)}`, () => new THREE.PlaneGeometry(w, h))
export const circleGeo = (r, seg = 16) => geo(`cir|${r3(r)}|${seg}`, () => new THREE.CircleGeometry(r, seg))
export const torusGeo = (r, tube, rs = 6, ts = 14, arc = Math.PI * 2) => geo(`tor|${r3(r)}|${r3(tube)}|${rs}|${ts}|${r3(arc)}`, () => new THREE.TorusGeometry(r, tube, rs, ts, arc))
export const coneGeo = (r, h, seg = 8) => geo(`con|${r3(r)}|${r3(h)}|${seg}`, () => new THREE.ConeGeometry(r, h, seg))
export const icoGeo = r => geo(`ico|${r3(r)}`, () => new THREE.IcosahedronGeometry(r, 0))

// Caixa arredondada extrudada. Ocupa de y = -bevel até y = h + bevel, como a versão antiga.
export function roundedGeo(w, h, d, r, bevel = .02, curve = 4) {
  return geo(`rnd|${r3(w)}|${r3(h)}|${r3(d)}|${r3(r)}|${r3(bevel)}|${curve}`, () => {
    const shape = new THREE.Shape()
    const hw = w / 2 - r
    const hd = d / 2 - r
    shape.moveTo(-hw, -d / 2)
    shape.lineTo(hw, -d / 2)
    shape.quadraticCurveTo(w / 2, -d / 2, w / 2, -hd)
    shape.lineTo(w / 2, hd)
    shape.quadraticCurveTo(w / 2, d / 2, hw, d / 2)
    shape.lineTo(-hw, d / 2)
    shape.quadraticCurveTo(-w / 2, d / 2, -w / 2, hd)
    shape.lineTo(-w / 2, -hd)
    shape.quadraticCurveTo(-w / 2, -d / 2, -hw, -d / 2)
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: curve })
    geometry.rotateX(-Math.PI / 2)
    return geometry
  })
}

// Cunha vista de lado: fundo mais alto que a frente (gabinete-teclado dos anos 80, prancheta, apoio).
export function wedgeGeo(w, d, hBack, hFront) {
  return geo(`wdg|${r3(w)}|${r3(d)}|${r3(hBack)}|${r3(hFront)}`, () => {
    const shape = new THREE.Shape()
    shape.moveTo(-d / 2, 0)
    shape.lineTo(d / 2, 0)
    shape.lineTo(d / 2, hFront)
    shape.lineTo(-d / 2, hBack)
    shape.closePath()
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: w, bevelEnabled: false })
    geometry.rotateY(-Math.PI / 2)
    geometry.translate(w / 2, 0, 0)
    return geometry
  })
}

// Tronco de pirâmide para a traseira dos monitores de tubo (estreita para trás, em -z).
export function crtBackGeo(front, back, depth) {
  return geo(`crt|${r3(front)}|${r3(back)}|${r3(depth)}`, () => {
    const geometry = new THREE.CylinderGeometry(back / Math.SQRT2, front / Math.SQRT2, depth, 4, 1)
    geometry.rotateY(Math.PI / 4)
    geometry.rotateX(-Math.PI / 2)
    geometry.translate(0, 0, -depth / 2)
    return geometry
  })
}

// Arco de tela curva (ultrawide): visto por dentro, com o u invertido para o texto não sair espelhado.
export function curvedGeo(width, height, radius, seg = 18) {
  return geo(`crv|${r3(width)}|${r3(height)}|${r3(radius)}|${seg}`, () => {
    const arc = width / radius
    const geometry = new THREE.CylinderGeometry(radius, radius, height, seg, 1, true, Math.PI - arc / 2, arc)
    const uv = geometry.attributes.uv
    for (let i = 0; i < uv.count; i += 1) uv.setX(i, 1 - uv.getX(i))
    geometry.translate(0, 0, radius)
    return geometry
  })
}

export function tubeGeo(key, points, radius = .006, seg = 24, closed = false) {
  return geo(`tub|${key}`, () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)), closed), seg, radius, 5, closed))
}

const mats = new Map()
export function mat(color, o = {}) {
  const key = [color, o.rough ?? .75, o.metal ?? 0, o.emissive ?? '', o.emissiveIntensity ?? 1, o.opacity ?? 1, o.side ?? 0, o.map?.uuid ?? '', o.emissiveMap?.uuid ?? '', o.flat ? 1 : 0, o.transparent ? 1 : 0].join('|')
  let material = mats.get(key)
  if (!material) {
    material = new THREE.MeshStandardMaterial({
      color,
      roughness: o.rough ?? .75,
      metalness: o.metal ?? 0,
      emissive: o.emissive ?? '#000000',
      emissiveIntensity: o.emissiveIntensity ?? 1,
      transparent: (o.opacity ?? 1) < 1 || Boolean(o.transparent),
      opacity: o.opacity ?? 1,
      side: o.side ?? THREE.FrontSide,
      map: o.map ?? null,
      emissiveMap: o.emissiveMap ?? null,
      flatShading: Boolean(o.flat),
    })
    mats.set(key, material)
  }
  return material
}

// Material sem luz (telas, LEDs, brilhos); também em cache.
const basics = new Map()
export function basic(color, o = {}) {
  const key = [color, o.opacity ?? 1, o.add ? 1 : 0, o.map?.uuid ?? '', o.side ?? 0, o.depthWrite ?? ''].join('|')
  let material = basics.get(key)
  if (!material) {
    material = new THREE.MeshBasicMaterial({
      color,
      map: o.map ?? null,
      transparent: (o.opacity ?? 1) < 1 || Boolean(o.add) || Boolean(o.transparent),
      opacity: o.opacity ?? 1,
      blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: o.depthWrite ?? !o.add,
      side: o.side ?? THREE.FrontSide,
      toneMapped: false,
    })
    basics.set(key, material)
  }
  return material
}

// Malha posicionada. o: rx, ry, rz, s (escala única) ou sx/sy/sz, cast (sombra).
export function part(geometry, material, x = 0, y = 0, z = 0, o = {}) {
  const m = new THREE.Mesh(geometry, material)
  m.position.set(x, y, z)
  if (o.rx || o.ry || o.rz) m.rotation.set(o.rx ?? 0, o.ry ?? 0, o.rz ?? 0)
  if (o.s) m.scale.setScalar(o.s)
  if (o.sx || o.sy || o.sz) m.scale.set(o.sx ?? 1, o.sy ?? 1, o.sz ?? 1)
  m.castShadow = o.cast ?? true
  m.receiveShadow = true
  return m
}

// Atalhos usados pelos móveis: posição pelo centro da peça.
export const B = (group, w, h, d, material, x, y, z, o) => group.add(part(boxGeo(w, h, d), material, x, y, z, o))
export const C = (group, rt, rb, h, material, x, y, z, o = {}) => group.add(part(cylGeo(rt, rb, h, o.seg ?? 12), material, x, y, z, o))
export const S = (group, r, material, x, y, z, o = {}) => group.add(part(sphereGeo(r, o.ws ?? 12, o.hs ?? 9), material, x, y, z, o))
export const R = (group, w, h, d, r, material, x, y, z, o = {}) => group.add(part(roundedGeo(w, h, d, r, o.bevel ?? .02), material, x, y, z, o))
// Plano deitado (adesivo, papel, tapete de mouse); y é a altura da superfície.
export const P = (group, w, d, material, x, y, z, o = {}) => group.add(part(planeGeo(w, d), material, x, y, z, { rx: -Math.PI / 2, rz: o.rz ?? 0, cast: false }))

const UP = new THREE.Vector3(0, 1, 0)
const DIR = new THREE.Vector3()
// Haste entre dois pontos [x, y, z] (braço de microfone, perna aberta, antena).
export function rod(group, a, b, r, material, seg = 6) {
  DIR.set(b[0] - a[0], b[1] - a[1], b[2] - a[2])
  const length = DIR.length()
  const m = new THREE.Mesh(cylGeo(r, r, length, seg), material)
  m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2)
  m.quaternion.setFromUnitVectors(UP, DIR.normalize())
  m.castShadow = true
  m.receiveShadow = true
  group.add(m)
  return m
}

// Marca um objeto para ficar fora do cozimento (anima, acende ou some).
export function live(object) {
  object.userData.dynamic = true
  return object
}

// Sorteio determinístico: a mesma mesa sempre ganha a mesma bagunça.
export function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export function hashText(text) {
  let h = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
export const seeded = (...parts) => mulberry32(hashText(parts.join('|')))

export const ERA_ORDER = ['fliper', 'cartucho', 'cd', 'lanhouse', 'app', 'stream', 'algoritmo', 'futuro']
export const eraIndex = era => Math.max(0, ERA_ORDER.indexOf(era?.id ?? era))
