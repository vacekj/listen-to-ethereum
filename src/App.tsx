import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { Analytics } from "@vercel/analytics/react";
import { useState } from "react";
import { createPublicClient, Hex, http, webSocket } from "viem";
import { createConfig, mainnet, useBlockNumber, useWatchPendingTransactions, WagmiConfig } from "wagmi";
import { Canvas } from "./Canvas";
import { ThemeProvider } from "./ThemeProvider";

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: webSocket("wss://mainnet.infura.io/ws/v3/dca3b3f8ffa84b8c99987faf694cde1f"),
  }),
});

export default function App() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  return (
    <ThemeProvider>
      <Analytics />
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
          <WagmiConfig config={config}>
            <Canvas />
          </WagmiConfig>
        </MantineProvider>
      </ColorSchemeProvider>
    </ThemeProvider>
  );
}
