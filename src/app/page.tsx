import { CreateSpaceButton } from "@/components/CreateSpaceButton";
import { BODY_TAGS, MOODS, TALK_OPTIONS } from "@/lib/constants";

const STEPS = [
  {
    title: "Tu poses ton état",
    body: "Ton humeur, ton énergie, comment va ton corps. Trois gestes, dix secondes.",
  },
  {
    title: "Tu dis si tu es dispo",
    body: "Envie de parler, disponible si l'autre le souhaite, ou besoin de calme.",
  },
  {
    title: "L'autre s'adapte",
    body: "Il voit où tu en es avant d'ouvrir la bouche. Plus besoin de deviner.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-14 px-6 py-16">
      <header className="space-y-5 text-center">
        <div className="flex justify-center gap-2 text-4xl" aria-hidden>
          <span>{MOODS[0].emoji}</span>
          <span>{TALK_OPTIONS[2].emoji}</span>
          <span>{BODY_TAGS[1].emoji}</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Humeur
        </h1>
        <p className="text-balance text-lg leading-relaxed text-muted">
          Un espace à deux pour dire où on en est — sans avoir à trouver les
          mots au mauvais moment.
        </p>
      </header>

      <ol className="space-y-4">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="flex gap-4 rounded-2xl border border-line bg-card p-5"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mine-soft text-sm font-semibold text-mine">
              {i + 1}
            </span>
            <div className="space-y-1">
              <h2 className="font-medium">{step.title}</h2>
              <p className="text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <CreateSpaceButton />

      <p className="text-center text-xs leading-relaxed text-muted">
        Votre espace vit derrière un lien secret. Toute personne qui obtient ce
        lien peut voir et modifier vos états : gardez-le entre vous, et évitez
        de l&apos;ouvrir sur un appareil partagé.
      </p>
    </main>
  );
}
