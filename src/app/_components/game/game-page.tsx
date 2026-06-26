"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import "@/app/_i18n/i18n";
import { GameProvider } from "./game-context";
import LocaleProvider from "@/app/_i18n/locale-provider";
import styles from "./game-page.module.css";

const GameCanvas = dynamic(() => import("./game-canvas"), { ssr: false });

export default function GamePage() {
  return (
    <GameProvider>
      <Suspense fallback={null}>
        <LocaleProvider />
      </Suspense>
      <div className={styles.app}>
        <GameCanvas />
      </div>
    </GameProvider>
  );
}