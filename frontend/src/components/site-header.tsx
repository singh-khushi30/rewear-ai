"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/container";
import { navLinks } from "@/lib/navigation";
import { cn } from "@/lib/cn";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500 ease-editorial",
        scrolled || menuOpen
          ? "border-b border-stone bg-ivory"
          : "border-b border-transparent bg-ivory/0",
      )}
    >
      <Container className="grid h-16 grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr] lg:h-[4.75rem]">
        <Link
          href="/"
          className="label text-olive motion-safe:hover:-translate-y-px justify-self-start transition-all duration-500 hover:opacity-70"
          aria-label="REWEAR home"
        >
          REWEAR
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-8 md:flex lg:gap-10"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="label text-olive/80 motion-safe:hover:-translate-y-px transition-all duration-500 ease-editorial hover:text-olive"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-5">
          <Link
            href="/wardrobe/new"
            className="label bg-olive text-ivory motion-safe:hover:-translate-y-px hidden px-5 py-2.5 transition-all duration-500 ease-editorial hover:bg-olive-muted md:inline-flex"
          >
            Start Styling
          </Link>

          <button
            type="button"
            className="label text-olive md:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? menuId : undefined}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </Container>

      {menuOpen ? (
        <div
          id={menuId}
          className="border-t border-stone bg-ivory md:hidden"
        >
          <Container className="flex flex-col gap-6 py-8">
            <nav aria-label="Mobile">
              <ul className="flex flex-col gap-5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className="label text-olive"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <Link
              href="/wardrobe/new"
              onClick={closeMenu}
              className="label bg-olive text-ivory inline-flex w-fit px-5 py-3"
            >
              Start Styling
            </Link>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
