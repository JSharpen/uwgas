import * as React from "react";
import { useMotionTemplate, motion } from "framer-motion";

export const Component = () => {
  const opacity = 1;
  const maskImage = useMotionTemplate`linear-gradient(to bottom, rgba(0,0,0,${opacity}), black 12px, black 100%)`;

  return (
    <motion.div
      style={{
        '--mask-image': maskImage,
        maskImage: 'var(--mask-image)',
        WebkitMaskImage: 'var(--mask-image)'
      } as React.CSSProperties & Record<string, unknown>}
    />
  );
};
