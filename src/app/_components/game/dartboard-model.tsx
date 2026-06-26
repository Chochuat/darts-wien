"use client";

import * as THREE from "three";
import { BOARD_RADIUS } from "./dart-logic";

const Z_L = 0.015;

function Wedge({
  innerR,
  outerR,
  color,
  index,
}: {
  innerR: number;
  outerR: number;
  color: string;
  index: number;
}) {
  const a0 = (index / 20) * Math.PI * 2;
  const a1 = ((index + 1) / 20) * Math.PI * 2;
  return (
    <mesh position={[0, 0, Z_L]}>
      <ringGeometry args={[innerR, outerR, 1, 1, a0, a1 - a0]} />
      <meshStandardMaterial
        color={color}
        roughness={0.55}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function PieRing({
  innerR,
  outerR,
  c1,
  c2,
}: {
  innerR: number;
  outerR: number;
  c1: string;
  c2: string;
}) {
  const wedges = [];
  for (let s = 0; s < 20; s++) {
    wedges.push(
      <Wedge
        key={s}
        innerR={innerR}
        outerR={outerR}
        color={s % 2 === 0 ? c1 : c2}
        index={s}
      />,
    );
  }
  return <>{wedges}</>;
}

function FullRing({ ir, orr, col }: { ir: number; orr: number; col: string }) {
  return (
    <mesh position={[0, 0, Z_L]}>
      <ringGeometry args={[ir, orr, 80]} />
      <meshStandardMaterial
        color={col}
        roughness={0.55}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function NumberMarker({ index }: { index: number }) {
  const a = (index / 20) * Math.PI * 2 - Math.PI / 2;
  return (
    <mesh position={[Math.cos(a) * 0.85, Math.sin(a) * 0.85, Z_L]}>
      <cylinderGeometry args={[0.018, 0.018, 0.03, 8]} />
      <meshStandardMaterial color="#f5ecd7" roughness={0.4} />
    </mesh>
  );
}

export default function DartboardModel() {
  const markers = [];
  for (let i = 0; i < 20; i++) {
    markers.push(<NumberMarker key={i} index={i} />);
  }

  return (
    <group position={[0, 0.15, -0.42]}>
      <FullRing ir={0.8} orr={BOARD_RADIUS} col="#0a0500" />
      <PieRing innerR={0.72} outerR={0.8} c1="#cc2222" c2="#228822" />
      <PieRing innerR={0.54} outerR={0.72} c1="#111111" c2="#f5ecd7" />
      <PieRing innerR={0.46} outerR={0.54} c1="#cc2222" c2="#228822" />
      <PieRing innerR={0.15} outerR={0.46} c1="#111111" c2="#f5ecd7" />
      <FullRing ir={0.04} orr={0.15} col="#228822" />
      <FullRing ir={0} orr={0.04} col="#cc2222" />
      {markers}
    </group>
  );
}