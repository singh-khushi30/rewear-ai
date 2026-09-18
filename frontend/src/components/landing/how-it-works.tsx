"use client";

import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";

const steps = [
  {
    number: "01",
    title: "Show us your wardrobe",
    body: "Upload photos of clothes you already own.",
  },
  {
    number: "02",
    title: "Tell us the plan",
    body: "Give REWEAR the occasion, weather, trip length, style, or packing constraints.",
  },
  {
    number: "03",
    title: "Wear more. Buy less.",
    body: "REWEAR builds combinations from your existing wardrobe and checks that the plan actually works.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="scroll-mt-24 py-20 lg:py-28"
    >
      <Container>
        <Reveal>
          <p className="label text-olive mb-4">The method</p>
          <h2
            id="how-it-works-heading"
            className="font-serif text-headline text-olive max-w-xl"
          >
            How it works
          </h2>
        </Reveal>

        <ol className="mt-16 grid gap-12 border-t border-stone pt-12 lg:grid-cols-3 lg:gap-0">
          {steps.map((step, index) => (
            <li
              key={step.number}
              className={
                index < steps.length - 1
                  ? "lg:border-stone lg:border-r lg:pr-10 xl:pr-14"
                  : ""
              }
            >
              <Reveal delay={0.08 * index} className={index > 0 ? "lg:pl-10 xl:pl-14" : ""}>
                <p className="font-serif text-olive/45 text-5xl lining-nums tabular-nums">{step.number}</p>
                <h3 className="font-serif text-olive mt-6 text-[1.85rem] leading-tight">
                  {step.title}
                </h3>
                <p className="text-ink mt-4 max-w-sm text-[1.02rem] leading-relaxed">
                  {step.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
