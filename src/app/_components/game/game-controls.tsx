"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "./game-context";
import type { Direction } from "./types";

const PANEL_X = 0.55;
const PANEL_Y = -0.75;
const PANEL_Z = -0.49;
const PANEL_W = 0.75;
const PANEL_H = 0.8;
const BTN_SIZE = 0.18;
const BTN_GAP = 0.21;
const JOY_RADIUS = 0.2;
const JOY_KNOB = 0.07;
const CREAM = "#e8d5a3";
const CRIMSON_DEEP = "#8b0000";
const DARK_BACK = "#1a0c04";

let arrowCache: Partial<Record<Direction, THREE.CanvasTexture>> | null = null;

function getArrowTexture(dir: Direction): THREE.CanvasTexture {
  if (typeof document === "undefined") return new THREE.CanvasTexture();
  if (!arrowCache) arrowCache = {};
  const cached = arrowCache[dir];
  if (cached) return cached;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = CRIMSON_DEEP;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = CREAM;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = CREAM;
  ctx.beginPath();
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.28;
  switch (dir) {
    case "up":
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx - r, cy + r * 0.85);
      ctx.lineTo(cx + r, cy + r * 0.85);
      break;
    case "down":
      ctx.moveTo(cx, cy + r);
      ctx.lineTo(cx - r, cy - r * 0.85);
      ctx.lineTo(cx + r, cy - r * 0.85);
      break;
    case "left":
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r * 0.85, cy - r);
      ctx.lineTo(cx + r * 0.85, cy + r);
      break;
    case "right":
      ctx.moveTo(cx + r, cy);
      ctx.lineTo(cx - r * 0.85, cy - r);
      ctx.lineTo(cx - r * 0.85, cy + r);
      break;
  }
  ctx.closePath();
  ctx.fill();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  arrowCache[dir] = tex;
  return tex;
}

function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return isTouch;
}

function ArrowButton({ dir }: { dir: Direction }) {
  const { state, nudge } = useGame();
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => getArrowTexture(dir), [dir]);
  const flashRef = useRef(0);

  let position: [number, number, number];
  switch (dir) {
    case "up":
      position = [PANEL_X, PANEL_Y + BTN_GAP, PANEL_Z + 0.001];
      break;
    case "down":
      position = [PANEL_X, PANEL_Y - BTN_GAP, PANEL_Z + 0.001];
      break;
    case "left":
      position = [PANEL_X - BTN_GAP, PANEL_Y, PANEL_Z + 0.001];
      break;
    default:
      position = [PANEL_X + BTN_GAP, PANEL_Y, PANEL_Z + 0.001];
      break;
  }

  useEffect(() => () => {
    document.body.style.cursor = "";
  }, []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const now = performance.now();
    const f = flashRef.current;
    if (f > now) {
      const p = (f - now) / 160;
      mesh.scale.setScalar(1 + 0.18 * p);
    } else {
      mesh.scale.setScalar(1);
    }
  });

  const handleDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!state.isThrowing) return;
    nudge(dir);
    flashRef.current = performance.now() + 160;
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerDown={handleDown}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
      renderOrder={12}
    >
      <planeGeometry args={[BTN_SIZE, BTN_SIZE]} />
      <meshBasicMaterial
        map={texture}
        transparent
        side={THREE.DoubleSide}
        toneMapped={false}
        opacity={state.isThrowing ? 1 : 0.4}
      />
    </mesh>
  );
}

function Joystick() {
  const { state, nudge } = useGame();
  const baseRef = useRef<THREE.Mesh>(null);
  const knobRef = useRef<THREE.Mesh>(null);
  const activeRef = useRef(false);
  const lastNudgeRef = useRef(0);
  const dirRef = useRef<Direction | null>(null);

  useEffect(() => () => {
    document.body.style.cursor = "";
  }, []);

  useFrame(() => {
    const knob = knobRef.current;
    if (!knob) return;
    if (!activeRef.current) {
      knob.position.set(PANEL_X, PANEL_Y, PANEL_Z + 0.012);
      return;
    }
    const now = performance.now();
    if (now - lastNudgeRef.current > 90 && dirRef.current) {
      if (state.isThrowing) nudge(dirRef.current);
      lastNudgeRef.current = now;
    }
  });

  const setFromUv = (uv: THREE.Vector2 | undefined) => {
    if (!uv) return;
    let dx = uv.x - 0.5;
    let dy = uv.y - 0.5;
    const mag = Math.sqrt(dx * dx + dy * dy);
    const maxMag = 0.5;
    if (mag > maxMag) {
      dx = (dx / mag) * maxMag;
      dy = (dy / mag) * maxMag;
    }
    const knob = knobRef.current;
    if (knob) {
      knob.position.set(
        PANEL_X + dx * JOY_RADIUS * 2,
        PANEL_Y + dy * JOY_RADIUS * 2,
        PANEL_Z + 0.012,
      );
    }
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    if (adx < 0.08 && ady < 0.08) {
      dirRef.current = null;
    } else if (adx > ady) {
      dirRef.current = dx > 0 ? "right" : "left";
    } else {
      dirRef.current = dy > 0 ? "up" : "down";
    }
  };

  const handleDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!state.isThrowing) return;
    activeRef.current = true;
    lastNudgeRef.current = performance.now();
    setFromUv(e.uv);
    (e.target as Element)?.setPointerCapture?.(e.pointerId);
  };

  const handleMove = (e: ThreeEvent<PointerEvent>) => {
    if (!activeRef.current) return;
    e.stopPropagation();
    setFromUv(e.uv);
  };

  const handleUp = () => {
    activeRef.current = false;
    dirRef.current = null;
  };

  return (
    <group>
      <mesh
        ref={baseRef}
        position={[PANEL_X, PANEL_Y, PANEL_Z + 0.001]}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerOut={handleUp}
        onPointerCancel={handleUp}
        renderOrder={11}
      >
        <circleGeometry args={[JOY_RADIUS, 48]} />
        <meshBasicMaterial
          color={CRIMSON_DEEP}
          transparent
          side={THREE.DoubleSide}
          toneMapped={false}
          opacity={state.isThrowing ? 0.7 : 0.3}
        />
      </mesh>
      <mesh
        ref={knobRef}
        position={[PANEL_X, PANEL_Y, PANEL_Z + 0.012]}
        renderOrder={13}
      >
        <circleGeometry args={[JOY_KNOB, 32]} />
        <meshBasicMaterial
          color={CREAM}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

let hintTexture: THREE.CanvasTexture | null = null;
function getHint(touch: boolean): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  if (hintTexture) return hintTexture;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.font = 'bold 40px "Georgia", serif';
  ctx.fillStyle = "rgba(232,213,163,0.6)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(touch ? "DRAG TO STEER" : "CLICK ARROWS TO STEER", 256, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  hintTexture = tex;
  return tex;
}

function Hint({ text }: { text: string }) {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.font = 'bold 38px "Georgia", serif';
    ctx.fillStyle = "rgba(232,213,163,0.6)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 48);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [text]);
  return (
    <mesh position={[PANEL_X, PANEL_Y - 0.33, PANEL_Z + 0.002]} renderOrder={12}>
      <planeGeometry args={[PANEL_W * 0.95, 0.11]} />
      <meshBasicMaterial
        map={tex ?? undefined}
        transparent
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function GameControls() {
  const isTouch = useIsTouch();
  void getHint;
  return (
    <group>
      <mesh position={[PANEL_X, PANEL_Y, PANEL_Z - 0.002]} receiveShadow>
        <planeGeometry args={[PANEL_W + 0.06, PANEL_H + 0.06]} />
        <meshStandardMaterial color={DARK_BACK} roughness={0.85} />
      </mesh>
      {isTouch ? <Joystick /> : null}
      {!isTouch ? (
        <>
          <ArrowButton dir="up" />
          <ArrowButton dir="down" />
          <ArrowButton dir="left" />
          <ArrowButton dir="right" />
        </>
      ) : null}
      <Hint text={isTouch ? "DRAG TO STEER" : "CLICK ARROWS TO STEER"} />
    </group>
  );
}