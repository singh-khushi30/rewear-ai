import Link from "next/link";
import { Container } from "@/components/container";

export function AuthScreen({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh">
      <header className="border-b border-stone bg-ivory">
        <Container className="flex h-16 items-center justify-between lg:h-[4.75rem]">
          <Link
            href="/"
            className="label text-olive motion-safe:hover:-translate-y-px transition-all duration-500"
            aria-label="REWEAR home"
          >
            REWEAR
          </Link>
          <Link
            href="/"
            className="label text-olive/70 hover:text-olive transition-colors duration-500"
          >
            Close
          </Link>
        </Container>
      </header>

      <Container className="grid min-h-[calc(100svh-4.75rem)] items-center py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)] lg:gap-20">
        <div className="max-w-xl">
          <p className="label text-olive mb-5">{eyebrow}</p>
          <h1 className="font-serif text-headline text-olive text-balance">
            {title}
          </h1>
          <p className="text-ink mt-6 max-w-md text-[1.05rem] leading-relaxed">
            {description}
          </p>
        </div>
        <div className="mt-12 max-w-md lg:mt-0 lg:justify-self-end lg:w-full">
          {children}
        </div>
      </Container>
    </div>
  );
}
