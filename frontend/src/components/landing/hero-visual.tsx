"use client";

import { motion } from "motion/react";
import { editorialEase } from "@/lib/motion";

export function HeroVisual() {
  return (
    <motion.figure
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.25, delay: 0.28, ease: editorialEase }}
      className="relative mx-auto w-full min-w-0 max-w-[34rem] lg:max-w-none"
    >
      <div className="grid min-w-0 grid-cols-[1.15fr_0.85fr] gap-3 sm:gap-4">
        <div className="bg-olive text-ivory relative flex min-h-[28rem] min-w-0 flex-col justify-between overflow-hidden p-5 sm:min-h-[34rem] sm:p-7">
          <p className="label">Look 01</p>
          <CoatSketch />
          <p className="font-serif text-3xl leading-none sm:text-4xl">
            The coat
            <span className="mt-2 block italic opacity-80">you already own</span>
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
          <div className="bg-stone text-olive flex min-h-[12.5rem] min-w-0 flex-1 flex-col justify-between p-5 sm:min-h-[15rem]">
            <p className="label">Wardrobe</p>
            <TrousersSketch />
          </div>
          <div className="bg-ivory-warm text-olive border-stone flex min-h-[12.5rem] flex-1 flex-col justify-between border p-5 sm:min-h-[15rem]">
            <p className="label">Constraint</p>
            <p className="font-serif text-[1.65rem] leading-tight sm:text-3xl">
              One trip.
              <span className="mt-1 block italic">Fewer pieces.</span>
            </p>
          </div>
        </div>
      </div>

      <figcaption className="mt-5 flex flex-col gap-3">
        <p className="label text-olive">Style what you own</p>
        <p className="label text-olive/70">
          1 piece · multiple looks · 0 impulse buys
        </p>
      </figcaption>
    </motion.figure>
  );
}

function CoatSketch() {
  return (
    <svg
      viewBox="0 0 220 280"
      className="mx-auto my-6 h-48 w-full max-w-[11rem] sm:h-56"
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M118 24c0-9-6-16-14-16"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M104 8c-2 0-6 2-6 8"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M110 24v16" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M58 46h104"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M46 78c22-20 64-26 128 0l10 168-42 18-32-22-32 22-42-18z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <path
        d="M110 58v96M110 58 84 118l26 16M110 58l26 60-26 16"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function TrousersSketch() {
  return (
    <svg
      viewBox="0 0 160 140"
      className="h-20 w-full max-w-[7rem] self-end sm:h-24"
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M48 16h64l10 108H96L80 64 64 124H38z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path d="M80 16v28" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
