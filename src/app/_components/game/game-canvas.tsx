"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import DartboardModel from "./dartboard-model";
import Darts from "./darts";
import GameHUD from "./game-hud";
import { useGame } from "./game-context";

const WALL_X_POSITIONS = [-1.4, -0.7, 0, 0.7, 1.4];

function Wall() {
  return (
    <>
      <mesh position={[0, 0, -0.5]} receiveShadow>
        <planeGeometry args={[4, 3.5]} />
        <meshStandardMaterial color="#4a3018" roughness={0.7} />
      </mesh>
      {WALL_X_POSITIONS.map((x) => (
        <mesh key={x} position={[x, 0, -0.495]}>
          <boxGeometry args={[0.015, 3.4, 0.01]} />
          <meshStandardMaterial color="#3a2010" />
        </mesh>
      ))}
    </>
  );
}

function SceneContents() {
  const { state } = useGame();
  return (
    <>
      <fog attach="fog" args={["#2a1508", 2, 10]} />
      <ambientLight intensity={2.5} color="#3a2010" />
      <directionalLight
        position={[1, 2, 3]}
        intensity={8}
        color="#f5deb3"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.3}
        shadow-camera-far={15}
      />
      <pointLight position={[-1, 0.5, 1.5]} intensity={10} color="#d4a852" />
      <Wall />
      <DartboardModel />
      <Darts key={state.roundKey} outcomes={state.outcomes} />
      <GameHUD />
    </>
  );
}

export default function GameCanvas() {
  return (
    <Canvas
      shadows="percentage"
      gl={{
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.3,
      }}
      camera={{ fov: 55, near: 0.1, far: 20, position: [0.35, 0.15, 3.8] }}
    >
      <Suspense fallback={null}>
        <SceneContents />
      </Suspense>
      <OrbitControls
        makeDefault
        target={[0.35, 0.15, 0]}
        enableDamping
        minDistance={1.6}
        maxDistance={7}
        maxPolarAngle={Math.PI * 0.65}
      />
    </Canvas>
  );
}