"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "./game-context";
import { useTranslation } from "react-i18next";

const PANEL_Z = -0.05;
const PANEL_W = 1.4;
const PANEL_H = 1.6;
const CELL = 0.105;
const GAP = 0.018;
const PUB_FONT = '"Georgia", serif';
const CREAM = "#f0e0b8";
const CRIMSON_DEEP = "#8b0000";
const DARK_BACK = "#0f0700";

const ROWS: string[][] = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

const letterTextureCache = new Map<string, THREE.CanvasTexture>();
function getLetterTexture(letter: string): THREE.CanvasTexture {
  if (typeof document === "undefined") return new THREE.CanvasTexture();
  const cached = letterTextureCache.get(letter);
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
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = CREAM;
  ctx.font = `bold 66px ${PUB_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, size / 2, size / 2 + 3);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  letterTextureCache.set(letter, tex);
  return tex;
}

function actionTexture(label: string, bg: string): THREE.CanvasTexture {
  if (typeof document === "undefined") return new THREE.CanvasTexture();
  const w = 512;
  const h = 160;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = bg;
  const r = h * 0.2;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(w, 0, w, h, r);
  ctx.arcTo(w, h, 0, h, r);
  ctx.arcTo(0, h, 0, 0, r);
  ctx.arcTo(0, 0, w, 0, r);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = CREAM;
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = CREAM;
  ctx.font = `bold 72px ${PUB_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, w / 2, h / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function KeyButton({
  texture,
  position,
  size,
  onDown,
}: {
  texture: THREE.CanvasTexture;
  position: [number, number, number];
  size: [number, number];
  onDown: () => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const flashRef = useRef(0);
  useEffect(() => () => {
    document.body.style.cursor = "";
  }, []);
  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const f = flashRef.current;
    const now = performance.now();
    if (f > now) {
      const p = (f - now) / 140;
      mesh.scale.setScalar(1 + 0.18 * p);
    } else {
      mesh.scale.setScalar(1);
    }
  });
  return (
    <mesh
      ref={ref}
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (
          e.nativeEvent &&
          typeof e.nativeEvent.stopPropagation === "function"
        ) {
          e.nativeEvent.stopPropagation();
        }
        onDown();
        flashRef.current = performance.now() + 140;
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
      renderOrder={25}
    >
      <planeGeometry args={size} />
      <meshBasicMaterial
        map={texture}
        transparent
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

let panelTexture: THREE.CanvasTexture | null = null;
function getPanelTexture(): THREE.CanvasTexture | null {
  if (panelTexture) return panelTexture;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = Math.round((1024 / PANEL_W) * PANEL_H);
  panelTexture = new THREE.CanvasTexture(canvas);
  panelTexture.colorSpace = THREE.SRGBColorSpace;
  panelTexture.anisotropy = 8;
  return panelTexture;
}

function drawPanel(
  panel: THREE.CanvasTexture,
  buffer: string,
  title: string,
) {
  const canvas = panel.image as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const cw = canvas.width;
  const ch = canvas.height;
  ctx.clearRect(0, 0, cw, ch);

  ctx.fillStyle = CREAM;
  ctx.font = `bold ${Math.round(ch * 0.06)}px ${PUB_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title, cw / 2, ch * 0.05);

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  const fieldX = cw * 0.1;
  const fieldY = ch * 0.09;
  const fieldW = cw * 0.8;
  const fieldH = ch * 0.08;
  const r = fieldH * 0.15;
  ctx.beginPath();
  ctx.moveTo(fieldX + r, fieldY);
  ctx.arcTo(fieldX + fieldW, fieldY, fieldX + fieldW, fieldY + fieldH, r);
  ctx.arcTo(fieldX + fieldW, fieldY + fieldH, fieldX, fieldY + fieldH, r);
  ctx.arcTo(fieldX, fieldY + fieldH, fieldX, fieldY, r);
  ctx.arcTo(fieldX, fieldY, fieldX + fieldW, fieldY, r);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = CREAM;
  ctx.font = `bold ${Math.round(fieldH * 0.6)}px ${PUB_FONT}`;
  ctx.fillText(
    buffer.length ? buffer : "—",
    cw / 2,
    fieldY + fieldH / 2,
  );

  panel.needsUpdate = true;
}

export default function GameKeyboard() {
  const { state, setPlayerName, closeKeypad } = useGame();
  const { t } = useTranslation();
  const [buffer, setBuffer] = useState("");
  const panel = getPanelTexture();

  const title = useMemo(() => t("keyboard.title"), [t]);
  const delLabel = useMemo(() => t("keyboard.del"), [t]);
  const confirmLabel = useMemo(() => t("keyboard.confirm"), [t]);
  const cancelLabel = useMemo(() => t("keyboard.cancel"), [t]);

  useEffect(() => {
    if (!panel) return;
    drawPanel(panel, buffer, title);
  }, [panel, buffer, title]);

  const appendChar = useCallback((c: string) => {
    setBuffer((b) => (b.length >= 12 ? b : b + c));
  }, []);
  const delChar = useCallback(() => {
    setBuffer((b) => b.slice(0, -1));
  }, []);
  const confirm = useCallback(() => {
    const trimmed = buffer.trim();
    if (trimmed) setPlayerName(trimmed.toUpperCase());
  }, [buffer, setPlayerName]);

  if (!state.keypadOpen) return null;

  const rowsTop = 0.35;
  const rowSpacing = CELL + GAP;
  const keySize: [number, number] = [CELL, CELL];
  const actionW = 0.25;
  const actionH = 0.1;

  return (
    <group>
      <mesh position={[0, 0.2, PANEL_Z - 0.005]} renderOrder={20}>
        <planeGeometry args={[PANEL_W + 0.12, PANEL_H + 0.12]} />
        <meshBasicMaterial
          color={DARK_BACK}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, 0.65, PANEL_Z + 0.001]} renderOrder={21}>
        <planeGeometry args={[PANEL_W, PANEL_H * 0.3]} />
        <meshBasicMaterial
          map={panel ?? undefined}
          transparent
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {ROWS.map((row, ri) => {
        const y = 0.2 + rowsTop - ri * rowSpacing;
        const rowWidth = row.length * CELL + (row.length - 1) * GAP;
        const xStart = -rowWidth / 2 + CELL / 2;
        return row.map((letter, li) => {
          const x = xStart + li * (CELL + GAP);
          return (
            <KeyButton
              key={`${ri}-${li}`}
              texture={getLetterTexture(letter)}
              position={[x, y, PANEL_Z + 0.002]}
              size={keySize}
              onDown={() => appendChar(letter)}
            />
          );
        });
      })}

      {/* Action row */}
      <KeyButton
        texture={actionTexture(delLabel, CRIMSON_DEEP)}
        position={[-0.22, 0.2 + rowsTop - 3 * rowSpacing - 0.01, PANEL_Z + 0.002]}
        size={[actionW, actionH]}
        onDown={delChar}
      />
      <KeyButton
        texture={actionTexture(confirmLabel, "#1f5a1f")}
        position={[0.22, 0.2 + rowsTop - 3 * rowSpacing - 0.01, PANEL_Z + 0.002]}
        size={[actionW, actionH]}
        onDown={confirm}
      />

      {/* Cancel (X) */}
      <mesh
        position={[-(PANEL_W / 2) - 0.02, PANEL_H / 2 + 0.05, PANEL_Z + 0.01]}
        onPointerDown={(e) => {
          e.stopPropagation();
          closeKeypad();
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
        renderOrder={26}
      >
        <planeGeometry args={[0.08, 0.08]} />
        <meshBasicMaterial
          map={actionTexture(cancelLabel, "#5a0000")}
          transparent
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      </group>
  );
}