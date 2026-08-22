import { NextResponse } from "next/server";
import { loadCouple } from "@/lib/couple";
import { supabaseAdmin } from "@/lib/supabase";
import { isPartner, parseStatePatch, sanitizeName } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

const NOT_FOUND = NextResponse.json(
  { error: "Espace introuvable." },
  { status: 404 },
);

/** GET — état courant des deux partenaires (appelé en boucle par le client). */
export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const couple = await loadCouple(slug);
  if (!couple) return NOT_FOUND;

  return NextResponse.json(couple.view, {
    headers: { "Cache-Control": "no-store" },
  });
}

/** POST — met à jour l'état d'un partenaire. */
export async function POST(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const couple = await loadCouple(slug);
  if (!couple) return NOT_FOUND;

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const { partner } = (payload ?? {}) as { partner?: unknown };
  if (!isPartner(partner)) {
    return NextResponse.json(
      { error: "Partenaire invalide." },
      { status: 400 },
    );
  }

  const patch = parseStatePatch(payload);
  if ("error" in patch) {
    return NextResponse.json({ error: patch.error }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { error } = await db.from("states").upsert(
    {
      couple_id: couple.id,
      partner,
      ...patch,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "couple_id,partner" },
  );

  if (error) {
    console.error("mise à jour de l'état échouée", error);
    return NextResponse.json(
      { error: "Enregistrement impossible." },
      { status: 500 },
    );
  }

  const fresh = await loadCouple(slug);
  return NextResponse.json(fresh?.view ?? couple.view, {
    headers: { "Cache-Control": "no-store" },
  });
}

/** PATCH — renomme les partenaires. */
export async function PATCH(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const couple = await loadCouple(slug);
  if (!couple) return NOT_FOUND;

  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { error } = await db
    .from("couples")
    .update({
      name_a: sanitizeName(payload.name_a, couple.view.names.a),
      name_b: sanitizeName(payload.name_b, couple.view.names.b),
    })
    .eq("id", couple.id);

  if (error) {
    console.error("renommage échoué", error);
    return NextResponse.json(
      { error: "Enregistrement impossible." },
      { status: 500 },
    );
  }

  const fresh = await loadCouple(slug);
  return NextResponse.json(fresh?.view ?? couple.view, {
    headers: { "Cache-Control": "no-store" },
  });
}
