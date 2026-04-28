import * as THREE from 'three';
import type { SceneName } from '@/state/portalStore';

// ---------------------------------------------------------------------------
// Tool node positions (cardinal points around Hub at radius 8)
// ---------------------------------------------------------------------------

export const NODE_POSITIONS = {
  maps:  new THREE.Vector3(8,  0, 0),
  kit:   new THREE.Vector3(0,  0, 8),
  base:  new THREE.Vector3(-8, 0, 0),
  scout: new THREE.Vector3(0,  0, -8),
} as const;

// Lifecycle Overview layout — horizontal timeline spread along the X axis.
// Nodes animate to these positions when currentScene === 'lifecycle'.
export const TIMELINE_POSITIONS = {
  maps:  new THREE.Vector3(-9, -1, 0),
  kit:   new THREE.Vector3(-3, -1, 0),
  base:  new THREE.Vector3( 3, -1, 0),
  scout: new THREE.Vector3( 9, -1, 0),
} as const;

// ---------------------------------------------------------------------------
// Per-scene camera focus points
// Each defines where the camera should be and what it should look at.
// CameraController tweens position + lookAt target via GSAP on scene change.
// ---------------------------------------------------------------------------

const APPROACH_OFFSET = 6; // units beyond the node along its radial axis
const APPROACH_HEIGHT = 3; // Y elevation for sanctuary approach cameras

function nodeApproachCam(nodePos: THREE.Vector3): [number, number, number] {
  const dir = nodePos.clone().normalize();
  const cam = nodePos.clone().add(dir.multiplyScalar(APPROACH_OFFSET)).setY(APPROACH_HEIGHT);
  return [cam.x, cam.y, cam.z];
}

export interface SceneFocus {
  position: [number, number, number];
  target:   [number, number, number];
}

export const SCENE_FOCUS: Record<SceneName, SceneFocus> = {
  boot: {
    position: [0, 0, 5],
    target:   [0, 0, 0],
  },
  hub: {
    position: [0, 3, 20],
    target:   [0, 0, 0],
  },
  lifecycle: {
    // Pull back further to frame the horizontal timeline at y=-1
    position: [0, 2, 22] as [number, number, number],
    target:   [0, -1,  0] as [number, number, number],
  },
  maps: {
    position: nodeApproachCam(NODE_POSITIONS.maps),
    target:   [NODE_POSITIONS.maps.x,  NODE_POSITIONS.maps.y,  NODE_POSITIONS.maps.z],
  },
  kit: {
    position: nodeApproachCam(NODE_POSITIONS.kit),
    target:   [NODE_POSITIONS.kit.x,   NODE_POSITIONS.kit.y,   NODE_POSITIONS.kit.z],
  },
  base: {
    position: nodeApproachCam(NODE_POSITIONS.base),
    target:   [NODE_POSITIONS.base.x,  NODE_POSITIONS.base.y,  NODE_POSITIONS.base.z],
  },
  scout: {
    position: nodeApproachCam(NODE_POSITIONS.scout),
    target:   [NODE_POSITIONS.scout.x, NODE_POSITIONS.scout.y, NODE_POSITIONS.scout.z],
  },
};
