"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import DartboardModel from "./dartboard-model";
import Darts from "./darts";
import GameHUD from "./game-hud";
import GameControls from "./game-controls";
import GameResult from "./game-result";
import GameLeaderboard from "./game-leaderboard";
import { useThree } from "@react-three/fiber";

const WALL_X_POSITIONS = [-1.4, -0.7, 0, 0.7, 1.4, 2.1];

function Wall() {
  return (
    <>
      <mesh position={[0.3, 0, -0.5]} receiveShadow>
        <planeGeometry args={[6, 3.5]} />
        <meshStandardMaterial color="#4a3018" roughness={0.7} />
      </mesh>
      {WALL_X_POSITIONS.map((x) => (
        <mesh key={x} position={[x, 0, -0.498]}>
          <boxGeometry args={[0.015, 3.4, 0.008]} />
          <meshStandardMaterial color="#3a2010" />
        </mesh>
      ))}
    </>
  );
}

function CameraFitter() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const controls = useThree((s) => s.controls) as
    | { target: THREE.Vector3; update: () => void; minDistance: number; maxDistance: number }
    | null;

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(size.height, 1);
    const fovRad = (cam.fov * Math.PI) / 180;
    const halfHeight = 1.55;
    const dV = halfHeight / Math.tan(fovRad / 2);
    const halfWidth = 1.25;
    const dH = halfWidth / (Math.tan(fovRad / 2) * Math.max(aspect, 0.1));
    const z = Math.min(Math.max(Math.max(dV, dH), 3.5), 5.5);
    cam.position.set(0, -0.05, z);
    if (controls) {
      controls.target.set(0, -0.05, 0);
      controls.update();
    }
    cam.updateProjectionMatrix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function SceneContents() {
  return (
    <>
      <fog attach="fog" args={["#2a1508", 15, 50]} />
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
      <Darts />
      <GameHUD />
      <GameControls />
      <GameLeaderboard />
      <GameResult />
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
      camera={{ fov: 50, near: 0.1, far: 20, position: [0, 0.15, 5] }}
    >
      <Suspense fallback={null}>
        <SceneContents />
      </Suspense>
      <CameraFitter />
      <OrbitControls
        makeDefault
        target={[0, -0.05, 0]}
        enableDamping
        minDistance={3}
        maxDistance={5.5}
        maxPolarAngle={Math.PI * 0.65}
        rotateSpeed={-1}
      />
    </Canvas>
  );
}