import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Humeur",
    short_name: "Humeur",
    description:
      "Un espace à deux pour dire où on en est, sans avoir à trouver les mots au mauvais moment.",
    lang: "fr",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbf7f2",
    theme_color: "#fbf7f2",
    // Ni start_url ni scope : l'app démarre alors sur la page depuis laquelle
    // elle a été ajoutée. C'est ce qu'on veut — chacun épingle SON espace
    // (/c/<slug>), pas la page d'accueil.
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
  };
}
