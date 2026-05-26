-- Seed data — Coin des Étudiants
-- Prérequis : appliquer 001_initial_schema.sql avant ce fichier
-- Le bailleur_id '00000000-0000-0000-0000-000000000001' est un placeholder.
-- En production, remplacez-le par un vrai UUID d'un utilisateur bailleur.

insert into annonces (bailleur_id, titre, description, ville, prix, surface, type_logement, caution, garantie, statut)
values

-- Studio Paris
(
  '00000000-0000-0000-0000-000000000001',
  'Studio meublé 18m² — Paris 13e, proche métro Tolbiac',
  'Beau studio entièrement meublé et équipé au 3e étage sans ascenseur. Idéalement situé à 5 minutes à pied du métro Tolbiac (ligne 7) et à proximité de l''université Paris Cité. Le logement dispose d''une kitchenette équipée (réfrigérateur, plaques, micro-ondes), d''un coin nuit avec lit double, d''une salle de bain avec douche et d''un espace bureau. Charges comprises (eau, internet). Disponible immédiatement.',
  'Paris',
  750.00,
  18.00,
  'studio',
  750.00,
  'visale'
),

-- Studio Lyon
(
  '00000000-0000-0000-0000-000000000001',
  'Studio lumineux 22m² — Lyon 7e, quartier Guillotière',
  'Studio au calme, situé au 2e étage d''un immeuble bien entretenu dans le quartier animé de la Guillotière. À deux pas du tramway T1 et à 10 minutes à vélo de l''université Lyon 2. Le logement est lumineux grâce à ses grandes fenêtres et dispose d''une cuisine séparée équipée, d''un salon avec canapé-lit, d''une chambre avec placards intégrés et d''une salle de bain refaite. Cave privative incluse. Parfait pour un(e) étudiant(e) calme.',
  'Lyon',
  620.00,
  22.00,
  'studio',
  620.00,
  'garant'
),

-- Colocation Bordeaux
(
  '00000000-0000-0000-0000-000000000001',
  'Chambre en colocation — Appartement 80m², Bordeaux Centre',
  'Grande chambre meublée (14m²) dans un appartement de 80m² partagé avec deux autres étudiants. Appartement moderne au cœur de Bordeaux, à 5 minutes à pied de la tram ligne C et à 15 minutes de l''université de Bordeaux. L''appartement dispose d''un grand salon commun, d''une cuisine entièrement équipée et de deux salles de bain. Ambiance studieuse et conviviale. Les colocataires actuels sont en 3e année de médecine et de droit. Charges incluses (eau, électricité, internet fibre).',
  'Bordeaux',
  450.00,
  14.00,
  'colocation',
  450.00,
  'visale'
),

-- Chambre Toulouse
(
  '00000000-0000-0000-0000-000000000001',
  'Chambre indépendante 12m² — Toulouse, résidence étudiante privée',
  'Chambre individuelle dans une résidence étudiante privée, idéale pour les étudiants de l''université Toulouse Paul Sabatier ou de l''INSA Toulouse. La chambre dispose d''un lit simple, d''un bureau, d''une armoire et d''une kitchenette privative. Salle de bain partagée avec une seule autre chambre. La résidence est équipée d''une laverie commune, d''un local vélo sécurisé et d''une salle d''étude. Bus ligne 37 à 3 minutes, connexion fibre optique incluse dans les charges.',
  'Toulouse',
  410.00,
  12.00,
  'chambre',
  410.00,
  'autre'
);
