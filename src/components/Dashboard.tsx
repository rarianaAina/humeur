"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IdentityPicker } from "./IdentityPicker";
import { MyStateEditor, type SaveStatus } from "./MyStateEditor";
import { PartnerCard } from "./PartnerCard";
import { SpaceFooter } from "./SpaceFooter";
import type { CoupleView, Partner, PartnerState } from "@/lib/types";

/** Cadence de rafraîchissement de l'état de l'autre, en millisecondes. */
const POLL_MS = 4000;
/** Délai avant d'envoyer une modification, pour grouper les clics rapides. */
const SAVE_DEBOUNCE_MS = 700;

const identityKey = (slug: string) => `humeur:identity:${slug}`;

function other(partner: Partner): Partner {
  return partner === "a" ? "b" : "a";
}

export function Dashboard({ initial }: { initial: CoupleView }) {
  const { slug } = initial;

  const [view, setView] = useState<CoupleView>(initial);
  const [me, setMe] = useState<Partner | null>(null);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<PartnerState | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Le brouillon vit aussi dans une ref : le timer de sauvegarde doit lire la
  // dernière valeur, pas celle capturée au moment où il a été armé.
  const draftRef = useRef<PartnerState | null>(null);

  // --- identité, mémorisée par appareil ---------------------------------
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(identityKey(slug));
    } catch {
      // Stockage indisponible (navigation privée stricte) : on redemandera.
    }
    if (stored === "a" || stored === "b") setMe(stored);
    setReady(true);
  }, [slug]);

  const pickIdentity = useCallback(
    (partner: Partner) => {
      try {
        window.localStorage.setItem(identityKey(slug), partner);
      } catch {
        // Sans stockage, le choix ne tient que pour cette session.
      }
      setMe(partner);
    },
    [slug],
  );

  const switchIdentity = useCallback(() => {
    try {
      window.localStorage.removeItem(identityKey(slug));
    } catch {
      // Rien à nettoyer.
    }
    setMe(null);
    setDraft(null);
    draftRef.current = null;
  }, [slug]);

  // Le brouillon part de l'état serveur, une fois l'identité connue.
  useEffect(() => {
    if (!me || draftRef.current) return;
    const seed = view.states[me];
    draftRef.current = seed;
    setDraft(seed);
  }, [me, view]);

  // --- lecture périodique de l'état de l'autre --------------------------
  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/couples/${slug}`, { cache: "no-store" });
      if (!res.ok) return;
      const next = (await res.json()) as CoupleView;
      // Ne re-rendre que si quelque chose a bougé, sinon on repeindrait la
      // page toutes les quatre secondes pour rien.
      setView((prev) =>
        JSON.stringify(prev) === JSON.stringify(next) ? prev : next,
      );
    } catch {
      // Hors ligne ou requête interrompue : le prochain tour réessaiera.
    }
  }, [slug]);

  useEffect(() => {
    if (!me) return;

    const tick = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const interval = setInterval(tick, POLL_MS);

    // Revenir sur l'onglet doit rafraîchir tout de suite, sans attendre.
    const onWake = () => tick();
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("focus", onWake);
    };
  }, [me, refresh]);

  // --- écriture ---------------------------------------------------------
  const save = useCallback(async () => {
    const current = draftRef.current;
    if (!me || !current) return;

    setStatus("saving");
    try {
      const res = await fetch(`/api/couples/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner: me,
          mood: current.mood,
          energy: current.energy,
          talk: current.talk,
          body: current.body,
          note: current.note,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));

      const next = (await res.json()) as CoupleView;
      setView(next);
      // On ne remplace pas le brouillon par la réponse : l'utilisateur a pu
      // continuer à cliquer entre-temps. Seul l'horodatage nous intéresse.
      const stamp = next.states[me].updated_at;
      if (draftRef.current) {
        draftRef.current = { ...draftRef.current, updated_at: stamp };
      }
      setDraft((d) => (d ? { ...d, updated_at: stamp } : d));

      setStatus("saved");
      setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 1500);
    } catch {
      setStatus("error");
    }
  }, [me, slug]);

  const onChange = useCallback(
    (patch: Partial<PartnerState>) => {
      setDraft((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        draftRef.current = next;
        return next;
      });

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void save(), SAVE_DEBOUNCE_MS);
    },
    [save],
  );

  // Une modification en attente ne doit pas être perdue si l'onglet se ferme.
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const rename = useCallback(
    async (names: Record<Partner, string>) => {
      try {
        const res = await fetch(`/api/couples/${slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name_a: names.a, name_b: names.b }),
        });
        if (res.ok) setView((await res.json()) as CoupleView);
      } catch {
        // Échec silencieux : les prénoms restent ceux affichés.
      }
    },
    [slug],
  );

  if (!ready) return null;
  if (!me) return <IdentityPicker view={view} onPick={pickIdentity} />;

  const them = other(me);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Où on en est
        </h1>
        <p className="text-sm text-muted">
          {view.names.a} &amp; {view.names.b}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <PartnerCard name={view.names[them]} state={view.states[them]} />
        {draft && (
          <MyStateEditor
            name={view.names[me]}
            state={draft}
            status={status}
            onChange={onChange}
          />
        )}
      </div>

      <SpaceFooter
        view={view}
        me={me}
        onRename={rename}
        onSwitchIdentity={switchIdentity}
      />
    </main>
  );
}
