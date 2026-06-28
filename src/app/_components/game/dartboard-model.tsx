"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  BOARD_RADIUS,
  DART_NUMBERS,
  wedgeCenterAngle,
  WEDGE_HALF,
  WEDGE_SPAN,
} from "./dart-logic";

const Z_L = 0.015;
const NUMBER_RADIUS = 1.02;
const NUMBER_LOCAL_Z = -0.05;
const PUB_FONT = '"Georgia", serif';

let numberTextureCache: Map<number, THREE.CanvasTexture> | null = null;

function getNumberTexture(num: number): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture();
  }
  if (!numberTextureCache) numberTextureCache = new Map();
  const cached = numberTextureCache.get(num);
  if (cached) return cached;

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, size, size);
  ctx.font = `bold ${Math.round(size * 0.62)}px ${PUB_FONT}`;
  ctx.fillStyle = "#f5ecd7";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(num), size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  numberTextureCache.set(num, texture);
  return texture;
}

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
  const a0 = wedgeCenterAngle(index) - WEDGE_HALF;
  return (
    <mesh position={[0, 0, Z_L]}>
      <ringGeometry args={[innerR, outerR, 1, 1, a0, WEDGE_SPAN]} />
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
  return wedges;
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

function NumberLabel({ index }: { index: number }) {
  const a = wedgeCenterAngle(index);
  const x = Math.cos(a) * NUMBER_RADIUS;
  const y = Math.sin(a) * NUMBER_RADIUS;
  const num = DART_NUMBERS[index];
  const texture = useMemo(() => getNumberTexture(num ?? 20), [num]);
  return (
    <mesh position={[x, y, NUMBER_LOCAL_Z]}>
      <planeGeometry args={[0.2, 0.2]} />
      <meshBasicMaterial
        map={texture}
        transparent
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function DartboardModel() {
  const numbers = [];
  for (let i = 0; i < 20; i++) {
    numbers.push(<NumberLabel key={i} index={i} />);
  }

  return (
    <group position={[0, 0.45, -0.42]}>
      <FullRing ir={0.8} orr={BOARD_RADIUS} col="#0a0500" />
      <PieRing innerR={0.72} outerR={0.8} c1="#cc2222" c2="#228822" />
      <PieRing innerR={0.54} outerR={0.72} c1="#111111" c2="#f5ecd7" />
      <PieRing innerR={0.46} outerR={0.54} c1="#cc2222" c2="#228822" />
      <PieRing innerR={0.15} outerR={0.46} c1="#111111" c2="#f5ecd7" />
      <FullRing ir={0.04} orr={0.15} col="#228822" />
      <FullRing ir={0} orr={0.04} col="#cc2222" />
      {numbers}
    </group>
  );
}