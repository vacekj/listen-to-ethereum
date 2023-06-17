import { useState } from "react";
import { createPublicClient, Hex, http, webSocket } from "viem";
import { createConfig, mainnet, useBlockNumber, useWatchPendingTransactions, WagmiConfig } from "wagmi";
import { ThemeProvider } from "./ThemeProvider";

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: webSocket("wss://mainnet.infura.io/ws/v3/dca3b3f8ffa84b8c99987faf694cde1f"),
  }),
});

export default function App() {
  const [txHashes, setTxHashes] = useState<Hex[]>([]);
  useWatchPendingTransactions({
    listener: (hashes) => {
      // setTxHashes([...new Set([...txHashes, ...hashes])]);
      /* display a new tx hash blob */

      /* wait for transaction and change blob to tx blob (change size based on value / data size if no value) */

      /* wait for transaction receipt (confirmation) and change to receipt blob */
    },
  });

  const { data: blockNumber } = useBlockNumber({});

  return (
    <ThemeProvider>
      <WagmiConfig config={config}>
        <>
          Mempool size: {txHashes.length}
          Blocknumber: {blockNumber}
        </>
      </WagmiConfig>
    </ThemeProvider>
  );
}
