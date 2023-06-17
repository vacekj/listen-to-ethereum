import { useState } from "react";
import { Circle, Layer, Stage } from "react-konva";
import { Block, Hex, Transaction, TransactionReceipt } from "viem";
import { serialize, useBlockNumber, usePublicClient, useWatchPendingTransactions } from "wagmi";

export function Canvas() {
  const [txHashes, setTxHashes] = useState<Hex[]>([]);
  const [txReceipts, setTxReceipts] = useState<Transaction[]>([]);
  useWatchPendingTransactions({
    listener: async (hashes) => {
      setTxHashes([...new Set([...txHashes, ...hashes])]);
    },
  });

  const publicClient = usePublicClient();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const { data: blockNumber } = useBlockNumber({
    watch: true,
    onBlock: async (blockNumber) => {
      const block = await publicClient.getBlock({
        blockNumber: blockNumber,
      });
      for (const tx of block.transactions) {
        if (typeof tx !== "string") {
          setTxReceipts([...new Set([...txReceipts, tx])]);
        }
      }
      setBlocks([...blocks, block]);
    },
  });

  return (
    <>
      <div>
        Mempool size: {txHashes.length}
        Confirmed txs: {txReceipts.length}
        Blocknumber: {blockNumber?.toString()}
        Blocks: {blocks.length}
      </div>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {txHashes.map(hash => <TxBlob hash={hash} />)}
        </Layer>
      </Stage>
    </>
  );
}

function TxBlob(props: {
  hash: string;
}) {
  return (
    <Circle
      y={stringToNumberInRange(props.hash, 0, window.innerWidth)}
      x={stringToNumberInRange(props.hash, 0, window.innerHeight)}
      radius={50}
      fill={stringToColour(props.hash)}
    />
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
