# Coin des Étudiants

Plateforme de logement étudiant — annonces vérifiées, bailleurs de confiance.

## Stack

- **Next.js 14** App Router + TypeScript
- **Supabase** (Auth, Database PostgreSQL, Storage, RLS)
- **TailwindCSS**
- **React Hook Form** + **Zod**
- **Lucide React**

## Setup

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com) et créez un nouveau projet
2. Notez votre **Project URL** et vos clés **anon** et **service_role**

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Éditez `.env.local` et renseignez vos vraies valeurs :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 3. Appliquer le schéma de base de données

**Option A — Via l'interface Supabase (recommandé)**

1. Ouvrez votre projet Supabase → SQL Editor
2. Copiez le contenu de `supabase/migrations/001_initial_schema.sql`
3. Cliquez **Run**

**Option B — Via la CLI Supabase**

```bash
npx supabase login
npx supabase link --project-ref <votre-project-ref>
npx supabase db push
```

### 4. Créer le bucket Storage

Dans Supabase → Storage, créez un bucket nommé **`certificats`** (privé).

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

---

## Structure du projet

```
src/
  app/
    (public)/          # Pages sans connexion requise
    (auth)/            # Pages login/register
    (dashboard)/       # Pages protégées (connecté)
    admin/             # Backoffice admin
  components/          # Composants réutilisables
  lib/
    supabase/          # Clients Supabase (browser/server/middleware)
    validations/       # Schémas Zod
  types/               # Types TypeScript
  middleware.ts        # Protection des routes
supabase/
  migrations/          # Scripts SQL
```

## Rôles utilisateurs

| Rôle | Accès |
|------|-------|
| **Étudiant** | Consulter annonces, contacter bailleurs, signaler |
| **Bailleur** | Publier annonces, gérer ses annonces |
| **Admin** | Vérifier certificats étudiants |

## Statuts de vérification étudiant

| Statut | Score | Description |
|--------|-------|-------------|
| `non_verifie` | 0–70 | Pas encore vérifié |
| `en_attente_admin` | 0–70 | Certificat soumis, en attente |
| `verifie_email` | +30 | Email universitaire confirmé |
| `verifie_admin` | +30 | Certificat approuvé par admin |
