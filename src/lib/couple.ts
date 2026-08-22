import "server-only";
import { supabaseAdmin } from "./supabase";
import type { CoupleView, Partner, PartnerState } from "./types";
import { emptyState } from "./validate";

type CoupleRow = {
  id: string;
  slug: string;
  name_a: string;
  name_b: string;
  custom_moods: string[] | null;
};
type StateRow = Omit<PartnerState, "partner"> & { partner: Partner };

/** Charge un espace par son slug secret, avec les deux états courants. */
export async function loadCouple(
  slug: string,
): Promise<{ id: string; view: CoupleView } | null> {
  const db = supabaseAdmin();

  const { data: couple, error } = await db
    .from("couples")
    .select("id, slug, name_a, name_b, custom_moods")
    .eq("slug", slug)
    .maybeSingle<CoupleRow>();

  if (error) {
    console.error("lecture du couple échouée", error);
    throw new Error("Lecture impossible.");
  }
  if (!couple) return null;

  const { data: rows } = await db
    .from("states")
    .select("partner, moods, energy, talk, body, note, updated_at")
    .eq("couple_id", couple.id)
    .returns<StateRow[]>();

  const byPartner = new Map((rows ?? []).map((r) => [r.partner, r]));

  return {
    id: couple.id,
    view: {
      slug: couple.slug,
      names: { a: couple.name_a, b: couple.name_b },
      customMoods: couple.custom_moods ?? [],
      states: {
        a: byPartner.get("a") ?? emptyState("a"),
        b: byPartner.get("b") ?? emptyState("b"),
      },
    },
  };
}

/** Trace la dernière consultation, sans bloquer la réponse en cas d'échec. */
export async function touchCouple(id: string) {
  const db = supabaseAdmin();
  const { error } = await db
    .from("couples")
    .update({ seen_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("mise à jour de seen_at échouée", error);
}
