import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import VitePluginRadar from "vite-plugin-radar";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
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
