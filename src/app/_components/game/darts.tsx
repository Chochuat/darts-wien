"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useSpring } from "@react-spring/three";
import * as THREE from "three";
import type { DartOutcome } from "./types";
import { HAND_POS, getBoardPos } from "./dart-logic";
import { useGame } from "./game-context";

function DartMesh({
  outcome,
  index,
}: {
  outcome: DartOutcome;
  index: number;
}) {
  const { dartLanded } = useGame();
  const groupRef = useRef<THREE.Group>(null);

  const target = useMemo(() => getBoardPos(outcome), [outcome]);
  const startPos = useMemo(() => HAND_POS.clone(), []);

  const [{ t }] = useSpring(
    () => ({
      t: 1,
      from: { t: 0 },
      delay: index * 280,
      config: { mass: 1, tension: 170, friction: 26 },
      onRest: () => dartLanded(),
    }),
    [],
  );

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const raw = t.get();
    const eased = 1 - Math.pow(1 - raw, 3);
    const arc = Math.sin(raw * Math.PI) * 0.12;

    g.position.lerpVectors(startPos, target, eased);
    g.position.y += arc * (1 - raw * 0.6);

    g.rotation.set(
      THREE.MathUtils.lerp(0, -0.18, eased),
      0,
      THREE.MathUtils.lerp(0.3, 0, eased),
    );
  });

  return (
    <group ref={groupRef} visible>
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

export default function Darts({ outcomes }: { outcomes: DartOutcome[] }) {
  const items = Array.from({ length: 3 }, (_, i) => outcomes[i] ?? null);
  return (
    <>
      {items.map((o, i) =>
        o ? <DartMesh key={i} outcome={o} index={i} /> : null,
      )}
    </>
  );
}