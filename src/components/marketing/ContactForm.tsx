"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderReference, setOrderReference] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          orderReference: orderReference.trim() || undefined,
        }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setOrderReference("");
      setMessage("");
    } catch {
      setStatus("error");
      setErrorMessage(
        "Could not send your message. Email us at support@frontrowly.com instead."
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center card-shadow">
        <CheckCircle className="mx-auto h-10 w-10 text-emerald-600" />
        <h2 className="mt-4 text-xl font-semibold text-slate-900">Message sent</h2>
        <p className="mt-2 text-sm text-slate-600">
          Thanks for reaching out. We&apos;ll reply to your email within 24 hours on
          business days.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold text-sky-600 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 card-shadow sm:p-8"
    >
      <h2 className="text-xl font-semibold text-slate-900">Send a message</h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            id="contact-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            placeholder="Your name"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            placeholder="you@email.com"
            autoComplete="email"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-ref" className="text-sm font-medium text-slate-700">
          Order reference <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          id="contact-ref"
          value={orderReference}
          onChange={(e) => setOrderReference(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          placeholder="e.g. FR-ABC123"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="text-sm font-medium text-slate-700">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          placeholder="How can we help?"
        />
      </div>

      {status === "error" && errorMessage && (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
      >
        {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
        Send message
      </button>
    </form>
  );
}
