create extension if not exists "uuid-ossp";

create type user_role as enum ('etudiant', 'bailleur');
create type statut_verification as enum ('non_verifie', 'en_attente_admin', 'verifie_email', 'verifie_admin');
create type statut_annonce as enum ('active', 'signalee', 'suspendue', 'supprimee');
create type type_logement as enum ('studio', 'colocation', 'chambre');
create type type_garantie as enum ('visale', 'garant', 'autre');

create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          user_role not null,
  nom           text not null,
  prenom        text not null,
  ville         text,
  telephone     text,
  phone_verified boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table profils_etudiants (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references profiles(id) on delete cascade,
  universite            text,
  age                   int,
  photo_url             text,
  email_universitaire   text,
  certificat_url        text,
  statut_verification   statut_verification default 'non_verifie',
  score_profil          int default 0 check (score_profil between 0 and 100),
  verifie_par_admin_id  uuid references profiles(id),
  verifie_le            timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),
  unique(user_id)
);

create table annonces (
  id              uuid primary key default uuid_generate_v4(),
  bailleur_id     uuid not null references profiles(id) on delete cascade,
  titre           text not null,
  description     text not null,
  ville           text not null,
  prix            numeric(8,2) not null,
  surface         numeric(6,2) not null,
  type_logement   type_logement not null,
  caution         numeric(8,2) not null,
  garantie        type_garantie not null,
  statut          statut_annonce default 'active',
  nb_signalements int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table photos_annonces (
  id          uuid primary key default uuid_generate_v4(),
  annonce_id  uuid not null references annonces(id) on delete cascade,
  url         text not null,
  ordre       int default 0,
  created_at  timestamptz default now()
);

create table signalements (
  id          uuid primary key default uuid_generate_v4(),
  annonce_id  uuid not null references annonces(id) on delete cascade,
  etudiant_id uuid not null references profiles(id),
  motif       text,
  created_at  timestamptz default now(),
  unique(annonce_id, etudiant_id)
);

-- RLS
alter table profiles           enable row level security;
alter table profils_etudiants  enable row level security;
alter table annonces           enable row level security;
alter table photos_annonces    enable row level security;
alter table signalements       enable row level security;

-- Policies profiles
create policy "Lecture profil public" on profiles for select using (true);
create policy "Modification propre profil" on profiles for update using (auth.uid() = id);
create policy "Insertion profil à l'inscription" on profiles for insert with check (auth.uid() = id);

-- Policies profils_etudiants
create policy "Lecture profils étudiants" on profils_etudiants for select using (true);
create policy "Insertion profil étudiant" on profils_etudiants for insert with check (auth.uid() = user_id);
create policy "Modification propre profil étudiant" on profils_etudiants for update using (auth.uid() = user_id);

-- Policies annonces
create policy "Lecture annonces actives publique" on annonces for select using (statut = 'active');
create policy "Bailleur crée ses annonces" on annonces for insert with check (auth.uid() = bailleur_id);
create policy "Bailleur modifie ses annonces" on annonces for update using (auth.uid() = bailleur_id);
create policy "Bailleur supprime ses annonces" on annonces for delete using (auth.uid() = bailleur_id);

-- Policies photos
create policy "Lecture photos publique" on photos_annonces for select using (true);
create policy "Bailleur gère ses photos" on photos_annonces for insert with check (
  exists (select 1 from annonces a where a.id = annonce_id and a.bailleur_id = auth.uid())
);

-- Policies signalements
create policy "Étudiant peut signaler" on signalements for insert with check (
  exists (
    select 1 from profils_etudiants pe
    where pe.user_id = auth.uid()
    and pe.statut_verification in ('en_attente_admin', 'verifie_email', 'verifie_admin')
  )
);

-- Trigger score profil automatique
create or replace function calculate_score_profil()
returns trigger as $$
declare score int := 0;
begin
  if new.universite is not null then score := score + 20; end if;
  if new.age is not null then score := score + 10; end if;
  if new.photo_url is not null then score := score + 20; end if;
  if new.email_universitaire is not null then score := score + 20; end if;
  if new.statut_verification in ('verifie_email', 'verifie_admin') then score := score + 30; end if;
  new.score_profil := score;
  return new;
end;
$$ language plpgsql;

create trigger trigger_score_profil
  before insert or update on profils_etudiants
  for each row execute function calculate_score_profil();
