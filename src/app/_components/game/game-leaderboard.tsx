"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useGame } from "./game-context";
import { useTopThrows, type LeaderboardEntry } from "./leaderboard-api";
import { useTranslation } from "react-i18next";

const PANEL_X = 2.4;
const PANEL_Y = 0.55;
const PANEL_Z = -0.45;
const PANEL_W = 0.95;
const PANEL_H = 1.95;
const PUB_FONT = '"Georgia", serif';
const CREAM = "#f0e0b8";
const MUTED = "#c9a86a";
const GOLD = "#f5d36b";
const SILVER = "#d6d6dc";
const BRONZE = "#c98a54";
const DARK_BACK = "#120802";

interface LbResources {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
}
let lbResources: LbResources | null = null;
/**
 *
 */
function getLb(): LbResources | null {
  if (lbResources) return lbResources;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  canvas.width = 512;
  canvas.height = Math.round((512 / PANEL_W) * PANEL_H);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  lbResources = { canvas, ctx, texture };
  return lbResources;
}

const PODIUM_COLORS = [GOLD, SILVER, BRONZE];

/**
 *
 * @param res
 * @param entries
 * @param loading
 * @param tTitle
 * @param tLoading
 * @param tEmpty
 */
function drawLb(
  res: LbResources,
  entries: LeaderboardEntry[],
  loading: boolean,
  tTitle: string,
  tLoading: string,
  tEmpty: string,
) {
  const { canvas, ctx, texture } = res;
  const cw = canvas.width;
  const ch = canvas.height;
  ctx.clearRect(0, 0, cw, ch);

  ctx.fillStyle = CREAM;
  ctx.font = `bold ${Math.round(ch * 0.05)}px ${PUB_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(tTitle, cw / 2, ch * 0.045);

  const startY = ch * 0.1;
  const rowH = ch * 0.08;

  if (loading) {
    ctx.fillStyle = MUTED;
    ctx.font = `${Math.round(ch * 0.04)}px ${PUB_FONT}`;
    ctx.fillText(tLoading, cw / 2, ch * 0.3);
    texture.needsUpdate = true;
    return;
  }
  if (entries.length === 0) {
    ctx.fillStyle = MUTED;
    ctx.font = `${Math.round(ch * 0.04)}px ${PUB_FONT}`;
    ctx.fillText(tEmpty, cw / 2, ch * 0.3);
    texture.needsUpdate = true;
    return;
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  for (let i = 0; i < entries.length && i < 10; i++) {
    const e = entries[i];
    if (!e) continue;
    const y = startY + i * rowH;
    const podium = i < 3;
    const posColor = (podium ? PODIUM_COLORS[i] : MUTED) ?? MUTED;
    const nameColor = podium ? CREAM : MUTED;
    const scoreColor = podium ? CREAM : MUTED;
    const fontWeight = podium ? "bold" : "normal";

    ctx.fillStyle = posColor;
    ctx.font = `${podium ? "bold" : "normal"} ${Math.round(ch * 0.045)}px ${PUB_FONT}`;
    ctx.fillText(`${i + 1}.`, cw * 0.06, y);

    ctx.fillStyle = nameColor;
    ctx.font = `${fontWeight} ${Math.round(ch * (podium ? 0.05 : 0.045))}px ${PUB_FONT}`;
    const name = e.name.length > 9 ? e.name.slice(0, 9) : e.name;
    ctx.fillText(name, cw * 0.2, y);

    ctx.fillStyle = scoreColor;
    ctx.font = `${fontWeight} ${Math.round(ch * (podium ? 0.055 : 0.045))}px ${PUB_FONT}`;
    ctx.textAlign = "right";
    ctx.fillText(`${e.score}`, cw * 0.93, y);
    ctx.textAlign = "left";

    if (podium) {
      ctx.fillStyle = posColor;
      ctx.fillRect(cw * 0.04, y + rowH * 0.45, cw * 0.92, 2);
    }
  }

  texture.needsUpdate = true;
}


/**
 * Live leaderboard during gameplay.
 */
const GameLeaderboard = () => {
  const { state } = useGame();
  const { t } = useTranslation();
  const lb = getLb();
  const texture = lb?.texture ?? null;
  const { entries, loading } = useTopThrows(state.leaderboardDirtyKey);

  const tTitle = useMemo(() => t("leaderboard.title"), [t]);
  const tLoading = useMemo(() => t("leaderboard.loading"), [t]);
  const tEmpty = useMemo(() => t("leaderboard.empty"), [t]);

  useEffect(() => {
    if (!lb) return;
    drawLb(lb, entries, loading, tTitle, tLoading, tEmpty);
  }, [lb, entries, loading, tTitle, tLoading, tEmpty]);

  return (
    <group>
      <mesh position={[PANEL_X, PANEL_Y, PANEL_Z - 0.002]} receiveShadow renderOrder={8}>
        <planeGeometry args={[PANEL_W + 0.06, PANEL_H + 0.06]} />
        <meshStandardMaterial color={DARK_BACK} roughness={0.85} />
      </mesh>
      <mesh position={[PANEL_X, PANEL_Y, PANEL_Z]} renderOrder={9}>
        <planeGeometry args={[PANEL_W, PANEL_H]} />
        <meshBasicMaterial
          map={texture ?? undefined}
          side={THREE.DoubleSide}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  );
}

export default GameLeaderboard;
