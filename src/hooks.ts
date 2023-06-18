import { useEffect, useState } from "react";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface BearState {
  volume: number;
  setVolume: (to: number) => void;
}

export const useVolumeStore = create<BearState>()(
  devtools(
    persist(
      (set) => ({
        volume: 0,
        setVolume: (to) => set((state) => ({ volume: to })),
      }),
      {
        name: "volume-storage",
      },
    ),
  ),
);

export function useAudioEnabled(): boolean {
  const [hasClickedPage, setHasClickedPage] = useState(false);
  useEffect(() => {
    document.addEventListener("mousedown", () => setHasClickedPage(true));
    return () => {
      document.removeEventListener("mousedown", () => setHasClickedPage(true));
    };
  }, []);

  return hasClickedPage;
}
