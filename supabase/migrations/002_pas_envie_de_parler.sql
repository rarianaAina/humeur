-- ============================================================
-- 002 — Une quatrième disponibilité : « je n'ai pas envie de parler »
--
-- Distincte du besoin de calme : on peut vouloir de la présence
-- sans vouloir des mots.
--
-- À exécuter dans : Supabase Dashboard > SQL Editor > New query.
-- Sans effet si déjà appliquée.
-- ============================================================

-- La contrainte est retrouvée par son contenu plutôt que par son nom :
-- celui-ci dépend de la façon dont la table a été créée.
do $$
declare
  c record;
begin
  for c in
    select con.conname
      from pg_constraint con
      join pg_class rel on rel.oid = con.conrelid
      join pg_namespace ns on ns.oid = rel.relnamespace
     where ns.nspname = 'public'
       and rel.relname = 'states'
       and con.contype = 'c'
       and pg_get_constraintdef(con.oid) ilike '%talk%'
  loop
    execute format('alter table public.states drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.states
  add constraint states_talk_check
  check (talk in ('yes', 'maybe', 'quiet', 'no'));
