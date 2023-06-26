import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import ogPlugin from "vite-plugin-open-graph";
import VitePluginRadar from "vite-plugin-radar";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    ogPlugin({
      basic: {
        title: "Listen to Ethereum",
        description: "Listen to a generative music stream of the Ethereum blockchain",
        url: "https://listen.atris.cc",
        image: "https://listen.atris.cc/hero.webp",
      },
    }),
    react(),
    tsconfigPaths(),
    VitePluginRadar({
      analytics: {
        id: "G-PGN78BN7B9",
      },
      hotjar: {
        id: 3550054,
      },
    }),
  ],
});
