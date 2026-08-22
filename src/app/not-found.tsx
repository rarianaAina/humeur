import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        Cet espace n&apos;existe pas
      </h1>
      <p className="leading-relaxed text-muted">
        Le lien est peut-être incomplet, ou l&apos;espace a été supprimé.
        Vérifie que tu as copié l&apos;adresse en entier.
      </p>
      <Link
        href="/"
        className="mx-auto rounded-full bg-mine px-6 py-3 font-medium text-white transition hover:brightness-110"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
