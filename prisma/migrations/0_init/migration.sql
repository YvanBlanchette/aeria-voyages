-- CreateTable
CREATE TABLE "_migrations" (
    "filename" TEXT PRIMARY KEY,
    "applied_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ai_search_cache" (
    "cache_key" TEXT NOT NULL PRIMARY KEY,
    "data" TEXT NOT NULL,
    "created_at" TEXT NOT NULL DEFAULT 'datetime(''now'')'
);

-- CreateTable
CREATE TABLE "circuits_acv" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT,
    "ville_depart" TEXT,
    "destination" TEXT,
    "mois" TEXT,
    "categorie_duree" TEXT,
    "prix" REAL,
    "jours" INTEGER,
    "nuits" INTEGER,
    "image_url" TEXT,
    "url_circuit" TEXT,
    "lieux_visites" TEXT,
    "derniere_maj" TEXT
);

-- CreateTable
CREATE TABLE "circuits_exoticca" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "region" TEXT,
    "destination" TEXT,
    "titre" TEXT,
    "jours" INTEGER,
    "prix_promo" REAL,
    "prix_regulier" REAL,
    "economie" REAL,
    "rabais_pct" TEXT,
    "image_url" TEXT,
    "lien_agent" TEXT,
    "est_vente_eclair" BOOLEAN,
    "est_nouveau" BOOLEAN,
    "derniere_maj" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "circuits_tripoppo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "region" TEXT,
    "titre" TEXT,
    "sous_titre" TEXT,
    "duree" TEXT,
    "code_voyage" TEXT,
    "prix_promo" TEXT,
    "prix_regulier" TEXT,
    "badge" TEXT,
    "description" TEXT,
    "infos_rapides" TEXT,
    "url_circuit" TEXT,
    "image_url" TEXT,
    "images_carousel" TEXT,
    "carte_itineraire" TEXT,
    "pdf_itineraire" TEXT,
    "inclus" TEXT,
    "non_inclus" TEXT,
    "derniere_maj" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "croisieristes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "nom_court" TEXT,
    "siege_social" TEXT,
    "annee_fondation" INTEGER,
    "nb_navires" INTEGER,
    "site_web" TEXT,
    "description" TEXT,
    "logo_url" TEXT,
    "lien_source" TEXT,
    "scrape_ok" INTEGER DEFAULT 0,
    "scrape_date" TEXT DEFAULT 'date(''now'')',
    "donnees_brutes" TEXT
);

-- CreateTable
CREATE TABLE "mes_croisieres" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "croisieriste" TEXT,
    "navire" TEXT,
    "date_depart" TEXT,
    "date_retour" TEXT,
    "nuits" INTEGER,
    "itineraire" TEXT,
    "port_depart" TEXT,
    "ports" TEXT,
    "prix_int" REAL,
    "prix_ext" REAL,
    "prix_balcon" REAL,
    "prix_vol_int" REAL,
    "prix_vol_ext" REAL,
    "prix_vol_balcon" REAL,
    "boissons" TEXT,
    "pourboires" TEXT,
    "wifi" TEXT,
    "image_itineraire" TEXT,
    "image_navire" TEXT,
    "lien_constellation" TEXT,
    "lien_seg" TEXT,
    "section" TEXT,
    "derniere_maj" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "destination" TEXT
);

-- CreateTable
CREATE TABLE "navires" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "croisieriste" TEXT,
    "annee_construction" INTEGER,
    "annee_renovation" INTEGER,
    "chantier_naval" TEXT,
    "pavillon" TEXT,
    "tonnage" INTEGER,
    "longueur_m" REAL,
    "largeur_m" REAL,
    "vitesse_noeuds" REAL,
    "nb_ponts" INTEGER,
    "nb_passagers" INTEGER,
    "nb_passagers_max" INTEGER,
    "nb_equipage" INTEGER,
    "nb_cabines" INTEGER,
    "image_url" TEXT,
    "description" TEXT,
    "lien_source" TEXT,
    "scrape_ok" INTEGER DEFAULT 0,
    "scrape_date" TEXT DEFAULT 'date(''now'')',
    "donnees_brutes" TEXT,
    "statut" TEXT,
    "scrape_statut" TEXT DEFAULT 'inconnu'
);

-- CreateTable
CREATE TABLE "ports" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "region" TEXT,
    "pays" TEXT,
    "iso" TEXT,
    "lat" REAL,
    "lng" REAL,
    "est_usa" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "seg_mapping" (
    "nom_navire" TEXT NOT NULL PRIMARY KEY,
    "navire_id" TEXT,
    "croisieriste_id" TEXT,
    "nom_croisieriste" TEXT,
    "itineraires_json" TEXT
);

-- CreateTable
CREATE TABLE "seg_name_corrections" (
    "ship_name_constellation" TEXT NOT NULL PRIMARY KEY,
    "ship_name_seg" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "tripoppo_dates_prix" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url_circuit" TEXT,
    "date_depart" TEXT,
    "date_retour" TEXT,
    "prix_terrestre" TEXT,
    "prix_package" TEXT,
    "liens_resa" TEXT
);

-- CreateTable
CREATE TABLE "tripoppo_hotels" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url_circuit" TEXT,
    "nom" TEXT,
    "nuits" TEXT,
    "description" TEXT,
    "image_url" TEXT
);

-- CreateTable
CREATE TABLE "tripoppo_itineraire" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url_circuit" TEXT,
    "jour" TEXT,
    "titre" TEXT,
    "description" TEXT,
    "images" TEXT
);

-- CreateIndex
CREATE INDEX "idx_acv_price" ON "circuits_acv"("prix");

-- CreateIndex
CREATE INDEX "idx_acv_departure_city" ON "circuits_acv"("ville_depart");

-- CreateIndex
CREATE INDEX "idx_acv_month" ON "circuits_acv"("mois");

-- CreateIndex
CREATE INDEX "idx_acv_destination" ON "circuits_acv"("destination");

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_circuits_tripoppo_1" ON "circuits_tripoppo"("url_circuit");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_croisieristes_1" ON "croisieristes"("nom");
Pragma writable_schema=0;

-- CreateIndex
CREATE INDEX "idx_croisieristes_nom" ON "croisieristes"("nom");

-- CreateIndex
CREATE INDEX "idx_croisieres_destination" ON "mes_croisieres"("destination");

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_navires_1" ON "navires"("nom");
Pragma writable_schema=0;

-- CreateIndex
CREATE INDEX "idx_navires_nom" ON "navires"("nom");

-- CreateIndex
CREATE INDEX "idx_ports_iso" ON "ports"("iso");

-- CreateIndex
CREATE INDEX "idx_ports_est_usa" ON "ports"("est_usa");

