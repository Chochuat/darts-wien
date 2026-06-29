"use client";

import { useEffect, useMemo, useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "./game-context";
import { useTranslation } from "react-i18next";

const PANEL_Z = -0.05;
const PANEL_W = 1.6;
const PANEL_H = 1.6;
const PUB_FONT = '"Georgia", serif';
const CREAM = "#f0e0b8";
const MUTED = "#c9a86a";
const CRIMSON_DEEP = "#8b0000";
const DARK_BACK = "#120802";

interface PopupResources {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
}
let popupResources: PopupResources | null = null;
/**
 * Creates or retrieves the cached popup resources.
 */
function getPopup(): PopupResources | null {
  if (popupResources) return popupResources;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  canvas.width = 1024;
  canvas.height = Math.round((1024 / PANEL_W) * PANEL_H);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  popupResources = { canvas, ctx, texture };
  return popupResources;
}

interface DrawParams {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
  playerName: string;
  resultScore: number;
  beReadyText: string;
  ptsShort: string;
}

/**
 * Draws the round result popup.
 *
 * @param params - Popup drawing parameters.
 */
function drawPopup(params: DrawParams) {
  const cw = params.canvas.width;
  const ch = params.canvas.height;
  params.ctx.clearRect(0, 0, cw, ch);

  params.ctx.fillStyle = DARK_BACK;
  const r = ch * 0.04;
  params.ctx.beginPath();
  params.ctx.moveTo(r, 0);
  params.ctx.arcTo(cw, 0, cw, ch, r);
  params.ctx.arcTo(cw, ch, 0, ch, r);
  params.ctx.arcTo(0, ch, 0, 0, r);
  params.ctx.arcTo(0, 0, cw, 0, r);
  params.ctx.closePath();
  params.ctx.fill();
  params.ctx.strokeStyle = CRIMSON_DEEP;
  params.ctx.lineWidth = 18;
  params.ctx.stroke();

  params.ctx.textAlign = "center";
  params.ctx.textBaseline = "middle";

  params.ctx.fillStyle = MUTED;
  params.ctx.font = `${Math.round(ch * 0.05)}px ${PUB_FONT}`;
  params.ctx.fillText(params.playerName, cw / 2, ch * 0.09);

  params.ctx.fillStyle = CREAM;
  params.ctx.font = `bold ${Math.round(ch * 0.22)}px ${PUB_FONT}`;
  params.ctx.fillText(`${params.resultScore}`, cw / 2, ch * 0.24);
  params.ctx.font = `${Math.round(ch * 0.045)}px ${PUB_FONT}`;
  params.ctx.fillStyle = MUTED;
  params.ctx.fillText(params.ptsShort.toUpperCase(), cw / 2, ch * 0.34);

  params.ctx.fillStyle = CREAM;
  params.ctx.font = `bold ${Math.round(ch * 0.08)}px ${PUB_FONT}`;
  params.ctx.fillText("DARTS WIEN", cw / 2, ch * 0.46);
  params.ctx.font = `${Math.round(ch * 0.05)}px ${PUB_FONT}`;
  params.ctx.fillStyle = MUTED;
  params.ctx.fillText("SEPTEMBER 2027", cw / 2, ch * 0.54);
  params.ctx.font = `bold ${Math.round(ch * 0.07)}px ${PUB_FONT}`;
  params.ctx.fillStyle = CREAM;
  params.ctx.fillText(params.beReadyText, cw / 2, ch * 0.64);

  params.texture.needsUpdate = true;
}

let nextBtnTex: THREE.CanvasTexture | null = null;
let nextBtnLabel: string | null = null;
/**
 * Creates or retrieves a cached "Next" button texture.
 *
 * @param label - The button label text.
 */
function getNextBtnTexture(label: string): THREE.CanvasTexture {
  if (typeof document === "undefined") return new THREE.CanvasTexture();
  if (nextBtnTex && nextBtnLabel === label) return nextBtnTex;
  nextBtnLabel = label;
  const w = 1024;
  const h = 192;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = CRIMSON_DEEP;
  const r = h * 0.22;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(w, 0, w, h, r);
  ctx.arcTo(w, h, 0, h, r);
  ctx.arcTo(0, h, 0, 0, r);
  ctx.arcTo(0, 0, w, 0, r);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = CREAM;
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.fillStyle = CREAM;
  ctx.font = `bold 96px ${PUB_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, w / 2, h / 2);
  if (nextBtnTex) nextBtnTex.dispose();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  nextBtnTex = tex;
  return tex;
}


/**
 * Game result display overlay.
 */
const GameResult = () => {
  const { state, dismissResult } = useGame();
  const { t } = useTranslation();
  const popup = getPopup();
  const texture = popup?.texture ?? null;
  const [btnHover, setBtnHover] = useState(false);

  const btnLabel = useMemo(() => t("result.nextThrow"), [t]);

  useEffect(() => {
    if (!popup || !state.resultOpen) return;
    drawPopup({
      canvas: popup.canvas,
      ctx: popup.ctx,
      texture: popup.texture,
      playerName: state.playerName ?? "",
      resultScore: state.resultScore,
      beReadyText: t("result.beReady"),
      ptsShort: t("hud.pointsShort"),
    });
  }, [
    popup,
    state.resultOpen,
    state.resultScore,
    state.playerName,
    t,
  ]);

  if (!state.resultOpen) return null;

  const btnW = PANEL_W * 0.55;
  const btnH = 0.18;

  const handleBtnDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.nativeEvent && typeof e.nativeEvent.stopPropagation === "function") {
      e.nativeEvent.stopPropagation();
    }
    dismissResult();
  };

  return (
    <group>
      <mesh position={[0, 0.25, PANEL_Z - 0.005]} renderOrder={30}>
        <planeGeometry args={[PANEL_W + 0.1, PANEL_H + 0.1]} />
        <meshBasicMaterial color={DARK_BACK} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.25, PANEL_Z + 0.001]} renderOrder={31}>
        <planeGeometry args={[PANEL_W, PANEL_H]} />
        <meshBasicMaterial
          map={texture ?? undefined}
          side={THREE.DoubleSide}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh
        onPointerDown={handleBtnDown}
        onPointerOut={() => {
          setBtnHover(false);
          document.body.style.cursor = "";
        }}
        onPointerOver={() => {
          setBtnHover(true);
          document.body.style.cursor = "pointer";
        }}
        position={[0, 0.25 - PANEL_H / 2 + btnH / 2 + 0.08, PANEL_Z + 0.004]}
        renderOrder={33}
      >
        <planeGeometry args={[btnW, btnH]} />
        <meshBasicMaterial
          map={getNextBtnTexture(btnLabel)}
          opacity={btnHover ? 1 : 0.95}
          side={THREE.DoubleSide}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  );
}

export default GameResult;
