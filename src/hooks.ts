import * as _ from "lodash";
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
        volume: 0.3,
        setVolume: (to) => set((state) => ({ volume: to / 100 })),
      }),
      {
        name: "volume-storage",
      },
    ),
  ),
);

const sounds = new Map<string, HTMLAudioElement>();
Array(27).fill(null).forEach((_, i) => {
  sounds.set(`celesta-${i + 1}`, new Audio(`/sounds/celesta/c${i.toString().padStart(3, "0")}.mp3`));
  sounds.set(`clav-${i + 1}`, new Audio(`/sounds/clav/c${i.toString().padStart(3, "0")}.mp3`));
});
Array(3).fill(null).forEach((_, i) => {
  sounds.set(`swell-${i + 1}`, new Audio(`/sounds/swells/swell${i.toString()}.mp3`));
});
const debouncedPlay = _.throttle((sound: string) => {
  console.log(`playing ${sound}`);
  const audio = sounds.get(sound);
  audio?.play();
}, 50);

export function usePlayAudio() {
  useEffect(() => {
    const unsub = useVolumeStore.subscribe((state) => {
      sounds.forEach(audio => audio.volume = state.volume);
    });
    return () => {
      unsub();
    };
  }, []);

  return {
    play: (sound: string) => debouncedPlay(sound),
  };
}

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
