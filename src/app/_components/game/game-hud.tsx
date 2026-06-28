"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ThreeEvent } from "@react-three/fiber";
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
const PANEL_Z = -0.45;
const PANEL_W = 0.75;
const PANEL_H = 0.8;

interface HudResources {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
}

let hudResources: HudResources | null = null;

const HUD_CW = 512;
const HUD_CH = Math.round((HUD_CW / PANEL_W) * PANEL_H);

function getHud(): HudResources | null {
  if (hudResources) return hudResources;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = HUD_CW;
  canvas.height = HUD_CH;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = "#2a1a0c";
  ctx.fillRect(0, 0, HUD_CW, HUD_CH);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  hudResources = { canvas, ctx, texture };
  return hudResources;
}

interface ButtonRect {
  u0: number;
  u1: number;
  v0: number;
  v1: number;
}

interface HudTexts {
  orbitHint: string;
  title: string;
  totalLabel: string;
  pointsShort: string;
  throwLabel: string;
  flightStatus: string;
  missLabel: string;
}

function drawHud(
  res: HudResources,
  cw: number,
  ch: number,
  state: ReturnType<typeof useGame>["state"],
  buttonRect: { current: ButtonRect },
  texts: HudTexts,
) {
  const { ctx, texture } = res;

  ctx.clearRect(0, 0, cw, ch);

  ctx.font = `${Math.round(ch * 0.045)}px ${PUB_FONT}`;
  ctx.fillStyle = "rgba(201,168,106,0.85)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  labelBack(ctx, cw / 2, ch * 0.06, cw * 0.5, ch * 0.06);
  ctx.fillText(texts.orbitHint, cw / 2, ch * 0.06);

  ctx.font = `bold ${Math.round(ch * 0.085)}px ${PUB_FONT}`;
  ctx.fillStyle = CREAM;
  labelBack(ctx, cw / 2, ch * 0.14, cw * 0.5, ch * 0.08);
  ctx.fillText(texts.title, cw / 2, ch * 0.14);

  ctx.font = `${Math.round(ch * 0.04)}px ${PUB_FONT}`;
  ctx.fillStyle = MUTED;
  ctx.fillText(texts.totalLabel, cw / 2, ch * 0.24);
  ctx.font = `bold ${Math.round(ch * 0.11)}px ${PUB_FONT}`;
  ctx.fillStyle = CREAM;
  labelBack(ctx, cw / 2, ch * 0.32, cw * 0.5, ch * 0.11);
  ctx.fillText(`${state.totalScore}`, cw / 2, ch * 0.32);

  const showRound =
    !state.isThrowing &&
    state.landedCount >= 3 &&
    state.outcomes.length > 0;

  if (showRound) {
    const labels = state.outcomes
      .map((o) => (o.label === "MISS" ? texts.missLabel : o.label))
      .join("  ·  ");
    const roundScore = state.outcomes.reduce((s, o) => s + o.score, 0);

    ctx.font = `bold ${Math.round(ch * 0.05)}px ${PUB_FONT}`;
    ctx.fillStyle = MUTED;
    labelBack(ctx, cw / 2, ch * 0.44, cw * 0.78, ch * 0.06);
    ctx.fillText(labels, cw / 2, ch * 0.44);

    ctx.font = `bold ${Math.round(ch * 0.09)}px ${PUB_FONT}`;
    ctx.fillStyle = CREAM;
    labelBack(ctx, cw / 2, ch * 0.53, cw * 0.5, ch * 0.1);
    ctx.fillText(`${roundScore} ${texts.pointsShort}`, cw / 2, ch * 0.53);
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

  ctx.font = `bold ${Math.round(bh * (texts.throwLabel.length > 7 ? 0.32 : 0.45))}px ${PUB_FONT}`;
  ctx.fillStyle = CREAM;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(texts.throwLabel, cw / 2, by + bh / 2);

  if (disabled) {
    ctx.font = `${Math.round(bh * 0.25)}px ${PUB_FONT}`;
    ctx.fillStyle = "rgba(232,213,163,0.7)";
    ctx.fillText(texts.flightStatus, cw / 2, by + bh * 1.25);
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


/**
 * Game HUD overlay showing scores and info.
 */
const GameHUD = () => {
  const { state, throwDarts, openKeypad } = useGame();
  const { t } = useTranslation();
  const buttonRect = useRef<ButtonRect>({ u0: 0, u1: 0, v0: 0, v1: 0 });
  const hud = getHud();
  const texture = hud?.texture ?? null;

  const cw = HUD_CW;
  const ch = HUD_CH;

  const texts = useMemo<HudTexts>(
    () => ({
      orbitHint: t("hud.orbitHint"),
      title: t("hud.title"),
      totalLabel: t("hud.total"),
      pointsShort: t("hud.pointsShort"),
      throwLabel: state.playerName == null ? t("keyboard.title") : t("hud.throw"),
      flightStatus: t("hud.flightStatus"),
      missLabel: t("outcome.miss"),
    }),
    [t, state.playerName],
  );

  useEffect(() => {
    if (!hud) return;
    drawHud(hud, cw, ch, state, buttonRect, texts);
  }, [hud, cw, ch, state, texts]);

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
    if (state.isThrowing || state.resultOpen || state.keypadOpen) return;
    if (state.playerName == null) {
      openKeypad();
      return;
    }
    throwDarts();
  };

  const [hintOpacity, setHintOpacity] = useState(1);
  useEffect(() => {
    const id = window.setTimeout(() => setHintOpacity(0), 5500);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <group>
      <mesh
        position={[PANEL_X, PANEL_Y, PANEL_Z - 0.002]}
      >
        <planeGeometry args={[PANEL_W + 0.06, PANEL_H + 0.06]} />
        <meshBasicMaterial color="#2a1a0c" side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        position={[PANEL_X, PANEL_Y, PANEL_Z]}
        renderOrder={10}
      >
        <planeGeometry args={[PANEL_W, PANEL_H]} />
        <meshBasicMaterial
          map={texture ?? undefined}
          side={THREE.DoubleSide}
          toneMapped={false}
          transparent
        />
      </mesh>
      <DragHint opacity={hintOpacity} text={t("leaderboard.dragHint")} />
    </group>
  );
}

const DragHint = ({ opacity, text }: { opacity: number; text: string }) => {
  const tex = useMemo(() => {
    if (typeof document === "undefined" || opacity <= 0) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.font = 'bold 36px "Georgia", serif';
    ctx.fillStyle = `rgba(232,213,163,${String(opacity)})`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 48);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
  }, [text, opacity]);

  if (opacity <= 0 || !tex) return null;
  return (
    <mesh position={[0.55, -0.4, -0.44]} renderOrder={11}>
      <planeGeometry args={[0.7, 0.13]} />
      <meshBasicMaterial
        map={tex}
        side={THREE.DoubleSide}
        toneMapped={false}
        transparent
      />
    </mesh>
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

export default GameHUD;
