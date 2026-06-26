"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
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
const FORWARD_V0 = 0.18;
const FORWARD_ACCEL = 0.22;
const IMPULSE_V = 0.55;
const HELD_ACCEL = 1.4;
const DAMP = 3.2;
const INTER_DART_DELAY_MS = 500;
const REST_ROT: [number, number, number] = [-0.18, 0, 0];
const HIDDEN_POS: [number, number, number] = [0, 0, 8];
const SPAWN_OFFSET = 0.78;

interface FlightState {
  activeIdx: number;
  dartIndex: number;
  pos: THREE.Vector3;
  vel: number;
  hvel: THREE.Vector2;
}

function useFlightShape() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.052);
    s.lineTo(0.04, 0.012);
    s.lineTo(0.03, -0.03);
    s.lineTo(0, -0.056);
    s.lineTo(-0.03, -0.03);
    s.lineTo(-0.04, 0.012);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.0025,
      bevelEnabled: true,
      bevelThickness: 0.0008,
      bevelSize: 0.0008,
      bevelSegments: 1,
    });
    geo.translate(0, 0, -0.00125);
    geo.computeVertexNormals();
    return geo;
  }, []);
}

const steelMat = new THREE.MeshStandardMaterial({
  color: "#cfcfcf",
  roughness: 0.18,
  metalness: 0.95,
});
const barrelMat = new THREE.MeshStandardMaterial({
  color: "#9ea2a6",
  roughness: 0.28,
  metalness: 0.9,
});
const shaftMat = new THREE.MeshStandardMaterial({
  color: "#1a1a1a",
  roughness: 0.4,
});
const flightMat = new THREE.MeshStandardMaterial({
  color: "#d4232a",
  roughness: 0.45,
  metalness: 0.15,
  side: THREE.DoubleSide,
  emissive: new THREE.Color("#330000"),
});
const flightMatB = new THREE.MeshStandardMaterial({
  color: "#f0e0b8",
  roughness: 0.5,
  metalness: 0.1,
  side: THREE.DoubleSide,
});

function DartMeshParts({ flightGeo }: { flightGeo: THREE.BufferGeometry }) {
  return (
    <group>
      {/* sharp steel point (front = -Z) */}
      <mesh position={[0, 0, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.006, 0.06, 12]} />
        <primitive object={steelMat} attach="material" />
      </mesh>
      {/* barrel: tapered knurled silver body */}
      <mesh position={[0, 0, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.014, 0.16, 16]} />
        <primitive object={barrelMat} attach="material" />
      </mesh>
      {/* dark shaft */}
      <mesh position={[0, 0, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.0045, 0.0045, 0.12, 10]} />
        <primitive object={shaftMat} attach="material" />
      </mesh>
      {/* crossed kite-shaped flights with 3D thickness (back = +Z) */}
      <mesh position={[0, 0, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={flightGeo} attach="geometry" />
        <primitive object={flightMat} attach="material" />
      </mesh>
      <mesh position={[0, 0, 0.2]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <primitive object={flightGeo} attach="geometry" />
        <primitive object={flightMatB} attach="material" />
      </mesh>
    </group>
  );
}

const aimMat = new THREE.MeshBasicMaterial({
  color: "#ffe066",
  transparent: true,
  opacity: 0.85,
  side: THREE.DoubleSide,
  toneMapped: false,
  depthTest: false,
});

export default function Darts() {
  const { state, dartLanded, inputRef } = useGame();
  const flightGeo = useFlightShape();
  const meshRefs = useRef<(THREE.Group | null)[]>([]);
  const aimRef = useRef<THREE.Mesh>(null);
  const flightRef = useRef<FlightState>({
    activeIdx: -1,
    dartIndex: 0,
    pos: new THREE.Vector3(),
    vel: 0,
    hvel: new THREE.Vector2(),
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
    f.hvel.set(0, 0);
    const g = meshRefs.current[index];
    if (g) {
      g.visible = true;
      g.position.copy(f.pos);
      g.rotation.set(-0.05, 0, 0);
    }
    if (aimRef.current) aimRef.current.visible = true;
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

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const f = flightRef.current;
    const aim = aimRef.current;
    if (f.activeIdx < 0 || !stateRef.current.isThrowing) {
      if (aim) aim.visible = false;
      return;
    }

    // forward motion
    f.vel += FORWARD_ACCEL * dt;
    f.pos.z -= f.vel * dt;

    // steering: impulses add horizontal velocity, held adds accel, damping settles
    const inp = inputRef.current;
    const hv = f.hvel;
    if (inp.impulses.length > 0) {
      for (const dir of inp.impulses) {
        switch (dir) {
          case "up":
            hv.y += IMPULSE_V;
            break;
          case "down":
            hv.y -= IMPULSE_V;
            break;
          case "left":
            hv.x -= IMPULSE_V;
            break;
          case "right":
            hv.x += IMPULSE_V;
            break;
        }
      }
      inp.impulses.length = 0;
    }
    if (inp.held.size > 0) {
      for (const dir of inp.held) {
        switch (dir) {
          case "up":
            hv.y += HELD_ACCEL * dt;
            break;
          case "down":
            hv.y -= HELD_ACCEL * dt;
            break;
          case "left":
            hv.x -= HELD_ACCEL * dt;
            break;
          case "right":
            hv.x += HELD_ACCEL * dt;
            break;
        }
      }
    }
    // damping
    const dampFactor = Math.exp(-DAMP * dt);
    hv.multiplyScalar(dampFactor);
    f.pos.x += hv.x * dt;
    f.pos.y += hv.y * dt;

    const g = meshRefs.current[f.activeIdx];
    if (g) {
      const flightT = Math.min(
        (SPAWN_Z - f.pos.z) / (SPAWN_Z - BOARD_FACE_Z),
        1,
      );
      g.position.copy(f.pos);
      // bank subtly into the direction of travel for game feel
      g.rotation.set(
        THREE.MathUtils.lerp(-0.05, REST_ROT[0], flightT),
        THREE.MathUtils.clamp(hv.x * 0.25, -0.35, 0.35),
        THREE.MathUtils.lerp(0.05, REST_ROT[2], flightT) -
          THREE.MathUtils.clamp(hv.y * 0.2, -0.3, 0.3),
      );
    }

    // live aim reticle on the board face
    if (aim) {
      aim.position.set(f.pos.x, f.pos.y, BOARD_FACE_Z + 0.004);
      const pulse = 1 + Math.sin(performance.now() * 0.012) * 0.12;
      aim.scale.setScalar(pulse);
    }

    if (f.pos.z <= BOARD_FACE_Z) {
      f.pos.z = BOARD_FACE_Z;
      if (g) {
        g.position.copy(f.pos);
        g.rotation.set(...REST_ROT);
      }
      if (aim) aim.visible = false;
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
          <DartMeshParts flightGeo={flightGeo} />
        </group>
      ))}
      <mesh ref={aimRef} position={[0, 0, BOARD_FACE_Z + 0.004]} visible={false} renderOrder={50}>
        <ringGeometry args={[0.018, 0.03, 24]} />
        <primitive object={aimMat} attach="material" />
      </mesh>
    </>
  );
}