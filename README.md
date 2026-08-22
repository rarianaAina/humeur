# Humeur

Un espace à deux pour dire où on en est — humeur, énergie, état du corps, et
surtout : est-ce que j'ai envie de parler là, maintenant. L'autre le voit et
s'adapte, sans avoir à demander.

## Comment ça marche

- **Pas de compte.** Un espace = un lien secret (`/c/<slug>`, 128 bits
  d'entropie). Le premier arrivé crée l'espace, envoie le lien à l'autre.
- **Chacun son côté.** Au premier chargement, on choisit qui on est ; le choix
  est mémorisé dans le navigateur (`localStorage`).
- **Presque temps réel.** L'état de l'autre est rafraîchi toutes les 4
  secondes, et immédiatement au retour sur l'onglet. Ses modifications à soi
  partent automatiquement, 0,7 s après le dernier clic.
- **Pas d'historique.** Une seule ligne par personne, écrasée à chaque mise à
  jour. C'est un état présent, pas un journal.
- **Plusieurs humeurs à la fois**, parce qu'on est rarement d'une seule pièce :
  fatiguée *et* amoureuse *et* à cran. Et si un mot manque, on l'ajoute — les
  humeurs maison rejoignent la liste des deux partenaires.

## Sécurité — à lire avant de partager le lien

Le lien secret **est** la clé de l'espace : qui l'obtient peut tout lire et
tout modifier. C'est le compromis assumé du « sans compte ». En pratique :

- Le navigateur **ne parle jamais à Supabase directement.** RLS est activée
  sans aucune policy, et `anon`/`authenticated` n'ont plus aucun droit : la
  seule voie d'accès passe par les route handlers Next.js, côté serveur, avec
  la clé `service_role`. Personne ne peut énumérer les espaces via l'API REST
  publique de Supabase.
- Les pages sont en `noindex` et `referrer: no-referrer`, pour que le slug ne
  fuite ni dans les moteurs de recherche ni dans l'en-tête `Referer`.
- `SUPABASE_SERVICE_ROLE_KEY` n'est **jamais** préfixée `NEXT_PUBLIC_`. Si
  elle l'était, elle serait embarquée dans le bundle client et toute la base
  serait ouverte.
- Un lien perdu est un espace perdu : il n'y a aucun moyen de le retrouver.

## Mise en route

### 1. Supabase

Créer un projet sur [supabase.com](https://supabase.com), puis dans
**SQL Editor → New query**, coller le contenu de
[`supabase/schema.sql`](supabase/schema.sql) et l'exécuter.

Sur une base déjà en service, appliquer à la place les fichiers de
[`supabase/migrations/`](supabase/migrations/) dans l'ordre de leur numéro —
ils sont écrits pour être rejouables sans dommage.

Récupérer dans **Project Settings → API** :

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### 2. En local

```bash
cp .env.example .env.local   # puis y coller les deux valeurs
npm install
npm run dev
```

L'app tourne sur http://localhost:3000.

### 3. Déploiement sur Vercel

```bash
npx vercel
```

Puis, dans **Project Settings → Environment Variables**, ajouter les deux
mêmes variables (Production + Preview) et redéployer.

> Attention aux déploiements *Preview* : ils exposent le même espace via une
> URL différente. Rien de grave, mais le lien à partager reste celui du
> domaine de production.

## Sur l'écran d'accueil du téléphone

L'app s'installe sans passer par un store, et sans Tauri ni Capacitor : c'est
une page web déclarée comme app installable (manifeste + icônes).

- **iOS** — ouvrir l'espace dans **Safari** (Chrome iOS ne sait pas le faire),
  bouton Partager → *Sur l'écran d'accueil*.
- **Android** — Chrome, menu ⋮ → *Installer l'application*.

Elle s'ouvre alors en plein écran, sans barre d'adresse. L'icône démarre sur
**la page depuis laquelle elle a été ajoutée** : il faut donc l'ajouter depuis
son espace `/c/<slug>`, pas depuis l'accueil — c'est pour ça que le manifeste
ne déclare pas de `start_url`.

Deux choses à savoir sur iOS : l'app installée a longtemps eu un stockage
distinct de Safari, donc le choix « qui es-tu ? » peut être redemandé une fois
dans l'app ; et une app retirée de l'écran d'accueil emporte son stockage — le
lien de l'espace, lui, reste la seule chose à ne pas perdre.

## Structure

```
src/app/page.tsx                     page d'accueil, création d'un espace
src/app/c/[slug]/page.tsx            l'espace d'un couple (rendu serveur)
src/app/api/couples/route.ts         POST — créer un espace
src/app/api/couples/[slug]/route.ts  GET / POST / PATCH — lire, mettre à jour
src/components/Dashboard.tsx         orchestration : identité, polling, écriture
src/components/MyStateEditor.tsx     mon état, modifiable
src/components/PartnerCard.tsx       l'état de l'autre, en lecture
src/app/api/couples/[slug]/moods/     POST / DELETE — humeurs maison du couple
src/lib/constants.ts                 humeurs, disponibilités, tags corporels
src/lib/validate.ts                  validation des entrées côté serveur
supabase/schema.sql                  tables, contraintes, verrouillage RLS
```

## Personnaliser

Les listes d'humeurs, de tags corporels et de disponibilités vivent toutes
dans [`src/lib/constants.ts`](src/lib/constants.ts). Ajouter une entrée suffit
— la validation serveur s'appuie sur ces mêmes listes, il n'y a rien à
synchroniser ailleurs. Les couleurs sont des variables CSS en tête de
[`src/app/globals.css`](src/app/globals.css), avec une variante sombre.

## Idées pour la suite

- Historique et courbe d'humeur sur la semaine
- Notifications push quand l'autre passe en « envie de parler »
- Un mot de passe optionnel sur l'espace, pour ne plus dépendre du seul lien
