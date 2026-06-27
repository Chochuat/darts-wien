"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "./game-context";
import type { Direction } from "./types";

const PANEL_X = 0.55;
const PANEL_Y = -0.75;
const PANEL_Z = -0.45;
const PANEL_W = 0.75;
const PANEL_H = 0.8;
const BTN_SIZE = 0.18;
const BTN_GAP = 0.21;
const JOY_RADIUS = 0.2;
const JOY_KNOB = 0.07;
const CREAM = "#e8d5a3";
const CRIMSON_DEEP = "#8b0000";
const DARK_BACK = "#1a0c04";
const DEADZONE = 0.08;

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

function useOrbitBlock() {
  const controls = useThree((s) => s.controls) as
    | { enabled: boolean }
    | null;
  const disable = () => {
    if (controls) {
      (controls as { enabled: boolean }).enabled = false;
    }
  };
  const enable = () => {
    if (controls) {
      (controls as { enabled: boolean }).enabled = true;
    }
  };
  return { disable, enable };
}

function ArrowButton({ dir }: { dir: Direction }) {
  const { state, nudge } = useGame();
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => getArrowTexture(dir), [dir]);
  const flashRef = useRef(0);
  const { disable, enable } = useOrbitBlock();

  let position: [number, number, number];
  switch (dir) {
    case "up":
      position = [PANEL_X, PANEL_Y + BTN_GAP, PANEL_Z + 0.002];
      break;
    case "down":
      position = [PANEL_X, PANEL_Y - BTN_GAP, PANEL_Z + 0.002];
      break;
    case "left":
      position = [PANEL_X - BTN_GAP, PANEL_Y, PANEL_Z + 0.002];
      break;
    default:
      position = [PANEL_X + BTN_GAP, PANEL_Y, PANEL_Z + 0.002];
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
    if (e.nativeEvent && typeof e.nativeEvent.stopPropagation === "function") {
      e.nativeEvent.stopPropagation();
    }
    disable();
    if (!state.isThrowing) return;
    nudge(dir);
    flashRef.current = performance.now() + 160;
  };

  const handleUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    enable();
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerOut={() => {
        enable();
        document.body.style.cursor = "";
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      renderOrder={13}
    >
      <planeGeometry args={[BTN_SIZE, BTN_SIZE]} />
      <meshBasicMaterial
        map={texture}
        transparent
        side={THREE.DoubleSide}
        toneMapped={false}
        opacity={state.isThrowing ? 1 : 0.45}
      />
    </mesh>
  );
}

function Joystick() {
  const { state, setHeld } = useGame();
  const knobRef = useRef<THREE.Mesh>(null);
  const activeRef = useRef(false);
  const dirRef = useRef<Direction | null>(null);
  const { disable, enable } = useOrbitBlock();

  useEffect(() => () => {
    document.body.style.cursor = "";
    enable();
  }, [enable]);

  useFrame(() => {
    const knob = knobRef.current;
    if (!knob) return;
    if (!activeRef.current) {
      knob.position.set(PANEL_X, PANEL_Y, PANEL_Z + 0.012);
    }
  });

  const applyUv = (uv: THREE.Vector2 | undefined) => {
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
    let next: Direction | null = null;
    if (adx > DEADZONE || ady > DEADZONE) {
      if (adx > ady) next = dx > 0 ? "right" : "left";
      else next = dy > 0 ? "up" : "down";
    }
    if (next !== dirRef.current) {
      if (dirRef.current) setHeld(dirRef.current, false);
      if (next) setHeld(next, true);
      dirRef.current = next;
    }
  };

  const handleDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.nativeEvent && typeof e.nativeEvent.stopPropagation === "function") {
      e.nativeEvent.stopPropagation();
    }
    disable();
    if (!state.isThrowing) return;
    activeRef.current = true;
    applyUv(e.uv);
    const el = e.nativeEvent?.target as Element | undefined;
    if (el && typeof el.setPointerCapture === "function" && e.pointerId != null) {
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleMove = (e: ThreeEvent<PointerEvent>) => {
    if (!activeRef.current) return;
    e.stopPropagation();
    applyUv(e.uv);
  };

  const handleUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    activeRef.current = false;
    if (dirRef.current) setHeld(dirRef.current, false);
    dirRef.current = null;
    enable();
  };

  return (
    <group>
      <mesh
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
          opacity={state.isThrowing ? 0.55 : 0.25}
        />
      </mesh>
      <mesh
        ref={knobRef}
        position={[PANEL_X, PANEL_Y, PANEL_Z + 0.012]}
        renderOrder={14}
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

function BackdropBlock() {
  const { disable, enable } = useOrbitBlock();
  return (
    <mesh
      position={[PANEL_X, PANEL_Y, PANEL_Z - 0.002]}
      receiveShadow
      onPointerDown={(e) => {
        e.stopPropagation();
        if (
          e.nativeEvent &&
          typeof e.nativeEvent.stopPropagation === "function"
        ) {
          e.nativeEvent.stopPropagation();
        }
        disable();
      }}
      onPointerUp={() => enable()}
      onPointerOut={() => enable()}
    >
      <planeGeometry args={[PANEL_W + 0.06, PANEL_H + 0.06]} />
      <meshStandardMaterial color={DARK_BACK} roughness={0.85} />
    </mesh>
  );
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
    <mesh
      position={[PANEL_X, PANEL_Y - 0.33, PANEL_Z + 0.003]}
      renderOrder={12}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
    >
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

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

function KeyboardControls() {
  const { state, setHeld } = useGame();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const dir = KEY_MAP[e.key];
      if (!dir) return;
      e.preventDefault();
      if (state.isThrowing) setHeld(dir, true);
    };
    const handleUp = (e: KeyboardEvent) => {
      const dir = KEY_MAP[e.key];
      if (!dir) return;
      e.preventDefault();
      setHeld(dir, false);
    };
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, [state.isThrowing, setHeld]);
  return null;
}

const DEADZONE_PX = 24;

function FullScreenTouchSteer() {
  const { state, setHeld } = useGame();
  const controls = useThree((s) => s.controls) as
    | { enabled: boolean }
    | null;
  const activeRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const dirRef = useRef<Direction | null>(null);

  useEffect(() => {
    if (!state.isThrowing) return;
    if (typeof window === "undefined") return;

    const setDir = (dir: Direction | null) => {
      if (dir === dirRef.current) return;
      if (dirRef.current) setHeld(dirRef.current, false);
      if (dir) setHeld(dir, true);
      dirRef.current = dir;
    };

    const handleStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      activeRef.current = true;
      startXRef.current = touch.clientX;
      startYRef.current = touch.clientY;
      if (controls) {
        (controls as { enabled: boolean }).enabled = false;
      }
    };

    const handleMove = (e: TouchEvent) => {
      if (!activeRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      const dx = touch.clientX - startXRef.current;
      const dy = touch.clientY - startYRef.current;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      if (adx < DEADZONE_PX && ady < DEADZONE_PX) {
        setDir(null);
      } else if (adx > ady) {
        setDir(dx > 0 ? "right" : "left");
      } else {
        setDir(dy > 0 ? "down" : "up");
      }
    };

    const handleEnd = () => {
      activeRef.current = false;
      setDir(null);
      if (controls) {
        (controls as { enabled: boolean }).enabled = true;
      }
    };

    window.addEventListener("touchstart", handleStart, { passive: true });
    window.addEventListener("touchmove", handleMove, { passive: true });
    window.addEventListener("touchend", handleEnd, { passive: true });
    window.addEventListener("touchcancel", handleEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleStart);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
      setDir(null);
    };
  }, [state.isThrowing, setHeld, controls]);

  return null;
}

function CameraHint() {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.font = 'bold 34px "Georgia", serif';
    ctx.fillStyle = "rgba(232,213,163,0.5)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("DRAG TO ORBIT CAMERA", 256, 48);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  return (
    <mesh position={[0, 1.55, -0.45]} renderOrder={5}>
      <planeGeometry args={[1.2, 0.15]} />
      <meshBasicMaterial
        map={tex ?? undefined}
        transparent
        side={THREE.DoubleSide}
        toneMapped={false}
        depthTest={false}
      />
    </mesh>
  );
}

export default function GameControls() {
  const isTouch = useIsTouch();
  const { t } = useTranslation();
  const hint = isTouch ? t("controls.steerTouch") : t("controls.steerMouse");
  return (
    <group>
      <BackdropBlock />
      {isTouch ? <Joystick /> : null}
      {!isTouch ? (
        <>
          <ArrowButton dir="up" />
          <ArrowButton dir="down" />
          <ArrowButton dir="left" />
          <ArrowButton dir="right" />
        </>
      ) : null}
      <Hint text={hint} />
      <KeyboardControls />
      {isTouch ? <FullScreenTouchSteer /> : null}
      {isTouch ? <CameraHint /> : null}
    </group>
  );
}
