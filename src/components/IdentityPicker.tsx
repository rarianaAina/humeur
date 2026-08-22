"use client";

import type { CoupleView, Partner } from "@/lib/types";

/** Premier écran sur un nouvel appareil : qui tient ce téléphone ? */
export function IdentityPicker({
  view,
  onPick,
}: {
  view: CoupleView;
  onPick: (partner: Partner) => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 px-6 py-16">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Qui es-tu&nbsp;?
        </h1>
        <p className="text-muted">
          On te le demande une seule fois sur cet appareil.
        </p>
      </header>

      <div className="space-y-3">
        {(["a", "b"] as Partner[]).map((partner) => (
          <button
            key={partner}
            type="button"
            onClick={() => onPick(partner)}
            className="w-full rounded-2xl border border-line bg-card px-5 py-5 text-lg font-medium transition hover:border-mine hover:bg-mine-soft"
          >
            {view.names[partner]}
          </button>
        ))}
      </div>

      <p className="text-center text-xs leading-relaxed text-muted">
        Vous pourrez mettre vos prénoms juste après.
      </p>
    </main>
  );
}
