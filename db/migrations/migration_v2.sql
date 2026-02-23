-- =============================================================================
-- migration_v2.sql — Migration vers le nouveau schéma
-- À exécuter UNE SEULE FOIS sur la DB existante
-- Fait une sauvegarde avant : cp croisieres.db croisieres.db.bak
-- =============================================================================

PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

-- 1. Créer _scrape_cache et y déplacer les données brutes
CREATE TABLE IF NOT EXISTS _scrape_cache (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    table_source TEXT    NOT NULL,
    ligne_id     INTEGER NOT NULL,
    donnees_json TEXT,
    mis_a_jour   DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (table_source, ligne_id)
);

INSERT OR IGNORE INTO _scrape_cache (table_source, ligne_id, donnees_json)
SELECT 'navires', id, donnees_brutes FROM navires WHERE donnees_brutes IS NOT NULL;

INSERT OR IGNORE INTO _scrape_cache (table_source, ligne_id, donnees_json)
SELECT 'croisieristes', id, donnees_brutes FROM croisieristes WHERE donnees_brutes IS NOT NULL;

-- 2. Ajouter colonne scrape_statut aux navires
ALTER TABLE navires ADD COLUMN scrape_statut TEXT DEFAULT 'inconnu';
UPDATE navires SET scrape_statut = CASE
    WHEN statut = 'données_insuffisantes' THEN 'insuffisant'
    WHEN scrape_ok = 1 THEN 'ok'
    WHEN scrape_ok = 0 THEN 'erreur'
    ELSE 'inconnu'
END;

-- 3. Ajouter colonne scrape_statut aux croisieristes
ALTER TABLE croisieristes ADD COLUMN scrape_statut TEXT DEFAULT 'inconnu';
UPDATE croisieristes SET scrape_statut = CASE
    WHEN scrape_ok = 1 THEN 'ok'
    WHEN scrape_ok = 0 THEN 'erreur'
    ELSE 'inconnu'
END;

-- 4. Renommer colonnes incohérentes dans navires
ALTER TABLE navires RENAME COLUMN lien_cruisemapper TO lien_source;

-- 5. Renommer colonnes incohérentes dans croisieristes
ALTER TABLE croisieristes RENAME COLUMN lien_cruisemapper TO lien_source;
ALTER TABLE croisieristes RENAME COLUMN fondee_annee     TO annee_fondation;
ALTER TABLE croisieristes RENAME COLUMN flotte_nb        TO nb_navires;

-- 6. Renommer colonnes dans mes_croisieres
ALTER TABLE mes_croisieres RENAME COLUMN image_itin  TO image_itineraire;
ALTER TABLE mes_croisieres RENAME COLUMN lien_constellation TO lien_constellation;

-- 7. Renommer seg_name_corrections → seg_correspondances
ALTER TABLE seg_name_corrections RENAME TO seg_correspondances;
ALTER TABLE seg_correspondances RENAME COLUMN ship_name_constellation TO nom_constellation;
ALTER TABLE seg_correspondances RENAME COLUMN ship_name_seg           TO nom_seg;

-- 8. Renommer colonnes seg_mapping
ALTER TABLE seg_mapping RENAME COLUMN ship_name        TO nom_navire;
ALTER TABLE seg_mapping RENAME COLUMN ship_id          TO navire_id;
ALTER TABLE seg_mapping RENAME COLUMN line_id          TO croisieriste_id;
ALTER TABLE seg_mapping RENAME COLUMN line_name        TO nom_croisieriste;
ALTER TABLE seg_mapping RENAME COLUMN itineraries_json TO itineraires_json;

-- 9. Renommer colonnes circuits_acv
ALTER TABLE circuits_acv RENAME COLUMN name              TO nom;
ALTER TABLE circuits_acv RENAME COLUMN departure_city    TO ville_depart;
ALTER TABLE circuits_acv RENAME COLUMN month             TO mois;
ALTER TABLE circuits_acv RENAME COLUMN duration_category TO categorie_duree;
ALTER TABLE circuits_acv RENAME COLUMN price             TO prix;
ALTER TABLE circuits_acv RENAME COLUMN tour_url          TO url_circuit;
ALTER TABLE circuits_acv RENAME COLUMN visited_locations TO lieux_visites;
ALTER TABLE circuits_acv RENAME COLUMN last_updated      TO derniere_maj;

-- 10. Renommer colonnes circuits_exoticca
ALTER TABLE circuits_exoticca RENAME COLUMN rabais_pourcentage TO rabais_pct;
ALTER TABLE circuits_exoticca RENAME COLUMN image              TO image_url;
ALTER TABLE circuits_exoticca RENAME COLUMN lien_agent         TO lien_agent;
ALTER TABLE circuits_exoticca RENAME COLUMN is_flash_sale      TO est_vente_eclair;
ALTER TABLE circuits_exoticca RENAME COLUMN is_new             TO est_nouveau;

-- 11. Renommer colonnes circuits_tripoppo
ALTER TABLE circuits_tripoppo RENAME COLUMN circuit_url TO url_circuit;

-- 12. Renommer colonnes tripoppo_itineraire / dates_prix / hotels
ALTER TABLE tripoppo_itineraire  RENAME COLUMN circuit_url TO url_circuit;
ALTER TABLE tripoppo_dates_prix  RENAME COLUMN circuit_url TO url_circuit;
ALTER TABLE tripoppo_dates_prix  RENAME COLUMN depart      TO date_depart;
ALTER TABLE tripoppo_dates_prix  RENAME COLUMN retour      TO date_retour;
ALTER TABLE tripoppo_hotels      RENAME COLUMN circuit_url TO url_circuit;
ALTER TABLE tripoppo_hotels      RENAME COLUMN image       TO image_url;

-- 13. Nouveaux index
CREATE INDEX IF NOT EXISTS idx_scrape_cache_source     ON _scrape_cache(table_source, ligne_id);
CREATE INDEX IF NOT EXISTS idx_croisieristes_statut    ON croisieristes(scrape_statut);
CREATE INDEX IF NOT EXISTS idx_navires_statut          ON navires(scrape_statut);
CREATE INDEX IF NOT EXISTS idx_navires_croisieriste    ON navires(croisieriste);
CREATE INDEX IF NOT EXISTS idx_navires_annee           ON navires(annee_construction);
CREATE INDEX IF NOT EXISTS idx_navires_tonnage         ON navires(tonnage);
CREATE INDEX IF NOT EXISTS idx_navires_passagers       ON navires(nb_passagers);
CREATE INDEX IF NOT EXISTS idx_ports_region            ON ports(region);
CREATE INDEX IF NOT EXISTS idx_croisieres_depart       ON mes_croisieres(date_depart);
CREATE INDEX IF NOT EXISTS idx_croisieres_navire       ON mes_croisieres(navire);
CREATE INDEX IF NOT EXISTS idx_croisieres_croisieriste ON mes_croisieres(croisieriste);
CREATE INDEX IF NOT EXISTS idx_croisieres_prix_int     ON mes_croisieres(prix_int);
CREATE INDEX IF NOT EXISTS idx_croisieres_nuits        ON mes_croisieres(nuits);
CREATE INDEX IF NOT EXISTS idx_exoticca_destination    ON circuits_exoticca(destination);
CREATE INDEX IF NOT EXISTS idx_exoticca_region         ON circuits_exoticca(region);
CREATE INDEX IF NOT EXISTS idx_exoticca_prix           ON circuits_exoticca(prix_promo);
CREATE INDEX IF NOT EXISTS idx_exoticca_vente_eclair   ON circuits_exoticca(est_vente_eclair);
CREATE INDEX IF NOT EXISTS idx_tripoppo_region         ON circuits_tripoppo(region);
CREATE INDEX IF NOT EXISTS idx_tripoppo_itin_url       ON tripoppo_itineraire(url_circuit);
CREATE INDEX IF NOT EXISTS idx_tripoppo_dates_url      ON tripoppo_dates_prix(url_circuit);
CREATE INDEX IF NOT EXISTS idx_tripoppo_dates_depart   ON tripoppo_dates_prix(date_depart);
CREATE INDEX IF NOT EXISTS idx_tripoppo_hotels_url     ON tripoppo_hotels(url_circuit);
CREATE INDEX IF NOT EXISTS idx_seg_mapping_croisieriste ON seg_mapping(nom_croisieriste);
CREATE INDEX IF NOT EXISTS idx_acv_nuits               ON circuits_acv(prix);

-- 14. Enregistrer la migration
INSERT OR IGNORE INTO _migrations (nom_fichier) VALUES ('migration_v2.sql');

COMMIT;
PRAGMA foreign_keys = ON;