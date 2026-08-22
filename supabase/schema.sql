-- ============================================================
-- Humeur — schéma Supabase
-- À coller dans : Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- Un espace partagé par couple, identifié par un slug secret (128 bits).
create table if not exists public.couples (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name_a        text not null default 'Partenaire A',
  name_b        text not null default 'Partenaire B',
  -- Humeurs inventées par le couple, partagées entre les deux partenaires.
  -- Identifiant de la forme « custom:<libellé> ».
  custom_moods  text[] not null default '{}',
  created_at    timestamptz not null default now(),
  seen_at       timestamptz not null default now()
);

-- L'état courant de chaque partenaire. Une seule ligne par (couple, partenaire) :
-- on écrase à chaque mise à jour, il n'y a pas d'historique en v1.
create table if not exists public.states (
  couple_id   uuid not null references public.couples(id) on delete cascade,
  partner     text not null check (partner in ('a', 'b')),
  -- Plusieurs humeurs peuvent coexister : on est rarement d'une seule pièce.
  moods       text[] not null default '{}',
  energy      smallint not null default 3 check (energy between 1 and 5),
  -- De la plus ouverte à la plus fermée. 'quiet' = pas envie de parler,
  -- mais la présence est bienvenue ; 'no' = besoin d'un moment à soi.
  talk        text not null default 'maybe'
              check (talk in ('yes', 'maybe', 'quiet', 'no')),
  body        text[] not null default '{}',
  note        text check (char_length(note) <= 500),
  updated_at  timestamptz not null default now(),
  primary key (couple_id, partner)
);

create index if not exists couples_slug_idx on public.couples (slug);

-- ------------------------------------------------------------
-- Sécurité
-- ------------------------------------------------------------
-- RLS activée SANS AUCUNE POLICY : les clés `anon` et `authenticated`
-- ne peuvent donc rien lire ni écrire. Tout l'accès passe par les route
-- handlers Next.js, qui utilisent la clé `service_role` (laquelle
-- contourne RLS par conception). C'est ce qui empêche quelqu'un
-- d'énumérer les couples via l'API REST publique de Supabase.
alter table public.couples enable row level security;
alter table public.states  enable row level security;

revoke all on public.couples from anon, authenticated;
revoke all on public.states  from anon, authenticated;
