import * as THREE from "three";
import type { DartOutcome } from "./types";

export const DART_NUMBERS = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];

export const BOARD_RADIUS = 0.9;
export const BOARD_POSITION = new THREE.Vector3(0, 0.15, -0.42);
export const BOARD_FACE_Z = BOARD_POSITION.z + 0.03;

export const HAND_POS = new THREE.Vector3(0.2, -0.55, 1.7);

export const WEDGE_HALF = Math.PI / 20;
export const WEDGE_SPAN = Math.PI / 10;

export function wedgeCenterAngle(index: number): number {
  return Math.PI / 2 - index * WEDGE_SPAN;
}

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

export function getBoardPos(outcome: DartOutcome): THREE.Vector3 {
  const { x: bx, y: by } = BOARD_POSITION;
  const z = BOARD_FACE_Z;

  if (outcome.type === "miss") {
    const a = Math.random() * Math.PI * 2;
    const r = BOARD_RADIUS + 0.05 + Math.random() * 0.3;
    return new THREE.Vector3(bx + Math.cos(a) * r, by + Math.sin(a) * r, z);
  }

  let angle: number;
  if (outcome.type === "inner_bull" || outcome.type === "outer_bull") {
    angle = Math.random() * Math.PI * 2;
  } else {
    const idx = DART_NUMBERS.indexOf(outcome.number!);
    angle = wedgeCenterAngle(idx) + (Math.random() - 0.5) * WEDGE_HALF * 1.4;
  }

  let innerR: number;
  let outerR: number;
  switch (outcome.type) {
    case "inner_bull":
      innerR = 0;
      outerR = 0.04;
      break;
    case "outer_bull":
      innerR = 0.04;
      outerR = 0.15;
      break;
    case "single":
      if (Math.random() < 0.5) {
        innerR = 0.15;
        outerR = 0.46;
      } else {
        innerR = 0.54;
        outerR = 0.72;
      }
      break;
    case "double":
      innerR = 0.72;
      outerR = 0.8;
      break;
    case "triple":
      innerR = 0.46;
      outerR = 0.54;
      break;
    default:
      innerR = 0;
      outerR = 0;
  }

  const r = innerR + Math.random() * (outerR - innerR);
  return new THREE.Vector3(bx + Math.cos(angle) * r, by + Math.sin(angle) * r, z);
}