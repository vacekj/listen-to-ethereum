import { useAudioEnabled, useVolumeStore } from "@/hooks";
import { TxBlob } from "@/TxBlob";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { ActionIcon, Box, Container, Flex, Group, Header, Slider, Title, useMantineColorScheme } from "@mantine/core";
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useAudioPlayer } from "react-use-audio-player";
import { Block, createPublicClient, Hash, Hex, http } from "viem";
import { mainnet, useWatchPendingTransactions } from "wagmi";

const httpPublicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export function Canvas() {
  const { load, play } = useAudioPlayer();
  const audioEnabled = useAudioEnabled();
  const { volume, setVolume } = useVolumeStore();

  useEffect(() => {
    load("/sounds/swells/swell1.mp3");
  }, []);

  const [txHashes, setTxHashes] = useState<Hex[]>([]);
  const [txAgeMap, setTxAgeMap] = useState<Map<Hex, number>>(new Map());
  const [txSoundSet, setTxSoundSet] = useState<Set<Hex>>(new Set());
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

      const newSoundSet = txSoundSet;
      /* If transaction is added after sound has been enabled, set as canPlaySound */
      for (const hash of hashes) {
        if (audioEnabled) {
          newSoundSet.add(hash);
        }
      }
      setTxSoundSet(newSoundSet);

      setTxHashes([...new Set([...hashes, ...txHashes])]);
    },
  });

  const [blocks, setBlocks] = useState<Block[]>([]);

  const onBlock = useCallback(
    (block: Block) => {
      if (audioEnabled) {
        play();
      }

      setTxReceipts((prevReceipts) => [
        // @ts-ignore
        ...new Set([...prevReceipts, ...block.transactions.filter((tx: Hex) => typeof tx === "string")]),
      ]);

      setTxHashes((prevHashes) => [
        // @ts-ignore
        ...new Set([...prevHashes, ...block.transactions.filter((tx: Hex) => typeof tx === "string")]),
      ]);
      setBlocks((blocks) => [...new Set([...blocks, block])]);
    },
    [txReceipts, txHashes, blocks, audioEnabled],
  );

  useEffect(() => {
    const unwatch = httpPublicClient.watchBlocks(
      {
        onBlock,
      },
    );

    return () => {
      unwatch();
    };
  }, [httpPublicClient, audioEnabled]);

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  return (
    <>
      <Header height={"content"}>
        <Container>
          <Flex align={"center"} justify={"space-between"} p={10}>
            <Title order={3}>Listen to Ethereum</Title>
            <Group>
              Volume
              <Slider min={0} max={100} w={"10rem"} value={volume} onChange={setVolume} />
            </Group>
            <ActionIcon onClick={() => toggleColorScheme()} color={colorScheme} size="lg" variant="subtle">
              {colorScheme === "dark" ? <MoonIcon /> : <SunIcon />}
            </ActionIcon>
          </Flex>
        </Container>
      </Header>
      <div>
        <Box pos={"relative"}>
          <AnimatePresence>
            {txHashes.filter(hash => {
              return Date.now() - (txAgeMap.get(hash) ?? 0) < 12_000;
            }).map(tx => (
              <TxBlob
                shouldPlaySounds={txSoundSet.has(tx)}
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
