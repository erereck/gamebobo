// Plantas dos escritórios. Coordenadas no chão: x de -W/2 a W/2, z de -D/2 a D/2.
// Paredes ficam no fundo (z = -D/2) e na esquerda (x = -W/2). rot gira o móvel no eixo Y.
// Itens de parede no fundo usam rot 0; na parede esquerda, rot = PI/2.
// view é a paisagem das janelas: casas, rua, árvores, cidade, horizonte ou vista do alto.
const H = Math.PI / 2

function pod(cx, cz) {
  return [
    { x: cx - .58, z: cz + .34, rot: 0 },
    { x: cx + .58, z: cz + .34, rot: 0 },
    { x: cx - .58, z: cz - .34, rot: Math.PI },
    { x: cx + .58, z: cz - .34, rot: Math.PI },
  ]
}

export const LAYOUTS = [
  {
    id: 'quarto', w: 6, d: 5, wallH: 2.3, floor: 'wood', view: 'houses', rug: { x: .5, z: .6, w: 2.2, d: 1.6, color: '#f4a261' },
    desks: [{ x: .9, z: -2.12, rot: 0 }],
    fixed: [
      { kind: 'bed', x: -2.35, z: -1.45, rot: 0 },
      { kind: 'bookshelf', x: -2.78, z: 1.0, rot: H },
      { kind: 'window', x: 2.0, z: -2.5, rot: 0, wall: 'back' },
      { kind: 'door', x: -3, z: 1.85, rot: H, wall: 'left' },
      { kind: 'lamp', x: -1.5, z: -2.2, rot: 0 },
    ],
    posters: [{ x: -.6, z: -2.5, rot: 0 }, { x: -3, z: -.3, rot: H }],
    floorSlots: [{ x: 2.4, z: -.9 }, { x: 2.3, z: 1.6 }, { x: -1.0, z: 1.9 }],
    wallSlots: [{ x: -.5, z: -2.5, rot: 0 }],
  },
  {
    id: 'garagem', w: 8, d: 6, wallH: 2.4, floor: 'concrete', view: 'street', rug: { x: 1.2, z: .4, w: 2.6, d: 1.8, color: '#e76f51' },
    desks: [{ x: 1.3, z: -2.62, rot: 0 }, { x: 2.75, z: -2.62, rot: 0 }, { x: -3.62, z: -.2, rot: H }],
    fixed: [
      { kind: 'garage', x: -1.6, z: -3, rot: 0, wall: 'back' },
      { kind: 'door', x: -4, z: 2.2, rot: H, wall: 'left' },
      { kind: 'toolshelf', x: -3.7, z: -2.2, rot: H },
      { kind: 'tires', x: 3.55, z: 2.55, rot: 0 },
      { kind: 'window', x: 2.0, z: -3, rot: 0, wall: 'back', width: 1.6 },
    ],
    posters: [{ x: -4, z: .9, rot: H }, { x: .05, z: -3, rot: 0 }],
    floorSlots: [{ x: 3.4, z: -.6 }, { x: .6, z: 2.3 }, { x: 2.2, z: 2.5 }, { x: -1.6, z: 2.4 }, { x: -1.0, z: .6 }],
    wallSlots: [{ x: -4, z: -.9, rot: H }],
  },
  {
    id: 'salinha', w: 10, d: 8, wallH: 2.5, floor: 'carpet', view: 'trees', rug: { x: 2.6, z: 2.0, w: 3.2, d: 2.4, color: '#90be6d' },
    desks: [...pod(-1.3, -1.2), { x: 2.2, z: -3.62, rot: 0 }, { x: 3.6, z: -3.62, rot: 0 }],
    fixed: [
      { kind: 'door', x: -5, z: 3.0, rot: H, wall: 'left' },
      { kind: 'window', x: -1.3, z: -4, rot: 0, wall: 'back', width: 1.8 },
      { kind: 'window', x: -5, z: -1.4, rot: H, wall: 'left', width: 1.4 },
      { kind: 'cooler', x: 4.6, z: -1.6, rot: -H },
      { kind: 'bookshelf', x: .9, z: -3.8, rot: 0 },
    ],
    posters: [{ x: 2.9, z: -4, rot: 0 }, { x: -5, z: .7, rot: H }, { x: 4.4, z: -4, rot: 0 }],
    floorSlots: [{ x: 2.6, z: 1.3 }, { x: 4.3, z: 3.2 }, { x: .6, z: 3.1 }, { x: -1.6, z: 2.6 }, { x: 4.4, z: .3 }, { x: -3.8, z: 1.6 }, { x: -3.8, z: -3.3 }],
    wallSlots: [{ x: -5, z: -3.0, rot: H }, { x: -3.6, z: -4, rot: 0 }],
  },
  {
    id: 'escritorio', w: 13, d: 10, wallH: 2.7, floor: 'wood2', view: 'city', rug: { x: 3.4, z: 2.8, w: 3.6, d: 2.6, color: '#4ea8de' },
    desks: [...pod(-3.2, -2.2), ...pod(.9, -2.2), { x: -5.62, z: 1.0, rot: H }, { x: -5.62, z: 2.4, rot: H }],
    fixed: [
      { kind: 'door', x: -6.5, z: 4.0, rot: H, wall: 'left' },
      { kind: 'window', x: -3.2, z: -5, rot: 0, wall: 'back', width: 2.2 },
      { kind: 'window', x: 1.0, z: -5, rot: 0, wall: 'back', width: 2.2 },
      { kind: 'meeting', x: 4.4, z: -2.6, rot: 0 },
      { kind: 'cooler', x: 6.0, z: .2, rot: -H },
      { kind: 'bookshelf', x: 4.4, z: -4.8, rot: 0 },
      { kind: 'lamp', x: -5.9, z: -4.6, rot: 0 },
    ],
    posters: [{ x: -6.5, z: -1.4, rot: H }, { x: -6.5, z: -.3, rot: H }, { x: 3.0, z: -5, rot: 0 }, { x: 5.8, z: -5, rot: 0 }],
    floorSlots: [{ x: 3.4, z: 2.1 }, { x: 5.6, z: 3.8 }, { x: 1.2, z: 3.9 }, { x: -1.2, z: 1.6 }, { x: 5.6, z: 1.9 }, { x: -1.6, z: 3.8 }, { x: -3.4, z: 1.2 }, { x: -3.6, z: 3.8 }, { x: 1.0, z: 1.2 }],
    wallSlots: [{ x: -6.5, z: -3.2, rot: H }, { x: -1.1, z: -5, rot: 0 }],
  },
  {
    id: 'sede', w: 16, d: 12, wallH: 2.9, floor: 'tile', view: 'skyline', rug: { x: 4.4, z: 3.4, w: 4.4, d: 3.0, color: '#ffafcc' },
    desks: [...pod(-4.6, -3.2), ...pod(-.4, -3.2), ...pod(3.8, -3.2), ...pod(-4.6, .9)],
    fixed: [
      { kind: 'door', x: -8, z: 5.0, rot: H, wall: 'left' },
      { kind: 'window', x: -4.6, z: -6, rot: 0, wall: 'back', width: 2.4 },
      { kind: 'window', x: 3.8, z: -6, rot: 0, wall: 'back', width: 2.4 },
      { kind: 'window', x: -8, z: -1.2, rot: H, wall: 'left', width: 2 },
      { kind: 'meeting', x: 1.6, z: 1.2, rot: 0 },
      { kind: 'server', x: 7.4, z: -5.4, rot: 0 },
      { kind: 'server', x: 6.7, z: -5.4, rot: 0 },
      { kind: 'cooler', x: 7.5, z: -1.4, rot: -H },
      { kind: 'lamp', x: -7.4, z: -5.4, rot: 0 },
      { kind: 'bookshelf', x: -.4, z: -5.8, rot: 0 },
    ],
    posters: [{ x: -8, z: -3.6, rot: H }, { x: -8, z: -2.5, rot: H }, { x: 1.7, z: -6, rot: 0 }, { x: 5.9, z: -6, rot: 0 }, { x: -8, z: 2.4, rot: H }],
    floorSlots: [{ x: 4.4, z: 2.6 }, { x: 6.8, z: 4.8 }, { x: 2.0, z: 4.8 }, { x: 7.0, z: 2.4 }, { x: -1.2, z: 4.6 }, { x: -3.6, z: 4.6 }, { x: 5.4, z: .2 }, { x: -6.6, z: 4.4 }, { x: 7.2, z: .2 }, { x: -1.6, z: 3.0 }, { x: .2, z: 3.4 }],
    wallSlots: [{ x: -2.4, z: -6, rot: 0 }, { x: -8, z: .6, rot: H }],
  },
]

LAYOUTS.push({
  id: 'torre', w: 20, d: 14, wallH: 3.1, floor: 'tile', view: 'high', rug: { x: 6, z: 4.2, w: 5, d: 3.4, color: '#a0c4ff' },
  desks: [...pod(-6.6, -4.2), ...pod(-2.2, -4.2), ...pod(2.2, -4.2), ...pod(-6.6, .2), ...pod(-2.2, .2), ...pod(2.2, .2)],
  fixed: [
    { kind: 'door', x: -10, z: 6, rot: H, wall: 'left' },
    { kind: 'window', x: -6.6, z: -7, rot: 0, wall: 'back', width: 2.6 },
    { kind: 'window', x: -.2, z: -7, rot: 0, wall: 'back', width: 2.6 },
    { kind: 'window', x: 6.2, z: -7, rot: 0, wall: 'back', width: 2.6 },
    { kind: 'window', x: -10, z: -2, rot: H, wall: 'left', width: 2.2 },
    { kind: 'meeting', x: 7.2, z: -3.6, rot: 0 },
    { kind: 'meeting', x: 7.2, z: .4, rot: 0 },
    { kind: 'server', x: 9.4, z: -6.4, rot: 0 },
    { kind: 'server', x: 8.7, z: -6.4, rot: 0 },
    { kind: 'server', x: 8, z: -6.4, rot: 0 },
    { kind: 'cooler', x: 9.5, z: 2.6, rot: -H },
    { kind: 'lamp', x: -9.4, z: -6.4, rot: 0 },
    { kind: 'bookshelf', x: 3.4, z: -6.8, rot: 0 },
    { kind: 'bookshelf', x: -3.4, z: -6.8, rot: 0 },
  ],
  posters: [{ x: -10, z: -4.6, rot: H }, { x: -10, z: -3.5, rot: H }, { x: 1.6, z: -7, rot: 0 }, { x: -1.6, z: -7, rot: 0 }, { x: -10, z: 2.6, rot: H }, { x: -10, z: 3.7, rot: H }],
  floorSlots: [{ x: 6, z: 3.4 }, { x: 8.6, z: 5.8 }, { x: 3.4, z: 5.8 }, { x: 9, z: 4 }, { x: .6, z: 5.6 }, { x: -2, z: 5.6 }, { x: -4.6, z: 5.6 }, { x: -8.2, z: 5.2 }, { x: 4.6, z: 2.6 }, { x: -8.8, z: -6.2 }, { x: 9.2, z: -1.6 }, { x: -.2, z: 3.4 }, { x: -6.4, z: 3.4 }, { x: 2.8, z: 3.6 }],
  wallSlots: [{ x: -4.9, z: -7, rot: 0 }, { x: -10, z: 0, rot: H }, { x: 4.6, z: -7, rot: 0 }],
})

export const FLOOR_STYLES = {
  wood: { color: '#c9a27a', line: '#b88f66' },
  concrete: { color: '#a7a9ac', line: '#9a9c9f' },
  carpet: { color: '#7d8fa6', line: '#7387a0' },
  wood2: { color: '#d8b98f', line: '#c9a87c' },
  tile: { color: '#e9e4dc', line: '#d9d3ca' },
}
