import { Box, Container, Flex } from "@mantine/core";
import { motion } from "framer-motion";
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
  return (
    <ThemeProvider>
      <WagmiConfig config={config}>
        <Canvas />
      </WagmiConfig>
    </ThemeProvider>
  );
}
