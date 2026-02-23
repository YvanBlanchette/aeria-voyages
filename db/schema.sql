-- =============================================================================
-- schema.sql — Schéma complet Aeria Voyages
-- Généré le 2026-02-22
--
-- Conventions :
--   - Tout en français (sauf sigles : id, url, iso, lat, lng)
--   - snake_case partout
--   - Clés étrangères activées via PRAGMA foreign_keys = ON
--   - donnees_brutes isolées dans _scrape_cache pour ne pas alourdir les SELECTs
--   - statut avec CHECK constraint
--   - Index sur toutes les colonnes de filtre/jointure courantes
-- =============================================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS _migrations (
    nom_fichier  TEXT PRIMARY KEY,
    applique_le  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CROISIERISTES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS croisieristes (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    nom               TEXT    NOT NULL UNIQUE,
    nom_court         TEXT,
    siege_social      TEXT,
    annee_fondation   INTEGER,
    nb_navires        INTEGER,
    site_web          TEXT,
    description       TEXT,
    logo_url          TEXT,
    lien_source       TEXT,                          -- ex: CruiseMapper URL
    -- Méta scraping
    scrape_statut     TEXT    DEFAULT 'inconnu'
                      CHECK (scrape_statut IN ('ok','insuffisant','erreur','inconnu')),
    scrape_date       TEXT    DEFAULT (date('now'))
);

CREATE INDEX IF NOT EXISTS idx_croisieristes_nom       ON croisieristes(nom);
CREATE INDEX IF NOT EXISTS idx_croisieristes_statut    ON croisieristes(scrape_statut);

-- ─────────────────────────────────────────────────────────────────────────────
-- NAVIRES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS navires (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    nom                TEXT    NOT NULL UNIQUE,
    croisieriste       TEXT,

    -- Construction
    annee_construction INTEGER,
    annee_renovation   INTEGER,
    chantier_naval     TEXT,
    pavillon           TEXT,

    -- Dimensions
    tonnage            INTEGER,
    longueur_m         REAL,
    largeur_m          REAL,
    vitesse_noeuds     REAL,

    -- Capacité
    nb_ponts           INTEGER,
    nb_passagers       INTEGER,
    nb_passagers_max   INTEGER,
    nb_equipage        INTEGER,
    nb_cabines         INTEGER,

    -- Médias
    image_url          TEXT,
    description        TEXT,
    lien_source        TEXT,                         -- ex: CruiseMapper URL

    -- Méta scraping
    scrape_statut      TEXT    DEFAULT 'inconnu'
                       CHECK (scrape_statut IN ('ok','insuffisant','erreur','inconnu')),
    scrape_date        TEXT    DEFAULT (date('now')),

    FOREIGN KEY (croisieriste) REFERENCES croisieristes(nom)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_navires_nom             ON navires(nom);
CREATE INDEX IF NOT EXISTS idx_navires_croisieriste    ON navires(croisieriste);
CREATE INDEX IF NOT EXISTS idx_navires_statut          ON navires(scrape_statut);
CREATE INDEX IF NOT EXISTS idx_navires_annee           ON navires(annee_construction);
CREATE INDEX IF NOT EXISTS idx_navires_tonnage         ON navires(tonnage);
CREATE INDEX IF NOT EXISTS idx_navires_passagers       ON navires(nb_passagers);

-- ─────────────────────────────────────────────────────────────────────────────
-- CACHE SCRAPING (données brutes isolées)
-- Ne pas joindre sauf pour debug / ré-extraction
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS _scrape_cache (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    table_source TEXT    NOT NULL,                   -- 'navires' | 'croisieristes'
    ligne_id     INTEGER NOT NULL,                   -- FK vers la table source
    donnees_json TEXT,                               -- JSON brut du scraper
    mis_a_jour   DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (table_source, ligne_id)
);

CREATE INDEX IF NOT EXISTS idx_scrape_cache_source ON _scrape_cache(table_source, ligne_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- PORTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ports (
    code       TEXT PRIMARY KEY,                     -- IATA/AITA 3 lettres
    nom        TEXT NOT NULL,
    region     TEXT,
    pays       TEXT,
    iso        TEXT,                                 -- ISO 3166-1 alpha-2
    lat        REAL,
    lng        REAL,
    est_usa    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_ports_iso     ON ports(iso);
CREATE INDEX IF NOT EXISTS idx_ports_region  ON ports(region);
CREATE INDEX IF NOT EXISTS idx_ports_est_usa ON ports(est_usa);

-- ─────────────────────────────────────────────────────────────────────────────
-- MES CROISIERES (données Voyages Constellation / SEG)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mes_croisieres (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    croisieriste      TEXT,
    navire            TEXT,
    destination       TEXT,
    date_depart       TEXT,
    date_retour       TEXT,
    nuits             INTEGER,
    itineraire        TEXT,
    port_depart       TEXT,
    ports             TEXT,                          -- JSON array des escales

    -- Prix (CAD)
    prix_int          REAL,
    prix_ext          REAL,
    prix_balcon       REAL,
    prix_vol_int      REAL,
    prix_vol_ext      REAL,
    prix_vol_balcon   REAL,

    -- Inclusions
    boissons          TEXT,
    pourboires        TEXT,
    wifi              TEXT,

    -- Médias & liens
    image_itineraire  TEXT,
    image_navire      TEXT,
    lien_constellation TEXT,
    lien_seg          TEXT,
    section           TEXT,

    derniere_maj      DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (navire)       REFERENCES navires(nom)        ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (croisieriste) REFERENCES croisieristes(nom)  ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (port_depart)  REFERENCES ports(code)         ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_croisieres_destination  ON mes_croisieres(destination);
CREATE INDEX IF NOT EXISTS idx_croisieres_depart       ON mes_croisieres(date_depart);
CREATE INDEX IF NOT EXISTS idx_croisieres_navire       ON mes_croisieres(navire);
CREATE INDEX IF NOT EXISTS idx_croisieres_croisieriste ON mes_croisieres(croisieriste);
CREATE INDEX IF NOT EXISTS idx_croisieres_prix_int     ON mes_croisieres(prix_int);
CREATE INDEX IF NOT EXISTS idx_croisieres_nuits        ON mes_croisieres(nuits);

-- ─────────────────────────────────────────────────────────────────────────────
-- SEG — Correspondances noms navires
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seg_correspondances (
    nom_constellation  TEXT PRIMARY KEY,
    nom_seg            TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS seg_mapping (
    nom_navire         TEXT PRIMARY KEY,
    navire_id          TEXT,
    croisieriste_id    TEXT,
    nom_croisieriste   TEXT,
    itineraires_json   TEXT
);

CREATE INDEX IF NOT EXISTS idx_seg_mapping_croisieriste ON seg_mapping(nom_croisieriste);

-- ─────────────────────────────────────────────────────────────────────────────
-- CIRCUITS — Air Canada Vacations
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS circuits_acv (
    id                TEXT PRIMARY KEY,
    nom               TEXT,
    ville_depart      TEXT,
    destination       TEXT,
    mois              TEXT,
    categorie_duree   TEXT,
    prix              REAL,
    jours             INTEGER,
    nuits             INTEGER,
    image_url         TEXT,
    url_circuit       TEXT,
    lieux_visites     TEXT,                          -- JSON array
    derniere_maj      TEXT
);

CREATE INDEX IF NOT EXISTS idx_acv_destination   ON circuits_acv(destination);
CREATE INDEX IF NOT EXISTS idx_acv_mois          ON circuits_acv(mois);
CREATE INDEX IF NOT EXISTS idx_acv_ville_depart  ON circuits_acv(ville_depart);
CREATE INDEX IF NOT EXISTS idx_acv_prix          ON circuits_acv(prix);
CREATE INDEX IF NOT EXISTS idx_acv_nuits         ON circuits_acv(nuits);

-- ─────────────────────────────────────────────────────────────────────────────
-- CIRCUITS — Exoticca
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS circuits_exoticca (
    id                TEXT PRIMARY KEY,
    region            TEXT,
    destination       TEXT,
    titre             TEXT,
    jours             INTEGER,
    prix_promo        REAL,
    prix_regulier     REAL,
    economie          REAL,
    rabais_pct        TEXT,
    image_url         TEXT,
    lien_agent        TEXT,
    est_vente_eclair  INTEGER DEFAULT 0,
    est_nouveau       INTEGER DEFAULT 0,
    derniere_maj      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exoticca_destination  ON circuits_exoticca(destination);
CREATE INDEX IF NOT EXISTS idx_exoticca_region       ON circuits_exoticca(region);
CREATE INDEX IF NOT EXISTS idx_exoticca_prix         ON circuits_exoticca(prix_promo);
CREATE INDEX IF NOT EXISTS idx_exoticca_vente_eclair ON circuits_exoticca(est_vente_eclair);

-- ─────────────────────────────────────────────────────────────────────────────
-- CIRCUITS — Tripoppo
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS circuits_tripoppo (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    region            TEXT,
    titre             TEXT,
    sous_titre        TEXT,
    duree             TEXT,
    code_voyage       TEXT,
    prix_promo        TEXT,
    prix_regulier     TEXT,
    badge             TEXT,
    description       TEXT,
    infos_rapides     TEXT,                          -- JSON
    url_circuit       TEXT UNIQUE,
    image_url         TEXT,
    images_carousel   TEXT,                          -- JSON array
    carte_itineraire  TEXT,
    pdf_itineraire    TEXT,
    inclus            TEXT,                          -- JSON array
    non_inclus        TEXT,                          -- JSON array
    derniere_maj      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tripoppo_region      ON circuits_tripoppo(region);
CREATE INDEX IF NOT EXISTS idx_tripoppo_url         ON circuits_tripoppo(url_circuit);

CREATE TABLE IF NOT EXISTS tripoppo_itineraire (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    url_circuit TEXT,
    jour        TEXT,
    titre       TEXT,
    description TEXT,
    images      TEXT,                                -- JSON array
    FOREIGN KEY (url_circuit) REFERENCES circuits_tripoppo(url_circuit)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tripoppo_itin_url ON tripoppo_itineraire(url_circuit);

CREATE TABLE IF NOT EXISTS tripoppo_dates_prix (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    url_circuit     TEXT,
    date_depart     TEXT,
    date_retour     TEXT,
    prix_terrestre  TEXT,
    prix_package    TEXT,
    liens_resa      TEXT,                            -- JSON
    FOREIGN KEY (url_circuit) REFERENCES circuits_tripoppo(url_circuit)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tripoppo_dates_url    ON tripoppo_dates_prix(url_circuit);
CREATE INDEX IF NOT EXISTS idx_tripoppo_dates_depart ON tripoppo_dates_prix(date_depart);

CREATE TABLE IF NOT EXISTS tripoppo_hotels (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    url_circuit TEXT,
    nom         TEXT,
    nuits       TEXT,
    description TEXT,
    image_url   TEXT,
    FOREIGN KEY (url_circuit) REFERENCES circuits_tripoppo(url_circuit)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tripoppo_hotels_url ON tripoppo_hotels(url_circuit);

-- ─────────────────────────────────────────────────────────────────────────────
-- Shore Excursions Group — mapping ports
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seg_mapping (
    nom_navire         TEXT PRIMARY KEY,
    navire_id          TEXT,
    croisieriste_id    TEXT,
    nom_croisieriste   TEXT,
    itineraires_json   TEXT
);