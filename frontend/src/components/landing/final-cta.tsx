"use client";

import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";

export function FinalCta() {
  return (
    <section
      id="wardrobe"
      aria-labelledby="wardrobe-heading"
      className="scroll-mt-24 pb-24 lg:pb-32"
    >
      <Container>
        <Reveal>
          <div className="pt-16 text-center lg:pt-20">
            <h2
              id="wardrobe-heading"
              className="font-serif text-headline text-olive mx-auto max-w-3xl"
            >
              Start with what you already have.
            </h2>
            <div className="mt-10">
              <ButtonLink href="#wardrobe">Build My Wardrobe</ButtonLink>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
