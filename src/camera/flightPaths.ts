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
// Flight segments — aligned to equal 1/11 scroll slices
// ---------------------------------------------------------------------------
// The page has 11 <ScrollScene> sections, each consuming 1/11 of total scroll.
// Every segment here matches the corresponding section's scroll range so the
// camera is at the correct position for the currentScene derived by the store.
//
// Section index → scroll range → flight behavior:
//   0: boot               (0.000–0.091) → static boot camera
//   1: gauntlet           (0.091–0.182) → corridor drift
//   2: gauntlet-transition (0.182–0.273) → dissolve + accelerate
//   3: hub                (0.273–0.364) → arrive at hub orbital
//   4: lifecycle          (0.364–0.455) → hub overview
//   5: maps               (0.455–0.545) → fly toward dodecahedron
//   6: kit                (0.545–0.636) → fly toward cube
//   7: base               (0.636–0.727) → fly toward sphere
//   8: scout              (0.727–0.818) → fly toward octahedron
//   9: impact             (0.818–0.909) → pull back to hub overview
//  10: closing            (0.909–1.000) → settle at hub
// ---------------------------------------------------------------------------

const S = 1 / 11; // section size in scroll units

export const FLIGHT_SEGMENTS: FlightSegment[] = [
  // Section 0: Boot — static camera looking at A monogram at origin
  {
    scrollStart: 0 * S,
    scrollEnd: 1 * S,
    positions: [v(0, 0, 5), v(0, 0, 5)],
    lookAts: [v(0, 0, 0), v(0, 0, 0)],
    fovStart: 50,
    fovEnd: 50,
    rollStart: 0,
    rollEnd: 0,
    easing: EASING.SCENE_ENTER,
  },

  // Section 1: Gauntlet drift — inside corridor at eye height, dutch angle
  {
    scrollStart: 1 * S,
    scrollEnd: 2 * S,
    positions: [
      v(0, 0.25, 0),      // corridor entrance
      v(0.15, 0.25, -8),  // slight lateral drift
      v(-0.1, 0.25, -16), // mid-corridor weave
      v(0, 0.25, -22),    // deep corridor
    ],
    lookAts: [
      v(0, 0.25, -10),
      v(0, 0.25, -18),
      v(0, 0.25, -26),
      v(0, 0.25, -32),
    ],
    fovStart: 55,
    fovEnd: 55,
    rollStart: 0.04, // ~2.3° dutch angle
    rollEnd: 0.04,
    easing: EASING.SCENE_ENTER,
  },

  // Section 2: Gauntlet → Hub transition — accelerate + rise
  {
    scrollStart: 2 * S,
    scrollEnd: 3 * S,
    positions: [
      v(0, 0.25, -22),  // continue from gauntlet end
      v(0, 1, -28),     // accelerate forward
      v(0, 2, -10),     // pulling up
      v(0, 3, 20),      // arrive at hub orbital
    ],
    lookAts: [
      v(0, 0.25, -32),
      v(0, 0, -38),
      v(0, 0, 0),
      v(0, 0, 0),
    ],
    fovStart: 55,
    fovEnd: 50,
    rollStart: 0.04,
    rollEnd: 0,
    easing: EASING.SCENE_ENTER,
  },

  // Section 3: Hub — gentle hover toward NOVA
  {
    scrollStart: 3 * S,
    scrollEnd: 4 * S,
    positions: [HUB_CAM.clone(), v(0, 3.2, 19)],
    lookAts: [HUB_LOOK.clone(), HUB_LOOK.clone()],
    fovStart: 50,
    fovEnd: 50,
    rollStart: 0,
    rollEnd: 0,
    easing: EASING.CAMERA_ORBIT,
  },

  // Section 4: Lifecycle overview — slow orbit around NOVA
  {
    scrollStart: 4 * S,
    scrollEnd: 5 * S,
    positions: [v(0, 3.2, 19), v(3, 3.5, 17), v(0, 3.5, 18)],
    lookAts: [HUB_LOOK.clone(), HUB_LOOK.clone(), HUB_LOOK.clone()],
    fovStart: 50,
    fovEnd: 50,
    rollStart: 0,
    rollEnd: 0,
    easing: EASING.CAMERA_ORBIT,
  },

  // Section 5: MAPS — fly toward dodecahedron
  {
    scrollStart: 5 * S,
    scrollEnd: 6 * S,
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
    easing: EASING.CAMERA_APPROACH,
  },

  // Section 6: K.I.T. — fly toward cube
  {
    scrollStart: 6 * S,
    scrollEnd: 7 * S,
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

  // Section 7: BASE — fly toward sphere
  {
    scrollStart: 7 * S,
    scrollEnd: 8 * S,
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

  // Section 8: SCOUT — fly toward octahedron
  {
    scrollStart: 8 * S,
    scrollEnd: 9 * S,
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

  // Section 9: Impact Wall — pull back to hub overview
  {
    scrollStart: 9 * S,
    scrollEnd: 10 * S,
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
    easing: EASING.CAMERA_PULL_BACK,
  },

  // Section 10: Closing CTA — settle at hub
  {
    scrollStart: 10 * S,
    scrollEnd: 1.0001,
    positions: [HUB_CAM.clone(), HUB_CAM.clone()],
    lookAts: [HUB_LOOK.clone(), HUB_LOOK.clone()],
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
