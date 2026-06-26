"use client";

import { useRef, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "./game-context";
import {
  BOARD_FACE_Z,
  BOARD_POSITION,
  computeOutcomeFromBoardPosition,
} from "./dart-logic";

const DART_COUNT = 3;
const SPAWN_Z = 1.6;
const FORWARD_V0 = 0.08;
const FORWARD_ACCEL = 0.12;
const NUDGE_STEP = 0.06;
const CONTINUOUS_SPEED = 0.5;
const INTER_DART_DELAY_MS = 600;
const REST_ROT: [number, number, number] = [-0.18, 0, 0];
const HIDDEN_POS: [number, number, number] = [0, 0, 8];
const SPAWN_OFFSET = 0.05;

interface FlightState {
  activeIdx: number;
  dartIndex: number;
  pos: THREE.Vector3;
  vel: number;
}

function DartMeshParts() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.011, 0.11, 10]} />
        <meshStandardMaterial color="#999999" roughness={0.2} metalness={0.85} />
      </mesh>
      <mesh position={[0, 0, -0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.005, 0.05, 8]} />
        <meshStandardMaterial color="#cccccc" roughness={0.15} metalness={0.95} />
      </mesh>
      <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.14, 8]} />
        <meshStandardMaterial color="#333333" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.21]}>
        <planeGeometry args={[0.018, 0.07]} />
        <meshStandardMaterial
          color="#cc2222"
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0, 0.21]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[0.018, 0.07]} />
        <meshStandardMaterial
          color="#cc2222"
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default function Darts() {
  const { state, dartLanded, inputRef } = useGame();
  const meshRefs = useRef<(THREE.Group | null)[]>([]);
  const flightRef = useRef<FlightState>({
    activeIdx: -1,
    dartIndex: 0,
    pos: new THREE.Vector3(),
    vel: 0,
  });
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const spawnDart = useCallback((index: number) => {
    const f = flightRef.current;
    f.dartIndex = index;
    f.activeIdx = index;
    const offsetX = (Math.random() - 0.5) * 2 * SPAWN_OFFSET;
    const offsetY = (Math.random() - 0.5) * 2 * SPAWN_OFFSET;
    f.pos.set(
      BOARD_POSITION.x + offsetX,
      BOARD_POSITION.y + offsetY,
      SPAWN_Z,
    );
    f.vel = FORWARD_V0;
    const g = meshRefs.current[index];
    if (g) {
      g.visible = true;
      g.position.copy(f.pos);
      g.rotation.set(-0.08, 0, 0.06);
    }
  }, []);

  useEffect(() => {
    meshRefs.current.forEach((g) => {
      if (!g) return;
      g.visible = false;
      g.position.set(HIDDEN_POS[0], HIDDEN_POS[1], HIDDEN_POS[2]);
    });
  }, []);

  useEffect(() => {
    if (!state.isThrowing) return;
    if (state.roundKey === 0) return;
    spawnDart(0);
  }, [state.roundKey, state.isThrowing, spawnDart]);

  useFrame((_, dt) => {
    const f = flightRef.current;
    if (f.activeIdx < 0 || !stateRef.current.isThrowing) return;

    f.vel += FORWARD_ACCEL * dt;
    f.pos.z -= f.vel * dt;

    const inp = inputRef.current;
    if (inp.impulses.length > 0) {
      for (const dir of inp.impulses) {
        switch (dir) {
          case "up":
            f.pos.y += NUDGE_STEP;
            break;
          case "down":
            f.pos.y -= NUDGE_STEP;
            break;
          case "left":
            f.pos.x -= NUDGE_STEP;
            break;
          case "right":
            f.pos.x += NUDGE_STEP;
            break;
        }
      }
      inp.impulses.length = 0;
    }
    if (inp.held.size > 0) {
      const step = CONTINUOUS_SPEED * dt;
      for (const dir of inp.held) {
        switch (dir) {
          case "up":
            f.pos.y += step;
            break;
          case "down":
            f.pos.y -= step;
            break;
          case "left":
            f.pos.x -= step;
            break;
          case "right":
            f.pos.x += step;
            break;
        }
      }
    }

    const g = meshRefs.current[f.activeIdx];
    if (g) {
      const flightT = Math.min(
        (SPAWN_Z - f.pos.z) / (SPAWN_Z - BOARD_FACE_Z),
        1,
      );
      g.position.copy(f.pos);
      g.rotation.set(
        THREE.MathUtils.lerp(-0.08, REST_ROT[0], flightT),
        0,
        THREE.MathUtils.lerp(0.06, REST_ROT[2], flightT),
      );
    }

    if (f.pos.z <= BOARD_FACE_Z) {
      f.pos.z = BOARD_FACE_Z;
      if (g) {
        g.position.copy(f.pos);
        g.rotation.set(...REST_ROT);
      }
      const outcome = computeOutcomeFromBoardPosition(f.pos.x, f.pos.y);
      f.activeIdx = -1;
      dartLanded(outcome);

      if (f.dartIndex < DART_COUNT - 1) {
        const nextIdx = f.dartIndex + 1;
        window.setTimeout(() => {
          if (!stateRef.current.isThrowing) return;
          spawnDart(nextIdx);
        }, INTER_DART_DELAY_MS);
      }
    }
  });

  return (
    <>
      {Array.from({ length: DART_COUNT }, (_, i) => (
        <group
          key={`${i}-${state.roundKey}`}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          visible={false}
        >
          <DartMeshParts />
        </group>
      ))}
    </>
  );
}