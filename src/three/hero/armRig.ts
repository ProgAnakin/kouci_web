import * as THREE from 'three'

export interface ArmRigOptions {
  /** Upper-arm length (shoulder → elbow). */
  L1: number
  /** Forearm length (elbow → wrist). */
  L2: number
  /** Radius at the shoulder end. */
  rShoulder: number
  /** Radius at the wrist end. */
  rWrist: number
  material: THREE.Material
}

export interface ArmRig {
  /** Add this to the body at the shoulder position. */
  group: THREE.Group
  /**
   * Two-bone IK solve. `target` and `pole` are in the group's parent space,
   * relative to the shoulder (i.e. to the group's own origin).
   */
  solve(target: THREE.Vector3, pole: THREE.Vector3): void
  dispose(): void
}

const UP = new THREE.Vector3(0, 1, 0)

/**
 * A smooth, clay-like arm: one continuous skinned tube bent by two bones
 * (shoulder→elbow, elbow→wrist) so the elbow deforms softly with no visible
 * seams — unlike stacked cylinders. A gentle bicep bulge is baked into the
 * geometry, a mitten hand rides the wrist bone, and a shoulder sphere blends
 * the arm into the torso.
 */
export function createArm({ L1, L2, rShoulder, rWrist, material }: ArmRigOptions): ArmRig {
  const len = L1 + L2

  // Tapered tube along +Y from the shoulder (y=0) to the wrist (y=len).
  const geometry = new THREE.CylinderGeometry(rWrist, rShoulder, len, 18, 28, false)
  geometry.translate(0, len / 2, 0)

  // Organic profile (slight bicep + forearm bulges) and skin weights.
  const pos = geometry.attributes.position
  const skinIndices: number[] = []
  const skinWeights: number[] = []
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const y = v.y
    const bicep = 1 + 0.16 * Math.exp(-(((y - L1 * 0.45) / 0.16) ** 2))
    const fore = 1 + 0.08 * Math.exp(-(((y - (L1 + L2 * 0.35)) / 0.14) ** 2))
    pos.setX(i, v.x * bicep * fore)
    pos.setZ(i, v.z * bicep * fore)
    // Soft blend across the elbow so the bend is smooth, not a hinge crease.
    const t = THREE.MathUtils.smoothstep(y, L1 - 0.1, L1 + 0.1)
    skinIndices.push(0, 1, 0, 0)
    skinWeights.push(1 - t, t, 0, 0)
  }
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4))
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4))
  geometry.computeVertexNormals()

  const mesh = new THREE.SkinnedMesh(geometry, material)
  mesh.frustumCulled = false

  const b0 = new THREE.Bone()
  const b1 = new THREE.Bone()
  b0.add(b1)
  b1.position.y = L1
  mesh.add(b0)

  const group = new THREE.Group()
  group.add(mesh)
  group.updateMatrixWorld(true)
  mesh.bind(new THREE.Skeleton([b0, b1]))

  // Mitten hand riding the wrist bone (slightly cupped toward the palm).
  const handGeo = new THREE.SphereGeometry(rWrist * 1.55, 18, 16)
  const hand = new THREE.Mesh(handGeo, material)
  hand.scale.set(0.9, 1.15, 0.72)
  hand.position.set(0, L2 + rWrist * 0.55, 0.01)
  b1.add(hand)

  // Shoulder sphere blends the arm root into the torso.
  const shoulderGeo = new THREE.SphereGeometry(rShoulder * 1.32, 20, 18)
  const shoulder = new THREE.Mesh(shoulderGeo, material)
  group.add(shoulder)

  // Allocation-free solve scratch.
  const _dir = new THREE.Vector3()
  const _n = new THREE.Vector3()
  const _elbow = new THREE.Vector3()
  const _we = new THREE.Vector3()
  const _q0 = new THREE.Quaternion()
  const _q1 = new THREE.Quaternion()
  const _q0i = new THREE.Quaternion()

  function solve(target: THREE.Vector3, pole: THREE.Vector3) {
    let d = target.length()
    d = THREE.MathUtils.clamp(d, 0.08, len - 0.005)
    _dir.copy(target).normalize()

    // Law-of-cosines elbow placement, bent toward the pole.
    const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d)
    const h = Math.sqrt(Math.max(L1 * L1 - a * a, 0))
    _n.copy(pole).addScaledVector(_dir, -pole.dot(_dir))
    if (_n.lengthSq() < 1e-6) _n.set(0, 0, 1)
    _n.normalize()
    _elbow.copy(_dir).multiplyScalar(a).addScaledVector(_n, h)

    // Bone 0 aims +Y at the elbow; bone 1 (local) aims on to the wrist.
    _q0.setFromUnitVectors(UP, _n.copy(_elbow).normalize())
    b0.quaternion.copy(_q0)
    _we.copy(_dir).multiplyScalar(d).sub(_elbow).normalize()
    _q1.setFromUnitVectors(UP, _we)
    _q0i.copy(_q0).invert()
    b1.quaternion.copy(_q0i).multiply(_q1)
  }

  function dispose() {
    geometry.dispose()
    handGeo.dispose()
    shoulderGeo.dispose()
  }

  return { group, solve, dispose }
}
