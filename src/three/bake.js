import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// "Cozinha" a mobília parada: junta todas as malhas em poucas, para o escritório
// inteiro custar algumas chamadas de desenho em vez de milhares.
// Material liso (sem textura nem brilho) vira cor de vértice e se agrupa por
// aspereza; o resto se agrupa pelo próprio material. Objetos com userData.dynamic
// ficam como estão, com filhos e tudo. Transparentes só entram com userData.glass
// (brilhos e vidros chapados, onde a ordem de desenho não importa).

const vertexMats = new Map()
const surfaceMaterial = (rough, metal) => {
  const key = `${rough}|${metal}`
  if (!vertexMats.has(key)) vertexMats.set(key, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: rough, metalness: metal }))
  return vertexMats.get(key)
}

const plain = material => material.isMeshStandardMaterial && !material.map && !material.emissiveMap && !material.transparent && !material.vertexColors
  && material.side === THREE.FrontSide && (material.emissiveIntensity === 0 || material.emissive.getHex() === 0)

const KEEP = ['position', 'normal', 'uv']

function prepare(source, matrix, color) {
  const geometry = source.clone()
  geometry.applyMatrix4(matrix)
  for (const name of Object.keys(geometry.attributes)) if (!KEEP.includes(name)) geometry.deleteAttribute(name)
  const count = geometry.attributes.position.count
  // tudo indexado: extrusões e tubos ganham índice sequencial, esferas e cilindros ficam enxutos
  if (!geometry.index) {
    const index = new (count > 65535 ? Uint32Array : Uint16Array)(count)
    for (let i = 0; i < count; i += 1) index[i] = i
    geometry.setIndex(new THREE.BufferAttribute(index, 1))
  }
  if (!geometry.attributes.normal) geometry.computeVertexNormals()
  if (!geometry.attributes.uv) geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2))
  if (color) {
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  }
  geometry.morphAttributes = {}
  geometry.clearGroups()
  return geometry
}

// Junta as malhas paradas de root dentro de root mesmo. Devolve as geometrias novas (para liberar depois).
export function bake(root) {
  root.updateMatrixWorld(true)
  const inverse = new THREE.Matrix4().copy(root.matrixWorld).invert()
  const buckets = new Map()
  const removals = []
  const relative = new THREE.Matrix4()

  const walk = object => {
    for (const child of object.children) {
      if (child.userData.dynamic || !child.visible) continue
      const material = child.material
      const mergeable = child.isMesh && !child.isInstancedMesh && !child.isSkinnedMesh && !Array.isArray(material)
        && (!material.transparent || child.userData.glass) && child.children.length === 0 && child.matrixWorld.determinant() > 0
      if (!mergeable) {
        walk(child)
        continue
      }
      const vertex = plain(material)
      const rough = Math.round(material.roughness * 4) / 4
      const metal = Math.round(material.metalness * 4) / 4
      const key = vertex ? `v|${rough}|${metal}|${child.castShadow}` : `m|${material.uuid}|${child.castShadow}`
      let bucket = buckets.get(key)
      if (!bucket) {
        bucket = { material: vertex ? surfaceMaterial(rough, metal) : material, cast: child.castShadow, list: [] }
        buckets.set(key, bucket)
      }
      relative.multiplyMatrices(inverse, child.matrixWorld)
      bucket.list.push(prepare(child.geometry, relative, vertex ? material.color : null))
      removals.push(child)
    }
  }
  walk(root)
  for (const child of removals) child.removeFromParent()

  const created = []
  for (const bucket of buckets.values()) {
    const merged = mergeGeometries(bucket.list, false)
    for (const geometry of bucket.list) geometry.dispose()
    if (!merged) continue
    merged.computeBoundingSphere()
    const mesh = new THREE.Mesh(merged, bucket.material)
    mesh.castShadow = bucket.cast
    mesh.receiveShadow = !bucket.material.transparent
    mesh.matrixAutoUpdate = false
    root.add(mesh)
    created.push(merged)
  }
  return created
}
