-- Fix: signalements.etudiant_id had no ON DELETE action, blocking user deletion.
-- When auth.users is deleted → profiles cascades → signalements FK blocked with null-constraint error.
ALTER TABLE signalements
  DROP CONSTRAINT signalements_etudiant_id_fkey;

ALTER TABLE signalements
  ADD CONSTRAINT signalements_etudiant_id_fkey
  FOREIGN KEY (etudiant_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix: profils_etudiants.verifie_par_admin_id had no ON DELETE action,
-- which would block deletion of any admin who verified students.
ALTER TABLE profils_etudiants
  DROP CONSTRAINT IF EXISTS profils_etudiants_verifie_par_admin_id_fkey;

ALTER TABLE profils_etudiants
  ADD CONSTRAINT profils_etudiants_verifie_par_admin_id_fkey
  FOREIGN KEY (verifie_par_admin_id) REFERENCES profiles(id) ON DELETE SET NULL;
