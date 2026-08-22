import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";
import { loadCouple, touchCouple } from "@/lib/couple";

// Un espace change à chaque instant : rien ne doit être mis en cache, ni côté
// Next.js ni chez un intermédiaire.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/** Chaque espace pointe vers son propre manifeste — voir la route voisine. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { manifest: `/c/${encodeURIComponent(slug)}/manifest.webmanifest` };
}

export default async function SpacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const couple = await loadCouple(slug);
  if (!couple) notFound();

  await touchCouple(couple.id);

  return <Dashboard initial={couple.view} />;
}
