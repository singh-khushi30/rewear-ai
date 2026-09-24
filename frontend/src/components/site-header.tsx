"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { Container } from "@/components/container";
import { landingNavLinks } from "@/lib/navigation";
import { cn } from "@/lib/cn";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const { user, loading, signOut } = useAuth();

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
  const navItems = user
    ? ([
        { href: "/wardrobe", label: "Wardrobe" },
        { href: "/plan", label: "Plan Looks" },
        { href: "/looks", label: "Saved Looks" },
      ] as const)
    : landingNavLinks;

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
          {navItems.map((link) => (
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
          {loading ? (
            <span className="hidden w-16 md:inline-flex" aria-hidden="true" />
          ) : user ? (
            <button
              type="button"
              onClick={() => {
                void signOut();
              }}
              className="label text-olive/80 hover:text-olive hidden transition-colors duration-500 md:inline-flex"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/auth/sign-in"
              className="label text-olive/80 hover:text-olive hidden transition-colors duration-500 md:inline-flex"
            >
              Sign In
            </Link>
          )}

          <Link
            href={user ? "/wardrobe/new" : "/auth/sign-in?next=/wardrobe/new"}
            className="label bg-olive text-ivory motion-safe:hover:-translate-y-px hidden px-5 py-2.5 transition-all duration-500 ease-editorial hover:bg-olive-muted md:inline-flex"
          >
            {user ? "Add a Piece" : "Start Styling"}
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
                {navItems.map((link) => (
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
            {user ? (
              <button
                type="button"
                className="label text-olive w-fit"
                onClick={() => {
                  closeMenu();
                  void signOut();
                }}
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/auth/sign-in"
                onClick={closeMenu}
                className="label text-olive w-fit"
              >
                Sign In
              </Link>
            )}
            <Link
              href={user ? "/wardrobe/new" : "/auth/sign-in?next=/wardrobe/new"}
              onClick={closeMenu}
              className="label bg-olive text-ivory inline-flex w-fit px-5 py-3"
            >
              {user ? "Add a Piece" : "Start Styling"}
            </Link>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
