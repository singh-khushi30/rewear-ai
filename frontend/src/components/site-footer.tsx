import { Container } from "@/components/container";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stone">
      <Container className="flex flex-col gap-8 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="label text-olive">REWEAR</p>
          <p className="text-ink/80 text-sm tracking-wide">
            Multimodal wardrobe planning
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <a
            href="https://github.com/singh-khushi30/rewear-ai"
            className="label text-olive/80 hover:text-olive motion-safe:hover:-translate-y-px transition-all duration-500"
            rel="noopener noreferrer"
            target="_blank"
            aria-label="REWEAR on GitHub (opens in a new tab)"
          >
            GitHub
          </a>
          <p className="text-olive/70 text-sm">© {year} REWEAR</p>
        </div>
      </Container>
    </footer>
  );
}
