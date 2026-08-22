"use client";

import { useEffect, useState } from "react";
import type { CoupleView, Partner } from "@/lib/types";

/** Partage du lien, prénoms, et changement d'identité — replié par défaut. */
export function SpaceFooter({
  view,
  me,
  onRename,
  onSwitchIdentity,
}: {
  view: CoupleView;
  me: Partner;
  onRename: (names: Record<Partner, string>) => void;
  onSwitchIdentity: () => void;
}) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [nameA, setNameA] = useState(view.names.a);
  const [nameB, setNameB] = useState(view.names.b);

  // window n'existe pas au rendu serveur : on lit l'URL après montage.
  useEffect(() => setUrl(window.location.href), []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Notre espace Humeur", url });
        return;
      } catch {
        // Partage annulé : on retombe sur la copie.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <footer className="space-y-4">
      <details className="rounded-2xl border border-line bg-card px-5 py-4">
        <summary className="cursor-pointer text-sm font-medium">
          Réglages de l&apos;espace
        </summary>

        <div className="mt-5 space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted">
              Le lien à partager avec l&apos;autre
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={url}
                onFocus={(e) => e.currentTarget.select()}
                className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 py-2 font-mono text-xs"
              />
              <button
                type="button"
                onClick={share}
                className="shrink-0 rounded-xl bg-mine px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
              >
                {copied ? "Copié" : "Partager"}
              </button>
            </div>
            <p className="text-xs leading-relaxed text-muted">
              Ce lien est la seule clé de votre espace. Qui l&apos;a peut tout
              voir et tout modifier — et il n&apos;est pas récupérable si vous
              le perdez, alors mettez-le en favori.
            </p>
          </div>

          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              onRename({ a: nameA, b: nameB });
            }}
          >
            <p className="text-sm font-medium text-muted">Vos prénoms</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                aria-label="Prénom du premier partenaire"
                value={nameA}
                maxLength={40}
                onChange={(e) => setNameA(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-mine"
              />
              <input
                aria-label="Prénom du second partenaire"
                value={nameB}
                maxLength={40}
                onChange={(e) => setNameB(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-mine"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl border border-line px-4 py-2 text-sm font-medium transition hover:border-mine"
              >
                Enregistrer
              </button>
            </div>
          </form>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted">Identité</p>
            <p className="text-sm">
              Sur cet appareil, tu es{" "}
              <strong>{view.names[me]}</strong>.{" "}
              <button
                type="button"
                onClick={onSwitchIdentity}
                className="underline underline-offset-2 hover:text-mine"
              >
                Ce n&apos;est pas moi
              </button>
            </p>
          </div>
        </div>
      </details>
    </footer>
  );
}
