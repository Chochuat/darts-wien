"use client";

import dynamic from "next/dynamic";
import { GameProvider } from "./game-context";
import GameUI from "./game-ui";
import styles from "./game-page.module.css";

const GameCanvas = dynamic(() => import("./game-canvas"), { ssr: false });

export default function GamePage() {
  return (
    <GameProvider>
      <div className={styles.app}>
        <div className={styles.view}>
          <div className={styles.hint}>
            Drag to orbit &nbsp;·&nbsp; Scroll to zoom
          </div>
          <GameCanvas />
        </div>
        <div className={styles.ui}>
          <GameUI />
        </div>
      </div>
    </GameProvider>
  );
}