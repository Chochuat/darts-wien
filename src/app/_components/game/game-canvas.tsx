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

const Wall = () => {
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

const CameraFitter = () => {
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

const SceneContents = () => {
  return (
    <>
      <fog args={["#2a1508", 15, 50]} attach="fog" />
      <ambientLight color="#3a2010" intensity={2.5} />
      <directionalLight
        castShadow
        color="#f5deb3"
        intensity={8}
        position={[1, 2, 3]}
        shadow-camera-far={15}
        shadow-camera-near={0.3}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
      />
      <pointLight color="#d4a852" intensity={10} position={[-1, 0.5, 1.5]} />
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

const GameCanvas = () => {
  return (
    <Canvas
      camera={{ fov: 50, near: 0.1, far: 20, position: [0, 0.15, 5] }}
      gl={{
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.3,
      }}
      shadows="percentage"
    >
      <Suspense fallback={null}>
        <SceneContents />
      </Suspense>
      <CameraFitter />
      <OrbitControls
        enableDamping
        makeDefault
        maxDistance={5.5}
        maxPolarAngle={Math.PI * 0.65}
        minDistance={3}
        rotateSpeed={-1}
        target={[0, -0.05, 0]}
      />
    </Canvas>
  );
}

export default GameCanvas;
