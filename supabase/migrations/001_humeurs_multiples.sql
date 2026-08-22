-- ============================================================
-- 001 — Plusieurs humeurs à la fois, et humeurs personnalisées
--
-- À exécuter dans : Supabase Dashboard > SQL Editor > New query.
-- Sans effet si déjà appliquée (tout est conditionnel).
-- ============================================================

-- Les humeurs inventées par le couple, partagées entre les deux.
-- Un identifiant personnalisé a la forme « custom:<libellé> ».
alter table public.couples
  add column if not exists custom_moods text[] not null default '{}';

-- On passe de « une humeur » à « autant d'humeurs qu'on veut ».
alter table public.states
  add column if not exists moods text[] not null default '{}';

-- Reprise des données existantes : l'humeur unique devient un tableau
-- d'un élément. Le filtre sur cardinality évite d'écraser une reprise
-- déjà faite si la migration est rejouée.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'states' and column_name = 'mood'
  ) then
    update public.states
       set moods = array[mood]
     where mood is not null
       and cardinality(moods) = 0;

    alter table public.states drop column mood;
  end if;
end $$;
