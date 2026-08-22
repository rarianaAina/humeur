import { BODY_TAGS, MOODS, NOTE_MAX, TALK_OPTIONS } from "./constants";
import type { Partner, PartnerState, Talk } from "./types";

const MOOD_IDS = new Set<string>(MOODS.map((m) => m.id));
const BODY_IDS = new Set<string>(BODY_TAGS.map((t) => t.id));
const TALK_IDS = new Set<string>(TALK_OPTIONS.map((t) => t.id));

export function isPartner(value: unknown): value is Partner {
  return value === "a" || value === "b";
}

export type StatePatch = {
  mood: string | null;
  energy: number;
  talk: Talk;
  body: string[];
  note: string | null;
};

/**
 * Normalise le corps d'une requête de mise à jour. On rejette plutôt que de
 * corriger silencieusement, sauf pour les listes où l'on filtre les inconnus :
 * un tag obsolète venant d'un onglet resté ouvert ne doit pas bloquer la
 * mise à jour du reste.
 */
export function parseStatePatch(input: unknown): StatePatch | { error: string } {
  if (typeof input !== "object" || input === null) {
    return { error: "Corps de requête invalide." };
  }
  const body = input as Record<string, unknown>;

  const mood =
    body.mood === null || body.mood === undefined ? null : String(body.mood);
  if (mood !== null && !MOOD_IDS.has(mood)) {
    return { error: `Humeur inconnue : ${mood}` };
  }

  const energy = Number(body.energy);
  if (!Number.isInteger(energy) || energy < 1 || energy > 5) {
    return { error: "L'énergie doit être un entier entre 1 et 5." };
  }

  const talk = String(body.talk);
  if (!TALK_IDS.has(talk)) {
    return { error: `Disponibilité inconnue : ${talk}` };
  }

  const rawBody = Array.isArray(body.body) ? body.body : [];
  const bodyTags = Array.from(
    new Set(rawBody.map(String).filter((t) => BODY_IDS.has(t))),
  );

  let note: string | null = null;
  if (typeof body.note === "string") {
    const trimmed = body.note.trim();
    if (trimmed.length > NOTE_MAX) {
      return { error: `Le mot libre dépasse ${NOTE_MAX} caractères.` };
    }
    note = trimmed.length > 0 ? trimmed : null;
  }

  return { mood, energy, talk: talk as Talk, body: bodyTags, note };
}

export function emptyState(partner: Partner): PartnerState {
  return {
    partner,
    mood: null,
    energy: 3,
    talk: "maybe",
    body: [],
    note: null,
    updated_at: null,
  };
}

export function sanitizeName(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim().slice(0, 40);
  return trimmed.length > 0 ? trimmed : fallback;
}
