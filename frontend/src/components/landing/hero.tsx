"use client";

import { motion } from "motion/react";
import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { HeroVisual } from "@/components/landing/hero-visual";
import { editorialEase, stagger } from "@/lib/motion";

const headline = [
  { text: "Your closet has", italic: false },
  { text: "more outfits", italic: false },
  { text: "than you think.", italic: true },
];

export function Hero() {
  return (
    <section
      id="top"
      className="pt-28 pb-20 lg:flex lg:min-h-svh lg:items-center lg:pt-24 lg:pb-16"
    >
      <Container className="grid min-w-0 items-center gap-16 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-10 lg:gap-12 xl:gap-20">
        <div className="min-w-0">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: editorialEase }}
            className="label text-olive mb-7"
          >
            Style what you own
          </motion.p>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="font-serif text-display text-olive text-balance"
          >
            {headline.map((line) => (
              <span key={line.text} className="block overflow-hidden">
                <motion.span
                  variants={{
                    hidden: { y: "100%", opacity: 0 },
                    visible: {
                      y: "0%",
                      opacity: 1,
                      transition: { duration: 1.05, ease: editorialEase },
                    },
                  }}
                  className={line.italic ? "block italic" : "block"}
                >
                  {line.text}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease: editorialEase }}
            className="text-ink mt-8 max-w-md text-[1.05rem] leading-relaxed sm:text-lg"
          >
            Upload what you already own. REWEAR understands your wardrobe and
            plans new ways to wear it around your life.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75, ease: editorialEase }}
            className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8"
          >
            <ButtonLink href="#wardrobe">Rewear My Closet</ButtonLink>
            <ButtonLink href="#how-it-works" variant="secondary">
              See how it works
            </ButtonLink>
          </motion.div>
        </div>

        <HeroVisual />
      </Container>
    </section>
  );
}
