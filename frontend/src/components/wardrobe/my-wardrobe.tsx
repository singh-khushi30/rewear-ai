"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { useAuth } from "@/components/auth/auth-provider";
import {
  deleteGarment,
  listWardrobeItems,
  WardrobeError,
  type WardrobeItem,
} from "@/lib/wardrobe/garments";

export function MyWardrobe({
  initialItems,
  initialError,
}: {
  initialItems: WardrobeItem[] | null;
  initialError: string | null;
}) {
  const { signOut } = useAuth();
  const [items, setItems] = useState<WardrobeItem[] | null>(initialItems);
  const [error, setError] = useState<string | null>(initialError);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WardrobeItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setError(null);
    setItems(null);

    try {
      const nextItems = await listWardrobeItems();
      setItems(nextItems);
    } catch (caught) {
      setItems(null);
      setError(
        caught instanceof WardrobeError
          ? caught.message
          : "We couldn’t load your wardrobe. Try again shortly.",
      );
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete || deleting) {
      return;
    }

    setDeleting(true);
    setNotice(null);

    try {
      await deleteGarment(pendingDelete);
      setItems((current) =>
        current
          ? current.filter((item) => item.id !== pendingDelete.id)
          : current,
      );
      setPendingDelete(null);
    } catch (caught) {
      const message =
        caught instanceof WardrobeError
          ? caught.message
          : "We couldn’t remove that piece. Try again.";

      if (
        caught instanceof WardrobeError &&
        message.includes("photograph could not be deleted")
      ) {
        setItems((current) =>
          current
            ? current.filter((item) => item.id !== pendingDelete.id)
            : current,
        );
        setPendingDelete(null);
        setNotice(message);
      } else {
        setNotice(message);
      }
    } finally {
      setDeleting(false);
    }
  };

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
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => {
                void signOut();
              }}
              className="label text-olive/70 hover:text-olive hidden transition-colors duration-500 sm:inline-flex"
            >
              Sign out
            </button>
            <Link
              href="/wardrobe/new"
              className="label bg-olive text-ivory motion-safe:hover:-translate-y-px px-5 py-2.5 transition-all duration-500 hover:bg-olive-muted"
            >
              Add a Piece
            </Link>
          </div>
        </Container>
      </header>

      <Container className="pt-14 pb-24 lg:pt-20">
        <p className="label text-olive mb-5">Wardrobe</p>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-serif text-headline text-olive text-balance">
              My Wardrobe
            </h1>
            <p className="text-ink mt-5 max-w-md text-[1.05rem] leading-relaxed">
              The pieces REWEAR can plan with.
            </p>
          </div>
          <ButtonLink href="/wardrobe/new" className="hidden lg:inline-flex">
            Add a Piece
          </ButtonLink>
        </div>

        {notice ? (
          <p role="status" className="text-umber mt-8 text-sm">
            {notice}
          </p>
        ) : null}

        {error ? (
          <div className="mt-16 max-w-lg">
            <p role="alert" className="text-ink text-[1.05rem] leading-relaxed">
              {error}
            </p>
            <div className="mt-8">
              <Button
                onClick={() => {
                  void load();
                }}
              >
                Try again
              </Button>
            </div>
          </div>
        ) : null}

        {!error && items === null ? (
          <p className="text-olive/70 mt-16 text-lg" aria-live="polite">
            Opening your wardrobe.
          </p>
        ) : null}

        {!error && items && items.length === 0 ? (
          <div className="mt-20 max-w-lg">
            <h2 className="font-serif text-olive text-3xl text-balance sm:text-4xl">
              Your wardrobe starts with one piece.
            </h2>
            <p className="text-ink mt-5 text-[1.05rem] leading-relaxed">
              Add a clear photograph of something you already own. REWEAR will
              keep it here for later planning.
            </p>
            <div className="mt-10">
              <ButtonLink href="/wardrobe/new">Add a Piece</ButtonLink>
            </div>
          </div>
        ) : null}

        {!error && items && items.length > 0 ? (
          <ul className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <li key={item.id} className="min-w-0">
                <article>
                  <div className="bg-olive relative aspect-[3/4] overflow-hidden">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={`${item.primary_color} ${item.category}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-end p-6">
                        <p className="label text-ivory/70">
                          Photograph unavailable
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-5">
                    <h2 className="font-serif text-olive text-2xl capitalize">
                      {item.category}
                    </h2>
                    <p className="text-ink mt-2 text-sm leading-relaxed">
                      {item.primary_color}
                      {item.material ? ` · ${item.material}` : ""}
                      {item.formality ? ` · ${item.formality}` : ""}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setNotice(null);
                        setPendingDelete(item);
                      }}
                      className="label text-olive/60 hover:text-olive mt-4 transition-colors duration-500"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : null}

        <button
          type="button"
          onClick={() => {
            void signOut();
          }}
          className="label text-olive/70 hover:text-olive mt-16 inline-flex transition-colors duration-500 sm:hidden"
        >
          Sign out
        </button>
      </Container>

      {pendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-olive/45 px-5">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-garment-title"
            className="bg-ivory w-full max-w-md px-8 py-10 shadow-quiet"
          >
            <p className="label text-olive mb-4">Remove</p>
            <h2
              id="remove-garment-title"
              className="font-serif text-olive text-3xl text-balance"
            >
              Remove this piece?
            </h2>
            <p className="text-ink mt-4 text-[1.05rem] leading-relaxed">
              This deletes the garment and its photograph from your wardrobe.
            </p>
            <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
              <Button onClick={() => void confirmDelete()} disabled={deleting}>
                {deleting ? "Removing…" : "Remove"}
              </Button>
              <Button
                variant="secondary"
                disabled={deleting}
                onClick={() => setPendingDelete(null)}
              >
                Keep it
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
