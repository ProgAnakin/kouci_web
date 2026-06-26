import * as THREE from 'three'

/**
 * Shared, allocation-free hand-off of the ball's world position from the play
 * (which owns the animation) to the camera rig (which gently follows it).
 */
export const heroState = {
  ball: new THREE.Vector3(2.2, 0.5, 0.5),
}
