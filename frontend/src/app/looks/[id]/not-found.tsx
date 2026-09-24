import Link from "next/link";
import { Container } from "@/components/container";
import { SiteHeader } from "@/components/site-header";

export default function SavedLookNotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-28 pb-24 lg:pt-32">
        <Container>
          <p className="label text-olive mb-4">Note</p>
          <h1 className="font-serif text-olive text-3xl text-balance sm:text-4xl">
            That look is no longer saved.
          </h1>
          <p className="text-ink mt-5 max-w-md text-[1.05rem] leading-relaxed">
            It may have been removed, or it never belonged to this wardrobe.
          </p>
          <Link
            href="/looks"
            className="label text-olive mt-10 inline-flex transition-colors duration-500"
          >
            Back to saved looks
          </Link>
        </Container>
      </main>
    </>
  );
}
