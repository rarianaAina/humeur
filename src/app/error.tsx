"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        Quelque chose a coincé
      </h1>
      <p className="leading-relaxed text-muted">
        L&apos;espace n&apos;a pas pu être chargé. C&apos;est souvent
        passager&nbsp;: réessaie dans un instant.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mx-auto rounded-full bg-mine px-6 py-3 font-medium text-white transition hover:brightness-110"
      >
        Réessayer
      </button>
    </main>
  );
}
