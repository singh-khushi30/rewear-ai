"use client";

import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";

const stages = [
  {
    name: "Understand",
    detail: "Read the garments already in your closet.",
  },
  {
    name: "Plan",
    detail: "Compose looks around your actual constraints.",
  },
  {
    name: "Check",
    detail: "Confirm the combination holds together.",
  },
  {
    name: "Refine",
    detail: "Repair anything that would not work.",
  },
];

export function AgentPreview() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="bg-olive text-ivory scroll-mt-24 py-20 lg:py-28"
    >
      <Container>
        <Reveal>
          <p className="label mb-5">The intelligence</p>
          <h2
            id="about-heading"
            className="font-serif text-headline max-w-3xl"
          >
            More than an outfit generator.
          </h2>
          <p className="mt-8 max-w-2xl text-[1.05rem] leading-relaxed text-ivory/80 sm:text-lg">
            REWEAR studies the clothes you already own, plans combinations around
            occasion, weather, and packing limits, then checks its own plan. If
            something would not work, it is quietly refined.
          </p>
          <p className="label mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 text-ivory">
            {stages.map((stage, index) => (
              <span key={stage.name} className="flex items-center gap-3">
                <span>{stage.name}</span>
                {index < stages.length - 1 ? (
                  <span aria-hidden="true" className="text-ivory/40">
                    →
                  </span>
                ) : null}
              </span>
            ))}
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <ol className="mt-16 grid gap-10 border-t border-ivory/20 pt-12 sm:grid-cols-2 xl:grid-cols-4 xl:gap-0">
            {stages.map((stage, index) => (
              <li
                key={stage.name}
                className={
                  index < stages.length - 1
                    ? "xl:border-ivory/20 xl:border-r xl:pr-8"
                    : ""
                }
              >
                <div className={index > 0 ? "xl:pl-8" : ""}>
                  <p className="label text-ivory/70 lining-nums">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-serif mt-4 text-3xl">{stage.name}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-ivory/75 sm:text-[0.95rem]">
                    {stage.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </section>
  );
}
