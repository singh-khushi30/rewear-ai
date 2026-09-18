"use client";

import { motion } from "motion/react";
import { editorialEase } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function GarmentFrame({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: editorialEase }}
      className={cn(
        "bg-olive relative min-h-[22rem] min-w-0 overflow-hidden sm:min-h-[28rem] lg:min-h-[36rem]",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </motion.div>
  );
}
