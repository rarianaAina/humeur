import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Humeur",
  description:
    "Un espace à deux pour dire où on en est, sans avoir à trouver les mots au mauvais moment.",
  // Les espaces sont accessibles par lien secret : ils ne doivent jamais être
  // indexés, ni fuiter dans un Referer vers un site tiers.
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
  // « Sur l'écran d'accueil » : l'app s'ouvre alors en plein écran, sans la
  // barre d'adresse de Safari.
  appleWebApp: {
    capable: true,
    title: "Humeur",
    statusBarStyle: "default",
  },
  other: {
    // Next n'émet que la forme standard `mobile-web-app-capable`. iOS 15.4+
    // se contente du manifeste, mais les versions antérieures veulent
    // encore cette balise-ci pour ouvrir en plein écran.
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    // iOS ignore le manifeste pour l'icône : il lui faut ce lien-ci.
    apple: [{ url: "/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#16130f" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
