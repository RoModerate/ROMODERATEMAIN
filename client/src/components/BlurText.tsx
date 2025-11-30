import { motion } from "framer-motion";
import { useMemo } from "react";

interface BlurTextProps {
  text: string;
  delay?: number;
  animateBy?: "words" | "characters";
  direction?: "top" | "bottom" | "left" | "right";
  onAnimationComplete?: () => void;
  className?: string;
}

export default function BlurText({
  text,
  delay = 150,
  animateBy = "words",
  direction = "top",
  onAnimationComplete,
  className = "",
}: BlurTextProps) {
  const segments = useMemo(() => {
    return animateBy === "words" ? text.split(" ") : text.split("");
  }, [text, animateBy]);

  const directionOffset = {
    top: { y: -20, x: 0 },
    bottom: { y: 20, x: 0 },
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
  };

  const offset = directionOffset[direction];

  return (
    <motion.div
      className={className}
      onAnimationComplete={onAnimationComplete}
    >
      {segments.map((segment, index) => (
        <motion.span
          key={index}
          initial={{
            opacity: 0,
            filter: "blur(10px)",
            ...offset,
          }}
          animate={{
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            x: 0,
          }}
          transition={{
            duration: 0.6,
            delay: (delay / 1000) * index,
            ease: [0.23, 1, 0.32, 1],
          }}
          style={{
            display: "inline-block",
            marginRight: animateBy === "words" ? "0.3em" : "0",
          }}
        >
          {segment}
        </motion.span>
      ))}
    </motion.div>
  );
}
