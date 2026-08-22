import {
  BODY_TAGS,
  CUSTOM_MOOD_PREFIX,
  CUSTOM_MOODS_MAX,
  MOOD_LABEL_MAX,
  MOODS,
  MOODS_MAX,
  NOTE_MAX,
  TALK_OPTIONS,
  customMoodId,
  isCustomMood,
} from "./constants";
import type { Partner, PartnerState, Talk } from "./types";

const MOOD_IDS = new Set<string>(MOODS.map((m) => m.id));
const BODY_IDS = new Set<string>(BODY_TAGS.map((t) => t.id));
const TALK_IDS = new Set<string>(TALK_OPTIONS.map((t) => t.id));

export function isPartner(value: unknown): value is Partner {
  return value === "a" || value === "b";
}

export type StatePatch = {
  moods: string[];
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
 *
 * `knownCustomMoods` vient du couple : une humeur personnalisée n'est
 * acceptable que si elle a d'abord été créée via /moods.
 */
export function parseStatePatch(
  input: unknown,
  knownCustomMoods: string[],
): StatePatch | { error: string } {
  if (typeof input !== "object" || input === null) {
    return { error: "Corps de requête invalide." };
  }
  const body = input as Record<string, unknown>;

  const rawMoods = Array.isArray(body.moods) ? body.moods : [];
  const custom = new Set(knownCustomMoods);
  const moods = Array.from(
    new Set(
      rawMoods
        .map(String)
        .filter((m) => (isCustomMood(m) ? custom.has(m) : MOOD_IDS.has(m))),
    ),
  );
  if (moods.length > MOODS_MAX) {
    return { error: `Pas plus de ${MOODS_MAX} humeurs à la fois.` };
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

  return { moods, energy, talk: talk as Talk, body: bodyTags, note };
}

/**
 * Valide le libellé d'une humeur à créer et renvoie son identifiant.
 * Le doublon n'est pas une erreur : on renvoie l'identifiant existant, pour
 * que l'appelant puisse simplement la cocher.
 */
export function parseNewMood(
  input: unknown,
  existing: string[],
): { id: string; alreadyThere: boolean } | { error: string } {
  const label =
    typeof input === "string" ? input.trim().replace(/\s+/g, " ") : "";

  if (!label) return { error: "Écris d'abord un nom d'humeur." };
  if (label.length > MOOD_LABEL_MAX) {
    return { error: `${MOOD_LABEL_MAX} caractères maximum.` };
  }

  // Une humeur maison ne doit pas doublonner un preset : sinon la même chose
  // apparaîtrait deux fois dans la liste, sous deux libellés voisins.
  const folded = label.toLocaleLowerCase("fr");
  const preset = MOODS.find(
    (m) => m.label.toLocaleLowerCase("fr") === folded || m.id === folded,
  );
  if (preset) {
    return { error: `« ${preset.label} » est déjà dans la liste.` };
  }

  const twin = existing.find(
    (id) =>
      id.slice(CUSTOM_MOOD_PREFIX.length).toLocaleLowerCase("fr") === folded,
  );
  if (twin) return { id: twin, alreadyThere: true };

  if (existing.length >= CUSTOM_MOODS_MAX) {
    return {
      error: `Vous avez déjà ${CUSTOM_MOODS_MAX} humeurs à vous. Supprimes-en une pour en ajouter.`,
    };
  }

  return { id: customMoodId(label), alreadyThere: false };
}

export function emptyState(partner: Partner): PartnerState {
  return {
    partner,
    moods: [],
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
