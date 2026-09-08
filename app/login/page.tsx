"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
      return;
    }
    setStatus("sent");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Pivot</h1>
          <p className="text-sm text-neutral-500">
            Adaptive, zero-guilt habit tracking.
          </p>
        </div>

        {status === "sent" ? (
          <p className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            Check <span className="font-medium">{email}</span> for a sign-in link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {status === "sending" ? "Sending…" : "Send sign-in link"}
            </button>
            {status === "error" && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
