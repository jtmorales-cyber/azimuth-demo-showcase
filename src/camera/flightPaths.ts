import * as THREE from 'three';
import { EASING } from '@/utils/constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FlightSegment {
  /** Scroll range start (0–1) */
  scrollStart: number;
  /** Scroll range end (0–1) */
  scrollEnd: number;
  /** CatmullRomCurve3 control points for camera position */
  positions: THREE.Vector3[];
  /** CatmullRomCurve3 control points for lookAt target */
  lookAts: THREE.Vector3[];
  /** Start FOV */
  fovStart: number;
  /** End FOV */
  fovEnd: number;
  /** Start roll (dutch angle, radians) */
  rollStart: number;
  /** End roll */
  rollEnd: number;
  /** GSAP easing for this segment */
  easing: string;
}

// ---------------------------------------------------------------------------
// Spatial constants
// ---------------------------------------------------------------------------

// Hub orbital camera position (above and in front of NOVA)
const HUB_CAM = new THREE.Vector3(0, 3, 20);
const HUB_LOOK = new THREE.Vector3(0, 0, 0);

// Tool node positions (cardinal points around NOVA at radius 8)
export const NODE_POSITIONS = {
  maps: new THREE.Vector3(8, 0, 0),
  kit: new THREE.Vector3(0, 0, 8),
  base: new THREE.Vector3(-8, 0, 0),
  scout: new THREE.Vector3(0, 0, -8),
} as const;

// Camera approach distance from node (looking at node from hub side)
const APPROACH_OFFSET = 4;

function nodeApproachCam(nodePos: THREE.Vector3): THREE.Vector3 {
  // Position camera between hub and node, slightly above
  const dir = nodePos.clone().normalize();
  return nodePos.clone().add(dir.clone().multiplyScalar(APPROACH_OFFSET)).setY(2);
}

// ---------------------------------------------------------------------------
// Helper: vec3 shorthand
// ---------------------------------------------------------------------------

function v(x: number, y: number, z: number) {
  return new THREE.Vector3(x, y, z);
}

// ---------------------------------------------------------------------------
// Flight segments
// ---------------------------------------------------------------------------

export const FLIGHT_SEGMENTS: FlightSegment[] = [
  // S0: Boot — static origin
  {
    scrollStart: 0.0,
    scrollEnd: 0.05,
    positions: [v(0, 2, 25), v(0, 2, 24)],
    lookAts: [v(0, 0, 0), v(0, 0, 0)],
    fovStart: 50,
    fovEnd: 50,
    rollStart: 0,
    rollEnd: 0,
    easing: EASING.SCENE_ENTER,
  },

  // S1: Gauntlet drift — tight corridor, dutch angle, slow forward
  {
    scrollStart: 0.05,
    scrollEnd: 0.20,
    positions: [
      v(0, 1.5, 20),   // corridor entrance
      v(0.3, 1.5, 10),  // slight lateral drift
      v(-0.2, 1.5, 0),  // mid-corridor weave
      v(0, 1.5, -10),   // deep corridor
    ],
    lookAts: [
      v(0, 1.5, 10),
      v(0, 1.5, 0),
      v(0, 1.5, -10),
      v(0, 1.5, -20),
    ],
    fovStart: 55,
    fovEnd: 55,
    rollStart: 0.04,   // ~2.3° dutch angle
    rollEnd: 0.04,
    easing: EASING.SCENE_ENTER,
  },

  // S2: Gauntlet → Hub transition — accelerate forward, dutch recovers, pull up
  {
    scrollStart: 0.20,
    scrollEnd: 0.30,
    positions: [
      v(0, 1.5, -10),   // continue from gauntlet end
      v(0, 2, -20),     // accelerate deeper
      v(0, 4, -10),     // begin rising
      v(0, 3, 20),      // arrive at hub orbital
    ],
    lookAts: [
      v(0, 1.5, -20),
      v(0, 0, -30),
      v(0, 0, 0),       // begin looking at NOVA
      v(0, 0, 0),       // locked on NOVA
    ],
    fovStart: 55,
    fovEnd: 50,
    rollStart: 0.04,
    rollEnd: 0,          // dutch angle recovers
    easing: EASING.SCENE_ENTER,  // power3.inOut
  },

  // S3: Hub — gentle hover, looking at NOVA
  {
    scrollStart: 0.30,
    scrollEnd: 0.45,
    positions: [HUB_CAM.clone(), v(0, 3.5, 18)],
    lookAts: [HUB_LOOK.clone(), HUB_LOOK.clone()],
    fovStart: 50,
    fovEnd: 50,
    rollStart: 0,
    rollEnd: 0,
    easing: EASING.CAMERA_ORBIT,  // sine.inOut
  },

  // S5: MAPS showcase — fly toward dodecahedron
  {
    scrollStart: 0.45,
    scrollEnd: 0.56,
    positions: [
      v(0, 3.5, 18),
      v(4, 2.5, 12),
      nodeApproachCam(NODE_POSITIONS.maps),
    ],
    lookAts: [
      HUB_LOOK.clone(),
      NODE_POSITIONS.maps.clone().setY(0.5),
      NODE_POSITIONS.maps.clone(),
    ],
    fovStart: 50,
    fovEnd: 50,
    rollStart: 0,
    rollEnd: 0,
    easing: EASING.CAMERA_APPROACH,  // expo.inOut
  },

  // S6: K.I.T. showcase — fly toward cube
  {
    scrollStart: 0.56,
    scrollEnd: 0.67,
    positions: [
      nodeApproachCam(NODE_POSITIONS.maps),
      v(4, 2.5, 6),
      nodeApproachCam(NODE_POSITIONS.kit),
    ],
    lookAts: [
      NODE_POSITIONS.maps.clone(),
      v(0, 0, 4),
      NODE_POSITIONS.kit.clone(),
    ],
    fovStart: 50,
    fovEnd: 50,
    rollStart: 0,
    rollEnd: 0,
    easing: EASING.CAMERA_APPROACH,
  },

  // S7: BASE showcase — fly toward sphere
  {
    scrollStart: 0.67,
    scrollEnd: 0.78,
    positions: [
      nodeApproachCam(NODE_POSITIONS.kit),
      v(-4, 2.5, 6),
      nodeApproachCam(NODE_POSITIONS.base),
    ],
    lookAts: [
      NODE_POSITIONS.kit.clone(),
      v(-4, 0, 0),
      NODE_POSITIONS.base.clone(),
    ],
    fovStart: 50,
    fovEnd: 50,
    rollStart: 0,
    rollEnd: 0,
    easing: EASING.CAMERA_APPROACH,
  },

  // S8: SCOUT showcase — fly toward octahedron
  {
    scrollStart: 0.78,
    scrollEnd: 0.89,
    positions: [
      nodeApproachCam(NODE_POSITIONS.base),
      v(-4, 2.5, -6),
      nodeApproachCam(NODE_POSITIONS.scout),
    ],
    lookAts: [
      NODE_POSITIONS.base.clone(),
      v(0, 0, -4),
      NODE_POSITIONS.scout.clone(),
    ],
    fovStart: 50,
    fovEnd: 50,
    rollStart: 0,
    rollEnd: 0,
    easing: EASING.CAMERA_APPROACH,
  },

  // S9–S10: Impact + Closing — return to hub overview
  {
    scrollStart: 0.89,
    scrollEnd: 1.0,
    positions: [
      nodeApproachCam(NODE_POSITIONS.scout),
      v(0, 4, 10),
      HUB_CAM.clone(),
    ],
    lookAts: [
      NODE_POSITIONS.scout.clone(),
      HUB_LOOK.clone(),
      HUB_LOOK.clone(),
    ],
    fovStart: 50,
    fovEnd: 50,
    rollStart: 0,
    rollEnd: 0,
    easing: EASING.CAMERA_PULL_BACK,  // power3.out — 20% faster feel
  },
];

// ---------------------------------------------------------------------------
// Pre-computed CatmullRom curves for each segment
// ---------------------------------------------------------------------------

export interface ComputedSegment {
  scrollStart: number;
  scrollEnd: number;
  positionCurve: THREE.CatmullRomCurve3;
  lookAtCurve: THREE.CatmullRomCurve3;
  fovStart: number;
  fovEnd: number;
  rollStart: number;
  rollEnd: number;
  easing: string;
}

export const COMPUTED_SEGMENTS: ComputedSegment[] = FLIGHT_SEGMENTS.map((seg) => ({
  scrollStart: seg.scrollStart,
  scrollEnd: seg.scrollEnd,
  positionCurve: new THREE.CatmullRomCurve3(seg.positions, false, 'catmullrom', 0.5),
  lookAtCurve: new THREE.CatmullRomCurve3(seg.lookAts, false, 'catmullrom', 0.5),
  fovStart: seg.fovStart,
  fovEnd: seg.fovEnd,
  rollStart: seg.rollStart,
  rollEnd: seg.rollEnd,
  easing: seg.easing,
}));
