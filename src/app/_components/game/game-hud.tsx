"use client";

import { useEffect, useRef } from "react";
import { type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "./game-context";

const PUB_FONT = '"Georgia", serif';
const CREAM = "#f0e0b8";
const MUTED = "#c9a86a";
const LABEL_BACK = "rgba(10,5,0,0.55)";
const CRIMSON_DEEP = "#8b0000";
const CRIMSON_SHADOW = "#660000";

const PANEL_X = -0.55;
const PANEL_Y = -0.75;
const PANEL_Z = -0.49;
const PANEL_W = 0.75;
const PANEL_H = 0.8;

interface HudResources {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
}

let hudResources: HudResources | null = null;

function getHud(): HudResources | null {
  if (hudResources) return hudResources;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  hudResources = { canvas, ctx, texture };
  return hudResources;
}

interface ButtonRect {
  u0: number;
  u1: number;
  v0: number;
  v1: number;
}

function drawHud(
  res: HudResources,
  cw: number,
  ch: number,
  state: ReturnType<typeof useGame>["state"],
  buttonRect: { current: ButtonRect },
) {
  const { canvas, ctx, texture } = res;
  if (canvas.width !== cw) canvas.width = cw;
  if (canvas.height !== ch) canvas.height = ch;

  ctx.clearRect(0, 0, cw, ch);

  ctx.font = `${Math.round(ch * 0.045)}px ${PUB_FONT}`;
  ctx.fillStyle = "rgba(201,168,106,0.85)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  labelBack(ctx, cw / 2, ch * 0.06, cw * 0.5, ch * 0.06);
  ctx.fillText("DRAG · SCROLL", cw / 2, ch * 0.06);

  ctx.font = `bold ${Math.round(ch * 0.085)}px ${PUB_FONT}`;
  ctx.fillStyle = CREAM;
  labelBack(ctx, cw / 2, ch * 0.14, cw * 0.5, ch * 0.08);
  ctx.fillText("DARTS", cw / 2, ch * 0.14);

  ctx.font = `${Math.round(ch * 0.04)}px ${PUB_FONT}`;
  ctx.fillStyle = MUTED;
  ctx.fillText("TOTAL", cw / 2, ch * 0.24);
  ctx.font = `bold ${Math.round(ch * 0.11)}px ${PUB_FONT}`;
  ctx.fillStyle = CREAM;
  labelBack(ctx, cw / 2, ch * 0.32, cw * 0.5, ch * 0.11);
  ctx.fillText(`${state.totalScore}`, cw / 2, ch * 0.32);

  const showRound =
    !state.isThrowing &&
    state.landedCount >= 3 &&
    state.outcomes.length > 0;

  if (showRound) {
    const labels = state.outcomes.map((o) => o.label).join("  ·  ");
    const roundScore = state.outcomes.reduce((s, o) => s + o.score, 0);

    ctx.font = `bold ${Math.round(ch * 0.05)}px ${PUB_FONT}`;
    ctx.fillStyle = MUTED;
    labelBack(ctx, cw / 2, ch * 0.44, cw * 0.78, ch * 0.06);
    ctx.fillText(labels, cw / 2, ch * 0.44);

    ctx.font = `bold ${Math.round(ch * 0.09)}px ${PUB_FONT}`;
    ctx.fillStyle = CREAM;
    labelBack(ctx, cw / 2, ch * 0.53, cw * 0.5, ch * 0.1);
    ctx.fillText(`${roundScore} pts`, cw / 2, ch * 0.53);
  }

  const bw = cw * 0.78;
  const bh = ch * 0.13;
  const bx = (cw - bw) / 2;
  const by = ch * 0.74;
  const disabled = state.isThrowing;

  ctx.globalAlpha = disabled ? 0.45 : 1;
  ctx.fillStyle = CRIMSON_SHADOW;
  roundRect(ctx, bx, by + bh * 0.06, bw, bh, bh * 0.2);
  ctx.fill();
  ctx.fillStyle = CRIMSON_DEEP;
  roundRect(ctx, bx, by, bw, bh, bh * 0.2);
  ctx.fill();

  ctx.font = `bold ${Math.round(bh * 0.45)}px ${PUB_FONT}`;
  ctx.fillStyle = CREAM;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("THROW", cw / 2, by + bh / 2);

  if (disabled) {
    ctx.font = `${Math.round(bh * 0.25)}px ${PUB_FONT}`;
    ctx.fillStyle = "rgba(232,213,163,0.7)";
    ctx.fillText("flight...", cw / 2, by + bh * 1.25);
  }
  ctx.globalAlpha = 1;

  buttonRect.current = {
    u0: bx / cw,
    u1: (bx + bw) / cw,
    v0: 1 - (by + bh) / ch,
    v1: 1 - by / ch,
  };

  texture.needsUpdate = true;
}

export default function GameHUD() {
  const { state, throwDarts } = useGame();
  const buttonRect = useRef<ButtonRect>({ u0: 0, u1: 0, v0: 0, v1: 0 });
  const hud = getHud();
  const texture = hud?.texture ?? null;

  const cw = 512;
  const ch = Math.round((cw / PANEL_W) * PANEL_H);

  useEffect(() => {
    if (!hud) return;
    drawHud(hud, cw, ch, state, buttonRect);
  }, [hud, cw, ch, state]);

  const isOverButton = (uv: THREE.Vector2 | undefined): boolean => {
    if (!uv) return false;
    const r = buttonRect.current;
    return uv.x >= r.u0 && uv.x <= r.u1 && uv.y >= r.v0 && uv.y <= r.v1;
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    document.body.style.cursor = isOverButton(e.uv) ? "pointer" : "";
  };

  const handlePointerOut = () => {
    document.body.style.cursor = "";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!isOverButton(e.uv)) return;
    e.stopPropagation();
    if (state.isThrowing) return;
    throwDarts();
  };

  return (
    <group>
      <mesh
        position={[PANEL_X, PANEL_Y, PANEL_Z - 0.002]}
        receiveShadow
      >
        <planeGeometry args={[PANEL_W + 0.06, PANEL_H + 0.06]} />
        <meshStandardMaterial color="#2a1a0c" roughness={0.8} />
      </mesh>
      <mesh
        position={[PANEL_X, PANEL_Y, PANEL_Z]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        renderOrder={10}
      >
        <planeGeometry args={[PANEL_W, PANEL_H]} />
        <meshBasicMaterial
          map={texture ?? undefined}
          transparent
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function labelBack(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
) {
  ctx.save();
  ctx.fillStyle = LABEL_BACK;
  roundRect(ctx, cx - w / 2, cy - h / 2, w, h, h * 0.25);
  ctx.fill();
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}