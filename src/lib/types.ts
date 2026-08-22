export type Partner = "a" | "b";

export type Talk = "yes" | "maybe" | "no";

export type PartnerState = {
  partner: Partner;
  /** Identifiants d'humeurs : presets, ou « custom:<libellé> ». */
  moods: string[];
  energy: number;
  talk: Talk;
  body: string[];
  note: string | null;
  updated_at: string | null;
};

export type CoupleView = {
  slug: string;
  names: Record<Partner, string>;
  /** Humeurs inventées par le couple, proposées aux deux partenaires. */
  customMoods: string[];
  states: Record<Partner, PartnerState>;
};
