import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Un manifeste par espace.
 *
 * Chrome démarre l'app installée sur `start_url`, littéralement : un manifeste
 * unique pour tout le site ouvrirait donc la page de création au lieu de
 * l'espace du couple. iOS, lui, retient l'URL affichée au moment de l'ajout et
 * se moque de `start_url` — d'où cette route, qui règle le cas Android sans
 * rien changer pour iOS.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const space = `/c/${encodeURIComponent(slug)}`;

  return NextResponse.json(
    {
      id: space,
      name: "Humeur",
      short_name: "Humeur",
      description:
        "Un espace à deux pour dire où on en est, sans avoir à trouver les mots au mauvais moment.",
      lang: "fr",
      display: "standalone",
      orientation: "portrait",
      background_color: "#fbf7f2",
      theme_color: "#fbf7f2",
      start_url: space,
      // Cantonner l'app à son espace : un lien qui en sort s'ouvre dans le
      // navigateur plutôt que de dérouter l'app installée.
      scope: space,
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/manifest+json",
        // Le manifeste porte le slug : il ne doit pas être mis en cache
        // par un intermédiaire partagé.
        "Cache-Control": "private, no-store",
      },
    },
  );
}
