"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateSpaceButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/couples", { method: "POST" });
      if (!res.ok) throw new Error(String(res.status));
      const { slug } = (await res.json()) as { slug: string };
      router.push(`/c/${slug}`);
    } catch {
      setError("La création a échoué. Réessaie dans un instant.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={create}
        disabled={busy}
        className="rounded-full bg-mine px-8 py-4 text-lg font-medium text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
      >
        {busy ? "Création…" : "Créer notre espace"}
      </button>
      <p className="text-sm text-muted">
        Pas de compte, pas d&apos;email. Un lien à garder pour vous deux.
      </p>
      {error && <p className="text-sm text-mine">{error}</p>}
    </div>
  );
}
