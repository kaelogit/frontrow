"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface LoginFormProps {
  error?: string | null;
  nextPath: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: "Sign-in failed. Check your email and password.",
  not_admin: "This email is not authorized for admin access.",
  missing_code: "Invalid sign-in response. Try again.",
};

export function LoginForm({ error, nextPath }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setLocalError(signInError.message);
        return;
      }

      const verify = await fetch("/api/admin/verify-session");
      const result = (await verify.json()) as { authorized?: boolean };

      if (!result.authorized) {
        await supabase.auth.signOut();
        setLocalError(ERROR_MESSAGES.not_admin);
        return;
      }

      router.push(nextPath);
      router.refresh();
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
        Sign in with your Supabase admin account (email and password).
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-400">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
            placeholder="you@frontrowly.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-400">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
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
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <Link href="/" className="mt-8 inline-block text-xs text-zinc-600 hover:text-zinc-400">
        ← Back to site
      </Link>
    </div>
  );
}
