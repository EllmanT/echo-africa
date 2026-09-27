"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [next, setNext] = useState("/admin");

  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("next");
    if (n) setNext(n);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Something went wrong");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <Image src="/eka-wordmark.png" alt="Eka" width={760} height={255} className="mx-auto h-9 w-auto" />
        <form onSubmit={onSubmit} className="mt-10 rounded-2xl border border-black/[0.08] bg-white p-7 shadow-sm">
          <h1 className="font-display text-xl font-bold tracking-tight">Admin login</h1>
          <p className="mt-1 text-sm text-muted-foreground">For the owner only.</p>

          <label htmlFor="password" className="mt-6 block text-sm font-semibold">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-black/[0.12] bg-white px-4 text-base focus-visible:border-purple focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple/15"
          />

          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !password}
            className="mt-6 h-11 w-full rounded-full bg-foreground text-sm font-medium text-background transition-colors duration-200 hover:bg-purple disabled:opacity-50"
          >
            {busy ? "Checking..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
