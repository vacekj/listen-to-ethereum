import { usePlayAudio } from "@/hooks";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNetwork } from "wagmi";

export function TxBlob(props: {
  hash: string;
  confirmed: boolean;
}) {
  const { play } = usePlayAudio();
  const { chain } = useNetwork();

  useEffect(() => {
    play(
      props.confirmed
        ? `celesta-${Math.round(stringToNumberInRange(props.hash, 1, 27))}`
        : `clav-${Math.round(stringToNumberInRange(props.hash, 1, 27))}`,
    );
  }, []);

  const color = stringToColour(props.hash);
  return (
    <motion.a
      href={`${chain?.blockExplorers?.default.url ?? "https://etherscan.io/tx/"}${props.hash}`}
      transition={{
        duration: 0.5,
        ease: "anticipate",
      }}
      exit={{
        opacity: 0,
        scale: 1.6,
      }}
      initial={{
        opacity: 0,
        scale: 0.9,
      }}
      animate={{
        opacity: props.confirmed ? 1 : 0.3,
        scale: props.confirmed ? 1.1 : 1,
      }}
      style={{
        color: "black",
        textDecoration: "none",
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
    </motion.a>
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

  return (Math.abs(hash) % (range + 1)) + min;
}
