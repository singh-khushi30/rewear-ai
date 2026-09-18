"use client";

import { motion } from "motion/react";
import { editorialEase, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.9, ease: editorialEase, delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
