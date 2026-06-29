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

/**
 * Creates or retrieves a cached number texture.
 *
 * @param num - The number to render.
 */
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

const Wedge = (props: {
  innerR: number;
  outerR: number;
  color: string;
  index: number;
}) => {
  const a0 = wedgeCenterAngle(props.index) - WEDGE_HALF;
  return (
    <mesh position={[0, 0, Z_L]}>
      <ringGeometry args={[props.innerR, props.outerR, 1, 1, a0, WEDGE_SPAN]} />
      <meshStandardMaterial
        color={props.color}
        roughness={0.55}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * Renders alternating color wedges in a ring.
 *
 * @param props - Component properties.
 */
function PieRing(props: {
  innerR: number;
  outerR: number;
  c1: string;
  c2: string;
}) {
  const wedges = [];
  for (let s = 0; s < 20; s++) {
    wedges.push(
      <Wedge
        color={s % 2 === 0 ? props.c1 : props.c2}
        index={s}
        innerR={props.innerR}
        key={s}
        outerR={props.outerR}
      />,
    );
  }
  return wedges;
}

const FullRing = ({ ir, orr, col }: { ir: number; orr: number; col: string }) => {
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

const NumberLabel = ({ index }: { index: number }) => {
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
        side={THREE.DoubleSide}
        toneMapped={false}
        transparent
      />
    </mesh>
  );
}


/**
 * 3D dartboard model for the game scene.
 */
const DartboardModel = () => {
  const numbers = [];
  for (let i = 0; i < 20; i++) {
    numbers.push(<NumberLabel index={i} key={i} />);
  }

  return (
    <group position={[0, 0.45, -0.42]}>
      <FullRing col="#0a0500" ir={0.8} orr={BOARD_RADIUS} />
      <PieRing c1="#cc2222" c2="#228822" innerR={0.72} outerR={0.8} />
      <PieRing c1="#111111" c2="#f5ecd7" innerR={0.54} outerR={0.72} />
      <PieRing c1="#cc2222" c2="#228822" innerR={0.46} outerR={0.54} />
      <PieRing c1="#111111" c2="#f5ecd7" innerR={0.15} outerR={0.46} />
      <FullRing col="#228822" ir={0.04} orr={0.15} />
      <FullRing col="#cc2222" ir={0} orr={0.04} />
      {numbers}
    </group>
  );
}

export default DartboardModel;
