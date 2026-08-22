import { NextResponse } from "next/server";
import { loadCouple } from "@/lib/couple";
import { isCustomMood } from "@/lib/constants";
import { supabaseAdmin } from "@/lib/supabase";
import { parseNewMood } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

const NOT_FOUND = NextResponse.json(
  { error: "Espace introuvable." },
  { status: 404 },
);

async function readBody(req: Request) {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * POST — crée une humeur maison, partagée avec l'autre partenaire.
 * Renvoie l'identifiant à cocher, y compris quand elle existait déjà.
 */
export async function POST(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const couple = await loadCouple(slug);
  if (!couple) return NOT_FOUND;

  const payload = await readBody(req);
  if (!payload) {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const parsed = parseNewMood(payload.label, couple.view.customMoods);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Déjà connue : rien à écrire, l'appelant n'a plus qu'à la cocher.
  if (parsed.alreadyThere) {
    return NextResponse.json(
      { mood: parsed.id, couple: couple.view },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  // On relit la colonne juste avant d'écrire : si l'autre partenaire vient
  // d'ajouter une humeur de son côté, la sienne ne doit pas disparaître.
  const db = supabaseAdmin();
  const { data: current } = await db
    .from("couples")
    .select("custom_moods")
    .eq("id", couple.id)
    .maybeSingle<{ custom_moods: string[] | null }>();

  const merged = Array.from(
    new Set([...(current?.custom_moods ?? couple.view.customMoods), parsed.id]),
  );

  const { error } = await db
    .from("couples")
    .update({ custom_moods: merged })
    .eq("id", couple.id);

  if (error) {
    console.error("ajout d'une humeur échoué", error);
    return NextResponse.json(
      { error: "Enregistrement impossible." },
      { status: 500 },
    );
  }

  const fresh = await loadCouple(slug);
  return NextResponse.json(
    { mood: parsed.id, couple: fresh?.view ?? couple.view },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * DELETE — retire une humeur maison de la liste, et de tout état qui la
 * portait encore : un identifiant orphelin ne s'afficherait nulle part
 * tout en restant stocké.
 */
export async function DELETE(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const couple = await loadCouple(slug);
  if (!couple) return NOT_FOUND;

  const payload = await readBody(req);
  const mood = typeof payload?.mood === "string" ? payload.mood : "";
  if (!mood || !isCustomMood(mood)) {
    return NextResponse.json(
      { error: "On ne peut retirer qu'une humeur ajoutée par vous." },
      { status: 400 },
    );
  }

  const db = supabaseAdmin();
  const { error } = await db
    .from("couples")
    .update({
      custom_moods: couple.view.customMoods.filter((m) => m !== mood),
    })
    .eq("id", couple.id);

  if (error) {
    console.error("suppression d'une humeur échouée", error);
    return NextResponse.json(
      { error: "Suppression impossible." },
      { status: 500 },
    );
  }

  for (const partner of ["a", "b"] as const) {
    const state = couple.view.states[partner];
    if (!state.moods.includes(mood)) continue;
    await db
      .from("states")
      .update({ moods: state.moods.filter((m) => m !== mood) })
      .eq("couple_id", couple.id)
      .eq("partner", partner);
  }

  const fresh = await loadCouple(slug);
  return NextResponse.json(fresh?.view ?? couple.view, {
    headers: { "Cache-Control": "no-store" },
  });
}
