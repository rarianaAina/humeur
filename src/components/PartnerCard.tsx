"use client";

import {
  bodyTagById,
  ENERGY_LABELS,
  moodDisplay,
  talkById,
} from "@/lib/constants";
import type { PartnerState } from "@/lib/types";
import { isStale, timeAgo } from "@/lib/timeAgo";

const TALK_TONE: Record<string, string> = {
  yes: "bg-yes/15 text-yes border-yes/30",
  maybe: "bg-maybe/15 text-maybe border-maybe/30",
  quiet: "bg-quiet/15 text-quiet border-quiet/30",
  no: "bg-no/15 text-no border-no/30",
};

/** L'état de l'autre, en lecture seule. */
export function PartnerCard({
  name,
  state,
}: {
  name: string;
  state: PartnerState;
}) {
  const moods = state.moods
    .map(moodDisplay)
    .filter((m): m is NonNullable<typeof m> => m !== null);
  const talk = talkById(state.talk);
  const stale = isStale(state.updated_at);

  return (
    <section
      aria-label={`État de ${name}`}
      className="space-y-5 rounded-3xl border border-line bg-theirs-soft p-6"
    >
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold text-theirs">{name}</h2>
        <span className="text-xs text-muted">{timeAgo(state.updated_at)}</span>
      </header>

      {stale && (
        <p className="rounded-xl bg-card/70 px-3 py-2 text-xs leading-relaxed text-muted">
          Cet état date un peu — il ne dit peut-être plus grand-chose de
          maintenant.
        </p>
      )}

      <div className="space-y-3">
        {moods.length === 0 ? (
          <div className="flex items-center gap-4">
            <span className="text-5xl leading-none" aria-hidden>
              …
            </span>
            <p className="text-2xl font-medium">Rien d&apos;indiqué</p>
          </div>
        ) : (
          <ul className="flex flex-wrap items-center gap-2">
            {moods.map((mood) => (
              <li
                key={mood.id}
                className="flex items-center gap-2 rounded-2xl bg-card px-3 py-2 text-lg font-medium"
              >
                {mood.emoji && (
                  <span className="text-2xl leading-none" aria-hidden>
                    {mood.emoji}
                  </span>
                )}
                <span>{mood.label}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm text-muted">
          Énergie : {ENERGY_LABELS[state.energy]} ({state.energy}/5)
        </p>
      </div>

      {talk && (
        <div
          className={`rounded-2xl border px-4 py-3 ${TALK_TONE[talk.id]}`}
          role="status"
        >
          <p className="font-medium">
            <span aria-hidden>{talk.emoji}</span> {talk.short}
          </p>
          <p className="mt-0.5 text-sm opacity-80">{talk.hint}</p>
        </div>
      )}

      {state.body.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {state.body.map((id) => {
            const tag = bodyTagById(id);
            if (!tag) return null;
            return (
              <span
                key={id}
                className="rounded-full border border-line bg-card px-3 py-1 text-sm"
              >
                <span aria-hidden>{tag.emoji}</span> {tag.label}
              </span>
            );
          })}
        </div>
      )}

      {state.note && (
        <blockquote className="rounded-2xl border-l-4 border-theirs bg-card px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap">
          {state.note}
        </blockquote>
      )}
    </section>
  );
}
