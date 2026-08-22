/** Distance en français, volontairement approximative ("il y a 5 min"). */
export function timeAgo(iso: string | null): string {
  if (!iso) return "jamais renseigné";

  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "date inconnue";

  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 0) return "à l'instant";
  if (seconds < 60) return "à l'instant";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;

  const days = Math.round(hours / 24);
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} jours`;

  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
}

/** Un état vieux de plus de 12 h ne dit plus grand-chose du moment présent. */
export function isStale(iso: string | null): boolean {
  if (!iso) return true;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return true;
  return Date.now() - then > 12 * 60 * 60 * 1000;
}
