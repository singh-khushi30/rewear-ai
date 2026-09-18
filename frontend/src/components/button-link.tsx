"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { editorialEase } from "@/lib/motion";
import { cn } from "@/lib/cn";

const MotionLink = motion.create(Link);

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-olive text-ivory hover:bg-olive-muted px-6 py-3.5",
  secondary:
    "text-olive px-0 py-2 underline decoration-stone decoration-1 underline-offset-[0.45em] hover:decoration-olive",
  ghost:
    "border border-stone text-olive px-6 py-3.5 hover:border-olive",
};

export function buttonClassName(variant: Variant = "primary", className?: string) {
  return cn(
    "label inline-flex items-center justify-center transition-colors duration-500 ease-editorial disabled:pointer-events-none disabled:opacity-40",
    variantClasses[variant],
    className,
  );
}

type ButtonProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  "aria-describedby"?: string;
};

export function Button({
  variant = "primary",
  className,
  children,
  type = "button",
  disabled,
  onClick,
  ...aria
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { y: 0 }}
      transition={{ duration: 0.45, ease: editorialEase }}
      className={buttonClassName(variant, className)}
      {...aria}
    >
      {children}
    </motion.button>
  );
}

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: ButtonLinkProps) {
  return (
    <MotionLink
      href={href}
      whileHover={{ y: -1 }}
      whileTap={{ y: 0 }}
      transition={{ duration: 0.45, ease: editorialEase }}
      className={buttonClassName(variant, className)}
    >
      {children}
    </MotionLink>
  );
}
