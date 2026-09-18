"use client";

import { motion } from "motion/react";
import { editorialEase } from "@/lib/motion";
import { cn } from "@/lib/cn";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: ButtonLinkProps) {
  return (
    <motion.a
      href={href}
      whileHover={{ y: -1 }}
      whileTap={{ y: 0 }}
      transition={{ duration: 0.45, ease: editorialEase }}
      className={cn(
        "label inline-flex items-center justify-center px-6 py-3.5 transition-colors duration-500 ease-editorial",
        variant === "primary" &&
          "bg-olive text-ivory hover:bg-olive-muted",
        variant === "secondary" &&
          "text-olive px-0 py-2 underline decoration-stone decoration-1 underline-offset-[0.45em] hover:decoration-olive",
        className,
      )}
    >
      {children}
    </motion.a>
  );
}
