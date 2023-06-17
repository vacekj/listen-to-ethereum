import { Box } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAudioPlayer, useGlobalAudioPlayer } from "react-use-audio-player";
import { Block, createPublicClient, Hash, Hex, http, Transaction, webSocket } from "viem";
import { mainnet, useBlockNumber, usePublicClient, useWatchPendingTransactions } from "wagmi";

const httpPublicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export function Canvas() {
  const [txHashes, setTxHashes] = useState<Hex[]>([]);
  const [txAgeMap, setTxAgeMap] = useState<Map<Hex, number>>(new Map());
  const [txReceipts, setTxReceipts] = useState<Hash[]>([]);
  useWatchPendingTransactions({
    listener: async (hashes) => {
      const newMap = txAgeMap;
      /* If transaction is seen first time, add its age to map*/
      for (const hash of hashes) {
        if (!newMap.has(hash)) {
          newMap.set(hash, Date.now());
        }
      }
      setTxAgeMap(newMap);
      setTxHashes([...new Set([...hashes, ...txHashes])]);
    },
  });

  const [blocks, setBlocks] = useState<Block[]>([]);
  const unwatch = httpPublicClient.watchBlocks(
    {
      onBlock: block => {
        // @ts-ignore
        let txReceiptStrings = block.transactions.filter((tx: Hex) => typeof tx === "string");
        setTxReceipts([
          ...new Set([...txReceipts, ...txReceiptStrings]),
        ]);
        setTxHashes([...new Set([...txHashes, ...txReceiptStrings])]);
        setBlocks([...new Set([...blocks, block])]);
      },
    },
  );

  return (
    <>
      <div>
        Mempool size: {txHashes.length}
        Confirmed txs: {txReceipts.length}
        Blocks: {blocks.length}
        <Box pos={"relative"}>
          <AnimatePresence>
            {txHashes.filter(hash => {
              return Date.now() - (txAgeMap.get(hash) ?? 0) < 20_000;
            }).map(tx => (
              <TxBlob
                key={tx}
                confirmed={txReceipts.some(receipt => receipt === tx)}
                hash={tx}
              />
            ))}
          </AnimatePresence>
        </Box>
      </div>
    </>
  );
}

function TxBlob(props: {
  hash: string;
  confirmed: boolean;
}) {
  const { load, play } = useAudioPlayer();
  useEffect(() => {
    load(
      props.confirmed
        ? `public/sounds/celesta/c${
          Math.round(stringToNumberInRange(props.hash, 0, 27)).toString().padStart(3, "0")
        }.mp3`
        : `public/sounds/clav/c${Math.round(stringToNumberInRange(props.hash, 0, 27)).toString().padStart(3, "0")}.mp3`,
    );
  }, []);

  useEffect(() => {
    play();
  }, []);

  const color = stringToColour(props.hash);
  return (
    <motion.div
      exit={{
        opacity: 0,
      }}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: props.confirmed ? 1 : 0.3,
      }}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        height: 100,
        width: 100,
        borderRadius: 50,
        background: color,
        position: "absolute",
        top: stringToNumberInRange(props.hash, 100, window.innerHeight - 200),
        left: stringToNumberInRange(props.hash, 100, window.innerWidth - 200),
      }}
    >
      {props.hash.substring(0, 9)}
    </motion.div>
  );
}

const stringToColour = function(str: string): string {
  let i;
  let hash = 0;
  for (i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = "#";
  for (i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    colour += ("00" + value.toString(16)).substr(-2);
  }
  return colour;
};

function stringToNumberInRange(input: string, min: number, max: number): number {
  // Hash the input string
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }

  // Map the hash value to the desired range
  const range = max - min;
  const scaled = (Math.abs(hash) % (range + 1)) + min;

  return scaled;
}
