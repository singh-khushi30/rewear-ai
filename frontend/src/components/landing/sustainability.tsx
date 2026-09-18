"use client";

import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";

export function Sustainability() {
  return (
    <section
      aria-labelledby="sustainability-heading"
      className="py-24 lg:py-36"
    >
      <Container>
        <Reveal>
          <p className="label text-olive mb-8">The shift</p>
          <h2
            id="sustainability-heading"
            className="font-serif text-display text-olive max-w-5xl text-balance"
          >
            More combinations.
            <span className="mt-2 block italic">Fewer unnecessary additions.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="label text-olive mt-16 flex flex-col gap-4 border-t border-stone pt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <span>Your closet</span>
            <span aria-hidden="true" className="text-taupe hidden sm:inline">
              →
            </span>
            <span>More possibilities</span>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
