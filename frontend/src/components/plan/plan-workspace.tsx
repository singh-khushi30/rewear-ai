"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Button, ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/components/auth/auth-provider";
import {
  PlanningError,
  planningErrorMessage,
} from "@/lib/planning/errors";
import {
  examplePrompts,
  generatePlan,
} from "@/lib/planning/generate-plan";
import { planningStages } from "@/lib/planning/stages";
import type { PlanningProgress, PlanningSuccess } from "@/lib/planning/types";
import { editorialEase } from "@/lib/motion";
import { cn } from "@/lib/cn";
import {
  listWardrobeItems,
  WardrobeError,
  type WardrobeItem,
} from "@/lib/wardrobe/garments";
import { PlanResults } from "@/components/plan/plan-results";

export function PlanWorkspace() {
  const { user, loading: authLoading } = useAuth();
  const [request, setRequest] = useState("");
  const [items, setItems] = useState<WardrobeItem[] | null>(null);
  const [wardrobeError, setWardrobeError] = useState<string | null>(null);
  const [progress, setProgress] = useState<PlanningProgress | null>(null);
  const [result, setResult] = useState<PlanningSuccess | null>(null);
  const [error, setError] = useState<PlanningError | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    let cancelled = false;

    void listWardrobeItems()
      .then((next) => {
        if (!cancelled) {
          setItems(next);
          setWardrobeError(null);
        }
      })
      .catch((caught: unknown) => {
        if (cancelled) {
          return;
        }

        setItems([]);
        setWardrobeError(
          caught instanceof WardrobeError
            ? caught.message
            : "We couldn’t open your wardrobe photographs.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const byId = new Map((items ?? []).map((item) => [item.id, item]));
  const trimmed = request.trim();

  const submit = async () => {
    if (pending || trimmed.length === 0) {
      return;
    }

    if (!user) {
      setResult(null);
      setProgress(null);
      setError(
        new PlanningError(
          planningErrorMessage("UNAUTHENTICATED"),
          "UNAUTHENTICATED",
        ),
      );
      return;
    }

    setPending(true);
    setError(null);
    setResult(null);
    setProgress(null);

    try {
      const next = await generatePlan(trimmed, {
        onProgress: setProgress,
      });
      setResult(next);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        return;
      }

      setError(
        caught instanceof PlanningError
          ? caught
          : new PlanningError(
              planningErrorMessage("PLANNING_FAILED"),
              "PLANNING_FAILED",
            ),
      );
    } finally {
      setPending(false);
      setProgress(null);
    }
  };

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-28 pb-24 lg:pt-32">
        <Container>
          <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="label text-olive">Plan</p>
            <Link
              href="/wardrobe"
              className="label text-olive/55 hover:text-olive transition-colors duration-500"
            >
              My Wardrobe
            </Link>
          </div>
          <div className="max-w-3xl">
            <h1 className="font-serif text-headline text-olive text-balance">
              Plan from what you own.
            </h1>
            <p className="text-ink mt-5 max-w-xl text-[1.05rem] leading-relaxed">
              Tell REWEAR where you’re going, what you need, or what you want to
              wear differently.
            </p>
          </div>

          <form
            className="mt-14 max-w-3xl"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <label htmlFor="planning-request" className="label text-olive">
              Brief
            </label>
            <textarea
              id="planning-request"
              value={request}
              onChange={(event) => setRequest(event.target.value)}
              rows={6}
              maxLength={1000}
              placeholder="I’m going to San Francisco for 4 days. Carry-on only. I have a work dinner and want no more than 8 pieces."
              className="border-stone text-charcoal placeholder:text-taupe mt-4 w-full resize-none border bg-transparent px-5 py-5 font-serif text-2xl leading-snug outline-none focus:border-olive"
            />

            <ul className="mt-6 flex flex-col gap-3">
              {examplePrompts.map((prompt) => (
                <li key={prompt}>
                  <button
                    type="button"
                    onClick={() => setRequest(prompt)}
                    className="text-olive/70 hover:text-olive text-left text-sm leading-relaxed transition-colors duration-500"
                  >
                    {prompt}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
              <Button type="submit" disabled={pending || trimmed.length === 0}>
                {pending ? "Planning…" : "Plan my looks"}
              </Button>
              <p className="text-olive/55 text-sm">
                Uses only garments already in your wardrobe.
              </p>
            </div>
          </form>

          {pending ? <PlanningStatus progress={progress} /> : null}

          {error ? (
            <PlanningErrorState
              error={error}
              onRetry={() => {
                void submit();
              }}
              retrying={pending}
            />
          ) : null}

          {wardrobeError && result ? (
            <p role="status" className="text-umber mt-10 text-sm">
              {wardrobeError}
            </p>
          ) : null}

          {result ? <PlanResults result={result} garments={byId} /> : null}
        </Container>
      </main>
    </>
  );
}

function PlanningStatus({ progress }: { progress: PlanningProgress | null }) {
  const currentIndex = progress?.index ?? 0;

  return (
    <section className="mt-20 max-w-xl" aria-live="polite">
      <p className="label text-olive mb-6">At work</p>
      <ol className="space-y-6">
        {planningStages.map((stage, index) => {
          const current = index === currentIndex;

          return (
            <li key={stage.id}>
              <p
                className={cn(
                  "font-serif text-2xl transition-colors duration-700 sm:text-3xl",
                  current ? "text-olive" : "text-olive/25",
                )}
              >
                {stage.label}
              </p>
              {current ? (
                <motion.span
                  aria-hidden="true"
                  className="bg-olive mt-3 block h-px origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.2, ease: editorialEase }}
                />
              ) : (
                <span className="mt-3 block h-px" />
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function PlanningErrorState({
  error,
  onRetry,
  retrying,
}: {
  error: PlanningError;
  onRetry: () => void;
  retrying: boolean;
}) {
  const title =
    error.code === "UNAUTHENTICATED"
      ? "Sign in to plan."
      : error.code === "EMPTY_WARDROBE"
        ? "Your wardrobe is still empty."
        : error.code === "UNSATISFIED_CONSTRAINTS"
          ? "Those constraints could not be met."
          : error.code === "PLANNING_UNAVAILABLE" || error.code === "NETWORK"
            ? "Planning is unavailable."
            : "The plan could not be finished.";

  return (
    <section className="mt-20 max-w-xl">
      <p className="label text-olive mb-4">Note</p>
      <h2 className="font-serif text-olive text-3xl text-balance sm:text-4xl">
        {title}
      </h2>
      <p role="alert" className="text-ink mt-5 text-[1.05rem] leading-relaxed">
        {error.message}
      </p>
      <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
        {error.code === "UNAUTHENTICATED" ? (
          <ButtonLink href="/auth/sign-in?next=/plan">Sign in</ButtonLink>
        ) : error.code === "EMPTY_WARDROBE" ? (
          <ButtonLink href="/wardrobe/new">Add a piece</ButtonLink>
        ) : (
          <Button onClick={onRetry} disabled={retrying}>
            Try again
          </Button>
        )}
        {error.code === "UNAUTHENTICATED" || error.code === "EMPTY_WARDROBE" ? (
          <ButtonLink
            href={error.code === "EMPTY_WARDROBE" ? "/wardrobe" : "/auth/sign-up?next=/plan"}
            variant="secondary"
          >
            {error.code === "EMPTY_WARDROBE" ? "Open wardrobe" : "Create an account"}
          </ButtonLink>
        ) : null}
      </div>
    </section>
  );
}

