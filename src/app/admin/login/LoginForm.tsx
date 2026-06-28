"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface LoginFormProps {
  error?: string | null;
  nextPath: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: "Sign-in link expired or invalid. Request a new one.",
  not_admin: "This email is not authorized for admin access.",
  missing_code: "Invalid sign-in response. Try again.",
};

export function LoginForm({ error, nextPath }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      });

      if (signInError) {
        setLocalError(signInError.message);
        return;
      }

      setSent(true);
    } catch {
      setLocalError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const displayError =
    localError ?? (error ? ERROR_MESSAGES[error] ?? "Sign-in failed." : null);

  return (
    <div className="mx-auto w-full max-w-md">
      <Link href="/" className="text-lg font-bold">
        FRONT<span className="gold-text">ROWLY</span>
      </Link>
      <h1 className="mt-8 text-2xl font-bold">Admin sign in</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Magic link sent to your authorized admin email.
      </p>

      {sent ? (
        <div className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          Check your inbox for <strong>{email}</strong>. Click the link to open
          the admin panel.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-400">
              Admin email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="admin@frontrowly.com"
            />
          </div>

          {displayError && (
            <p className="text-sm text-red-400" role="alert">
              {displayError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-black disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send magic link"}
          </button>
        </form>
      )}

      <Link href="/" className="mt-8 inline-block text-xs text-zinc-600 hover:text-zinc-400">
        ← Back to site
      </Link>
    </div>
  );
}
