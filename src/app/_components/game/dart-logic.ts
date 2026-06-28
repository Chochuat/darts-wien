import * as THREE from "three";
import type { DartOutcome } from "./types";

export 
/**
 * DART_NUMBERS component.
 */
const DART_NUMBERS = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];

export 
/**
 * BOARD_RADIUS component.
 */
const BOARD_RADIUS = 0.9;
export 
/**
 * BOARD_POSITION component.
 */
const BOARD_POSITION = new THREE.Vector3(0, 0.45, -0.42);
export 
/**
 * BOARD_FACE_Z component.
 */
const BOARD_FACE_Z = BOARD_POSITION.z + 0.03;

export 
/**
 * HAND_POS component.
 */
const HAND_POS = new THREE.Vector3(0.2, -0.55, 1.7);

export 
/**
 * WEDGE_HALF component.
 */
const WEDGE_HALF = Math.PI / 20;
export 
/**
 * WEDGE_SPAN component.
 */
const WEDGE_SPAN = Math.PI / 10;

/**
 * Returns the wedge center angle for a given index.
 *
 * @param index - Wedge index
 */
export function wedgeCenterAngle(index: number): number {
  return Math.PI / 2 - index * WEDGE_SPAN;
}


/**
 * randomOutcome component.
 */
export function randomOutcome(): DartOutcome {
  
  const r = Math.random();
  if (r < 0.03) return { type: "inner_bull", score: 50, label: "BULL" };
  if (r < 0.09) return { type: "outer_bull", score: 25, label: "25" };
  if (r < 0.13) return { type: "miss", score: 0, label: "MISS" };

  
  const num = Math.floor(Math.random() * 20) + 1;
  
  const m = Math.random();
  if (m < 0.17)
    return { type: "triple", number: num, score: num * 3, label: "T" + num };
  if (m < 0.37)
    return { type: "double", number: num, score: num * 2, label: "D" + num };
  return { type: "single", number: num, score: num, label: String(num) };
}

/**
 * Computes a dart outcome from a board position.
 *
 * @param x - X coordinate relative to board center
 * @param y - Y coordinate relative to board center
 */
export function computeOutcomeFromBoardPosition(
  x: number,
  y: number,
): DartOutcome {
  
  const dx = x - BOARD_POSITION.x;
  
  const dy = y - BOARD_POSITION.y;
  
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 0.8) {
    return { type: "miss", score: 0, label: "MISS" };
  }
  if (dist <= 0.04) {
    return { type: "inner_bull", score: 50, label: "BULL" };
  }
  if (dist <= 0.15) {
    return { type: "outer_bull", score: 25, label: "25" };
  }

  
  const ang = Math.atan2(dy, dx);
  
  const raw = (Math.PI / 2 - ang) / WEDGE_SPAN;
  
  const idx = ((Math.round(raw) % 20) + 20) % 20;
  
  const num = DART_NUMBERS[idx];

  
  let type: "single" | "double" | "triple";
  if (dist > 0.72 && dist <= 0.8) {
    type = "double";
  } else if (dist > 0.46 && dist <= 0.54) {
    type = "triple";
  } else {
    type = "single";
  }

  if (num === undefined) {
    return { type: "miss", score: 0, label: "MISS" };
  }
  switch (type) {
    case "double":
      return { type, number: num, score: num * 2, label: "D" + num };
    case "triple":
      return { type, number: num, score: num * 3, label: "T" + num };
    default:
      return { type: "single", number: num, score: num, label: String(num) };
  }
}