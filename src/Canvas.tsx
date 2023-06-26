import { usePlayAudio, useVolumeStore } from "@/hooks";
import { stringToNumberInRange, TxBlob } from "@/TxBlob";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import {
  ActionIcon,
  Box,
  Container,
  Flex,
  Group,
  Header,
  Slider,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Block, createPublicClient, Hash, Hex, http } from "viem";
import { mainnet, useWatchPendingTransactions } from "wagmi";

const httpPublicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export function Canvas() {
  const { play } = usePlayAudio();
  const { volume, setVolume } = useVolumeStore();

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
        newSoundSet.add(hash);
      }
      setTxSoundSet(newSoundSet);

      setTxHashes([...new Set([...hashes, ...txHashes])]);
    },
  });

  const [blocks, setBlocks] = useState<Block[]>([]);

  const onBlock = useCallback(
    (block: Block) => {
      play(`swell-${Math.round(stringToNumberInRange(block.transactionsRoot, 1, 3))}`);

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
    [txReceipts, txHashes, blocks],
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
  }, [httpPublicClient]);

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  return (
    <>
      <Stack h={"100vh"}>
        <Header height={"content"}>
          <Container>
            <Flex align={"center"} justify={"space-between"} p={10}>
              <Title order={3}>Listen to Ethereum</Title>
              <Group>
                Volume
                <Slider
                  min={0}
                  max={100}
                  w={"10rem"}
                  label={(value) => value.toFixed(0)}
                  value={volume * 100}
                  onChange={setVolume}
                />
              </Group>
              <ActionIcon onClick={() => toggleColorScheme()} color={colorScheme} size="lg" variant="subtle">
                {/*TODO: read an sync color scheme from browser*/}
                {colorScheme === "dark" ? <MoonIcon /> : <SunIcon />}
              </ActionIcon>
            </Flex>
          </Container>
        </Header>
        <Box pos={"relative"} h={"100%"}>
          <AnimatePresence>
            {txHashes.filter(hash => {
              return Date.now() - (txAgeMap.get(hash) ?? 0) < 12_000;
            }).map(tx => (
              <TxBlob
                key={tx}
                confirmed={txReceipts.some(receipt => receipt === tx)}
                hash={tx}
              />
            ))}
          </AnimatePresence>
        </Box>
      </Stack>
      <Container>
        <Title my={24} order={3}>
          Listen to Ethereum is an experiment in generating music from blockchain activity.
        </Title>
        <Text>
          It is inspired by{" "}
          <a href={"https://listen.hatnote.com"} target={"_blank"}>Listen to Wikipedia</a>. Each transaction that comes
          to the mempool is represented as a blob. When it gets included in a block, it grows in size and becomes solid.
          A note is played for each transaction and block that appears.
        </Text>
      </Container>
    </>
  );
}
