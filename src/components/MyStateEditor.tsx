"use client";

import {
  BODY_TAGS,
  ENERGY_LABELS,
  MOODS,
  NOTE_MAX,
  TALK_OPTIONS,
} from "@/lib/constants";
import type { PartnerState } from "@/lib/types";
import { timeAgo } from "@/lib/timeAgo";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: "",
  saving: "Enregistrement…",
  saved: "Enregistré",
  error: "Échec de l'enregistrement",
};

/** Mon propre état : tout est modifiable, chaque changement est enregistré. */
export function MyStateEditor({
  name,
  state,
  status,
  onChange,
}: {
  name: string;
  state: PartnerState;
  status: SaveStatus;
  onChange: (patch: Partial<PartnerState>) => void;
}) {
  function toggleBodyTag(id: string) {
    onChange({
      body: state.body.includes(id)
        ? state.body.filter((t) => t !== id)
        : [...state.body, id],
    });
  }

  return (
    <section
      aria-label="Mon état"
      className="space-y-7 rounded-3xl border border-line bg-mine-soft p-6"
    >
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold text-mine">{name} (toi)</h2>
        <span
          aria-live="polite"
          className={`text-xs ${status === "error" ? "text-mine" : "text-muted"}`}
        >
          {status === "idle" ? timeAgo(state.updated_at) : STATUS_TEXT[status]}
        </span>
      </header>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-muted">
          Comment je me sens
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MOODS.map((mood) => {
            const selected = state.mood === mood.id;
            return (
              <button
                key={mood.id}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  onChange({ mood: selected ? null : mood.id })
                }
                className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-sm transition ${
                  selected
                    ? "border-mine bg-mine text-white"
                    : "border-line bg-card hover:border-mine"
                }`}
              >
                <span className="text-xl" aria-hidden>
                  {mood.emoji}
                </span>
                <span className="truncate">{mood.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-3">
        <label
          htmlFor="energy"
          className="flex items-baseline justify-between text-sm font-medium text-muted"
        >
          <span>Mon énergie</span>
          <span className="text-ink">
            {ENERGY_LABELS[state.energy]} ({state.energy}/5)
          </span>
        </label>
        <input
          id="energy"
          type="range"
          min={1}
          max={5}
          step={1}
          value={state.energy}
          onChange={(e) => onChange({ energy: Number(e.target.value) })}
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-muted">
          Est-ce que j&apos;ai envie de parler&nbsp;?
        </legend>
        <div className="space-y-2">
          {TALK_OPTIONS.map((option) => {
            const selected = state.talk === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ talk: option.id })}
                className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  selected
                    ? "border-mine bg-card ring-2 ring-mine"
                    : "border-line bg-card hover:border-mine"
                }`}
              >
                <span className="text-xl leading-tight" aria-hidden>
                  {option.emoji}
                </span>
                <span>
                  <span className="block font-medium">{option.label}</span>
                  <span className="block text-sm text-muted">
                    {option.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-muted">
          Mon corps, en ce moment
        </legend>
        <div className="flex flex-wrap gap-2">
          {BODY_TAGS.map((tag) => {
            const selected = state.body.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleBodyTag(tag.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  selected
                    ? "border-mine bg-mine text-white"
                    : "border-line bg-card hover:border-mine"
                }`}
              >
                <span aria-hidden>{tag.emoji}</span> {tag.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="note" className="text-sm font-medium text-muted">
          Un mot, si tu veux (facultatif)
        </label>
        <textarea
          id="note"
          rows={3}
          maxLength={NOTE_MAX}
          value={state.note ?? ""}
          onChange={(e) => onChange({ note: e.target.value })}
          placeholder="Ce n'est pas contre toi, j'ai juste eu une journée difficile…"
          className="w-full resize-y rounded-2xl border border-line bg-card px-4 py-3 text-[15px] leading-relaxed outline-none focus:border-mine focus:ring-2 focus:ring-mine/40"
        />
        <p className="text-right text-xs text-muted">
          {(state.note ?? "").length}/{NOTE_MAX}
        </p>
      </div>
    </section>
  );
}
