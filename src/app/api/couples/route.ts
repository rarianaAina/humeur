import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 128 bits d'entropie, encodés en base64url (22 caractères, sans padding). */
function newSlug() {
  return randomBytes(16).toString("base64url");
}

/** POST /api/couples — crée un espace et renvoie son slug secret. */
export async function POST() {
  const db = supabaseAdmin();
  const slug = newSlug();

  const { data, error } = await db
    .from("couples")
    .insert({ slug })
    .select("id, slug")
    .single();

  if (error || !data) {
    console.error("création du couple échouée", error);
    return NextResponse.json(
      { error: "Impossible de créer l'espace." },
      { status: 500 },
    );
  }

  // Les deux états démarrent aux valeurs par défaut, pour que la page de
  // l'autre partenaire ne soit jamais vide au premier chargement.
  const { error: seedError } = await db.from("states").insert([
    { couple_id: data.id, partner: "a" },
    { couple_id: data.id, partner: "b" },
  ]);

  if (seedError) {
    console.error("initialisation des états échouée", seedError);
    return NextResponse.json(
      { error: "Impossible d'initialiser l'espace." },
      { status: 500 },
    );
  }

  return NextResponse.json({ slug: data.slug }, { status: 201 });
}
