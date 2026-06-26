import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SKIN, SKIN_PROPS } from './playerLook'

interface PlayerArmProps {
  /** Player world position (arms live in the player-group space). */
  base: THREE.Vector3
  /** Shoulder offset in player-local space. */
  shoulder: [number, number, number]
  /** World-space point the hand reaches toward. */
  target: MutableRefObject<THREE.Vector3>
  /** Preferred elbow-bend direction. */
  pole: [number, number, number]
  upperLen?: number
  foreLen?: number
}

const UP = new THREE.Vector3(0, 1, 0)
const _shoulder = new THREE.Vector3()
const _target = new THREE.Vector3()
const _dir = new THREE.Vector3()
const _n = new THREE.Vector3()
const _elbow = new THREE.Vector3()
const _hand = new THREE.Vector3()
const _seg = new THREE.Vector3()
const _mid = new THREE.Vector3()
const _q = new THREE.Quaternion()

function orient(mesh: THREE.Object3D | null, p: THREE.Vector3, q: THREE.Vector3) {
  if (!mesh) return _q
  _seg.copy(q).sub(p)
  const len = _seg.length() || 0.0001
  _seg.divideScalar(len)
  _mid.copy(p).add(q).multiplyScalar(0.5)
  mesh.position.copy(_mid)
  _q.setFromUnitVectors(UP, _seg)
  mesh.quaternion.copy(_q)
  mesh.scale.y = len
  return _q
}

/**
 * A stylised, articulated arm solved with two-bone IK each frame: upper arm,
 * a defined elbow, forearm and a simplified hand reach toward `target` with a
 * natural bend. Lives in player-local space (the group sits at the player base,
 * un-transformed) so positions are simply world − base.
 */
export function PlayerArm({
  base,
  shoulder,
  target,
  pole,
  upperLen = 0.44,
  foreLen = 0.42,
}: PlayerArmProps) {
  const upper = useRef<THREE.Mesh>(null)
  const fore = useRef<THREE.Mesh>(null)
  const elbow = useRef<THREE.Mesh>(null)
  const hand = useRef<THREE.Mesh>(null)

  useFrame(() => {
    _shoulder.set(shoulder[0], shoulder[1], shoulder[2])
    _target.copy(target.current).sub(base)

    _dir.copy(_target).sub(_shoulder)
    let d = _dir.length()
    const maxD = upperLen + foreLen - 0.003
    d = THREE.MathUtils.clamp(d, 0.05, maxD)
    _dir.normalize()

    // Law of cosines → elbow position offset along the bend plane.
    const a = (upperLen * upperLen - foreLen * foreLen + d * d) / (2 * d)
    const h = Math.sqrt(Math.max(upperLen * upperLen - a * a, 0))
    _n.set(pole[0], pole[1], pole[2])
    _n.addScaledVector(_dir, -_n.dot(_dir))
    if (_n.lengthSq() < 1e-5) _n.set(0, 1, 0)
    _n.normalize()

    _elbow.copy(_shoulder).addScaledVector(_dir, a).addScaledVector(_n, h)
    _hand.copy(_shoulder).addScaledVector(_dir, d)

    orient(upper.current, _shoulder, _elbow)
    const foreQ = orient(fore.current, _elbow, _hand)
    if (elbow.current) elbow.current.position.copy(_elbow)
    if (hand.current) {
      hand.current.position.copy(_hand)
      hand.current.quaternion.copy(foreQ)
    }
  })

  return (
    <group>
      <mesh ref={upper} castShadow>
        <cylinderGeometry args={[0.075, 0.1, 1, 14]} />
        <meshPhysicalMaterial color={SKIN} {...SKIN_PROPS} />
      </mesh>
      <mesh ref={elbow} castShadow>
        <sphereGeometry args={[0.092, 18, 16]} />
        <meshPhysicalMaterial color={SKIN} {...SKIN_PROPS} />
      </mesh>
      <mesh ref={fore} castShadow>
        <cylinderGeometry args={[0.058, 0.082, 1, 14]} />
        <meshPhysicalMaterial color={SKIN} {...SKIN_PROPS} />
      </mesh>
      <mesh ref={hand} scale={[0.85, 0.7, 1.15]} castShadow>
        <sphereGeometry args={[0.11, 18, 16]} />
        <meshPhysicalMaterial color={SKIN} {...SKIN_PROPS} />
      </mesh>
    </group>
  )
}
