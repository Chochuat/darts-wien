"use client";

import dynamic from "next/dynamic";
import { GameProvider } from "./game-context";
import styles from "./game-page.module.css";

const GameCanvas = dynamic(() => import("./game-canvas"), { ssr: false });

export default function GamePage() {
  return (
    <GameProvider>
      <div className={styles.app}>
        <GameCanvas />
      </div>
    </GameProvider>
  );
}