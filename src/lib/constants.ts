import type { Talk } from "./types";

export const MOODS = [
  { id: "serein", label: "Serein·e", emoji: "😌" },
  { id: "joyeux", label: "Joyeux·se", emoji: "😄" },
  { id: "amoureux", label: "Amoureux·se", emoji: "🥰" },
  { id: "neutre", label: "Neutre", emoji: "😐" },
  { id: "fatigue", label: "Fatigué·e", emoji: "😮‍💨" },
  { id: "stresse", label: "Stressé·e", emoji: "😰" },
  { id: "deborde", label: "Débordé·e", emoji: "🤯" },
  { id: "triste", label: "Triste", emoji: "😢" },
  { id: "irritable", label: "Irritable", emoji: "😤" },
  { id: "ailleurs", label: "Ailleurs", emoji: "🌫️" },
] as const;

export const TALK_OPTIONS: {
  id: Talk;
  label: string;
  short: string;
  emoji: string;
  hint: string;
}[] = [
  {
    id: "yes",
    label: "J'ai envie de parler",
    short: "Envie de parler",
    emoji: "💬",
    hint: "Viens me chercher, j'ai des choses à dire.",
  },
  {
    id: "maybe",
    label: "Si tu veux, je suis dispo",
    short: "Disponible",
    emoji: "🤔",
    hint: "Je ne lance pas, mais je réponds volontiers.",
  },
  {
    id: "no",
    label: "J'ai besoin de calme",
    short: "Besoin de calme",
    emoji: "🤫",
    hint: "Ce n'est pas contre toi, j'ai juste besoin d'un moment.",
  },
];

export const BODY_TAGS = [
  { id: "en-forme", label: "En forme", emoji: "💪" },
  { id: "fatigue", label: "Fatigue", emoji: "🥱" },
  { id: "mal-dormi", label: "Mal dormi", emoji: "🌙" },
  { id: "mal-de-tete", label: "Mal de tête", emoji: "🤕" },
  { id: "douleurs", label: "Douleurs", emoji: "🩹" },
  { id: "malade", label: "Malade", emoji: "🤒" },
  { id: "regles", label: "Règles", emoji: "🩸" },
  { id: "faim", label: "Faim", emoji: "🍽️" },
  { id: "tendu", label: "Tendu·e", emoji: "🪢" },
  { id: "detendu", label: "Détendu·e", emoji: "🧘" },
] as const;

export const ENERGY_LABELS: Record<number, string> = {
  1: "À plat",
  2: "Basse",
  3: "Moyenne",
  4: "Bonne",
  5: "Au top",
};

export const NOTE_MAX = 500;

export function moodById(id: string | null | undefined) {
  return MOODS.find((m) => m.id === id) ?? null;
}

export function talkById(id: string | null | undefined) {
  return TALK_OPTIONS.find((t) => t.id === id) ?? null;
}

export function bodyTagById(id: string) {
  return BODY_TAGS.find((t) => t.id === id) ?? null;
}
