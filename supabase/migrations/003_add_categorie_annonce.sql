-- Migration 003 : Ajout du champ categorie sur la table annonces

-- Créer le type enum pour les catégories
DO $$ BEGIN
  CREATE TYPE categorie_annonce AS ENUM ('logement', 'emploi', 'stage', 'alternance', 'service');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Ajouter la colonne categorie avec la valeur par défaut 'logement'
ALTER TABLE annonces
  ADD COLUMN IF NOT EXISTS categorie categorie_annonce NOT NULL DEFAULT 'logement';

-- Mettre à jour les annonces existantes sans catégorie (déjà couvert par DEFAULT, mais par sécurité)
UPDATE annonces SET categorie = 'logement' WHERE categorie IS NULL;
