import { notFound } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";
import { loadCouple, touchCouple } from "@/lib/couple";

// Un espace change à chaque instant : rien ne doit être mis en cache, ni côté
// Next.js ni chez un intermédiaire.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

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
