"use client";

import { motion } from "motion/react";
import { editorialEase } from "@/lib/motion";
import { cn } from "@/lib/cn";

type OptionChipProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
  role?: "checkbox" | "radio";
};

export function OptionChip({
  label,
  selected,
  onClick,
  role = "checkbox",
}: OptionChipProps) {
  return (
    <motion.button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      whileTap={{ y: 0 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.4, ease: editorialEase }}
      className={cn(
        "label border px-4 py-3 text-left transition-colors duration-500 ease-editorial",
        selected
          ? "border-olive bg-olive text-ivory"
          : "border-stone text-olive hover:border-olive",
      )}
    >
      {label}
    </motion.button>
  );
}
