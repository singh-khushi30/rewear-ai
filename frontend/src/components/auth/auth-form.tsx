"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button-link";
import { authErrorMessage } from "@/lib/auth-errors";
import { authReasonMessage } from "@/lib/auth/reasons";
import { persistAuthSession } from "@/lib/supabase/persist-auth-session";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, safeNextPath } from "@/lib/supabase/env";

type AuthMode = "sign-in" | "sign-up";

export function AuthForm({
  mode,
  nextPath,
  reason,
}: {
  mode: AuthMode;
  nextPath: string;
  reason?: string | null;
}) {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const configured = isSupabaseConfigured();
  const [error, setError] = useState(
    authReasonMessage(reason) ??
      (configured ? null : authReasonMessage("unconfigured")),
  );
  const [confirmationSent, setConfirmationSent] = useState(false);
  const next = safeNextPath(nextPath);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!configured) {
      setError(authReasonMessage("unconfigured"));
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError(authReasonMessage("unconfigured"));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (mode === "sign-in") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError(authErrorMessage(signInError));
          return;
        }

        await persistAuthSession();
        router.replace(next);
        router.refresh();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (signUpError) {
        setError(authErrorMessage(signUpError));
        return;
      }

      if (data.user && data.user.identities?.length === 0) {
        setError("An account with that email already exists. Sign in instead.");
        return;
      }

      if (data.session) {
        await persistAuthSession();
        router.replace(next);
        router.refresh();
        return;
      }

      setConfirmationSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmationSent) {
    return (
      <div>
        <p className="label text-olive mb-4">Confirm your email</p>
        <p className="text-ink text-[1.05rem] leading-relaxed">
          We sent a confirmation link to {email.trim() || "your email"}. Open it
          to finish creating your account, then you’ll land in your wardrobe.
        </p>
        <Link
          href={`/auth/sign-in?next=${encodeURIComponent(next)}`}
          className="label text-olive mt-8 inline-flex underline decoration-stone decoration-1 underline-offset-[0.45em] hover:decoration-olive"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-8">
      <label className="block" htmlFor={emailId}>
        <span className="label text-olive/70">Email</span>
        <input
          id={emailId}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="font-serif text-olive mt-2 w-full border-0 border-b border-stone bg-transparent py-2 text-xl outline-none focus-visible:border-olive"
        />
      </label>

      <label className="block" htmlFor={passwordId}>
        <span className="label text-olive/70">Password</span>
        <input
          id={passwordId}
          type="password"
          name="password"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="font-serif text-olive mt-2 w-full border-0 border-b border-stone bg-transparent py-2 text-xl outline-none focus-visible:border-olive"
        />
      </label>

      {error ? (
        <p id={errorId} role="alert" className="text-umber text-sm">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col items-start gap-5">
        <Button type="submit" disabled={submitting || !configured}>
          {submitting
            ? mode === "sign-in"
              ? "Signing in…"
              : "Creating account…"
            : mode === "sign-in"
              ? "Sign In"
              : "Create Account"}
        </Button>

        {mode === "sign-in" ? (
          <p className="text-ink/80 text-sm">
            New to REWEAR?{" "}
            <Link
              href={`/auth/sign-up?next=${encodeURIComponent(next)}`}
              className="text-olive underline decoration-stone decoration-1 underline-offset-[0.35em] hover:decoration-olive"
            >
              Create an account
            </Link>
          </p>
        ) : (
          <p className="text-ink/80 text-sm">
            Already have an account?{" "}
            <Link
              href={`/auth/sign-in?next=${encodeURIComponent(next)}`}
              className="text-olive underline decoration-stone decoration-1 underline-offset-[0.35em] hover:decoration-olive"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}
