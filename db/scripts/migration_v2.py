import sqlite3

DB = "/var/www/aeria-voyages/db/aeria.db"
conn = sqlite3.connect(DB)
cur = conn.cursor()
cur.execute("PRAGMA foreign_keys = OFF")

def col(t, c):
    return c in [r[1] for r in cur.execute(f"PRAGMA table_info({t})")]

def tbl(t):
    return cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (t,)).fetchone()

renames = [
    ("navires",             "lien_cruisemapper",        "lien_source"),
    ("croisieristes",       "lien_cruisemapper",        "lien_source"),
    ("croisieristes",       "fondee_annee",             "annee_fondation"),
    ("croisieristes",       "flotte_nb",                "nb_navires"),
    ("mes_croisieres",      "image_itin",               "image_itineraire"),
    ("circuits_acv",        "name",                     "nom"),
    ("circuits_acv",        "departure_city",           "ville_depart"),
    ("circuits_acv",        "month",                    "mois"),
    ("circuits_acv",        "duration_category",        "categorie_duree"),
    ("circuits_acv",        "price",                    "prix"),
    ("circuits_acv",        "tour_url",                 "url_circuit"),
    ("circuits_acv",        "visited_locations",        "lieux_visites"),
    ("circuits_acv",        "last_updated",             "derniere_maj"),
    ("circuits_exoticca",   "rabais_pourcentage",       "rabais_pct"),
    ("circuits_exoticca",   "image",                    "image_url"),
    ("circuits_exoticca",   "is_flash_sale",            "est_vente_eclair"),
    ("circuits_exoticca",   "is_new",                   "est_nouveau"),
    ("circuits_tripoppo",   "circuit_url",              "url_circuit"),
    ("tripoppo_itineraire", "circuit_url",              "url_circuit"),
    ("tripoppo_dates_prix", "circuit_url",              "url_circuit"),
    ("tripoppo_dates_prix", "depart",                   "date_depart"),
    ("tripoppo_dates_prix", "retour",                   "date_retour"),
    ("tripoppo_hotels",     "circuit_url",              "url_circuit"),
    ("tripoppo_hotels",     "image",                    "image_url"),
    ("seg_mapping",         "ship_name",                "nom_navire"),
    ("seg_mapping",         "ship_id",                  "navire_id"),
    ("seg_mapping",         "line_id",                  "croisieriste_id"),
    ("seg_mapping",         "line_name",                "nom_croisieriste"),
    ("seg_mapping",         "itineraries_json",         "itineraires_json"),
]

for t, old, new in renames:
    if tbl(t) and col(t, old) and not col(t, new):
        cur.execute(f"ALTER TABLE {t} RENAME COLUMN {old} TO {new}")
        print(f"  ok {t}.{old} -> {new}")
    else:
        print(f"  -- skip {t}.{old}")

if tbl("navires") and not col("navires", "scrape_statut"):
    cur.execute("ALTER TABLE navires ADD COLUMN scrape_statut TEXT DEFAULT 'inconnu'")
    cur.execute("""UPDATE navires SET scrape_statut = CASE
        WHEN statut = 'données_insuffisantes' THEN 'insuffisant'
        WHEN scrape_ok = 1 THEN 'ok'
        WHEN scrape_ok = 0 THEN 'erreur'
        ELSE 'inconnu' END""")
    print("  ok navires.scrape_statut ajouté")

if tbl("croisieristes") and not col("croisieristes", "scrape_statut"):
    cur.execute("ALTER TABLE croisieristes ADD COLUMN scrape_statut TEXT DEFAULT 'inconnu'")
    cur.execute("""UPDATE croisieristes SET scrape_statut = CASE
        WHEN scrape_ok = 1 THEN 'ok'
        ELSE 'erreur' END""")
    print("  ok croisieristes.scrape_statut ajouté")

if tbl("seg_name_corrections") and not tbl("seg_correspondances"):
    cur.execute("ALTER TABLE seg_name_corrections RENAME TO seg_correspondances")
    print("  ok seg_name_corrections -> seg_correspondances")

if tbl("seg_correspondances"):
    if col("seg_correspondances", "ship_name_constellation"):
        cur.execute("ALTER TABLE seg_correspondances RENAME COLUMN ship_name_constellation TO nom_constellation")
    if col("seg_correspondances", "ship_name_seg"):
        cur.execute("ALTER TABLE seg_correspondances RENAME COLUMN ship_name_seg TO nom_seg")

indexes = [
    ("idx_navires_statut",           "navires(scrape_statut)"),
    ("idx_navires_croisieriste",     "navires(croisieriste)"),
    ("idx_navires_annee",            "navires(annee_construction)"),
    ("idx_navires_tonnage",          "navires(tonnage)"),
    ("idx_navires_passagers",        "navires(nb_passagers)"),
    ("idx_croisieristes_statut",     "croisieristes(scrape_statut)"),
    ("idx_ports_region",             "ports(region)"),
    ("idx_croisieres_depart",        "mes_croisieres(date_depart)"),
    ("idx_croisieres_navire",        "mes_croisieres(navire)"),
    ("idx_croisieres_croisieriste",  "mes_croisieres(croisieriste)"),
    ("idx_croisieres_prix_int",      "mes_croisieres(prix_int)"),
    ("idx_croisieres_nuits",         "mes_croisieres(nuits)"),
    ("idx_exoticca_destination",     "circuits_exoticca(destination)"),
    ("idx_exoticca_region",          "circuits_exoticca(region)"),
    ("idx_exoticca_prix",            "circuits_exoticca(prix_promo)"),
    ("idx_tripoppo_region",          "circuits_tripoppo(region)"),
    ("idx_tripoppo_itin_url",        "tripoppo_itineraire(url_circuit)"),
    ("idx_tripoppo_dates_url",       "tripoppo_dates_prix(url_circuit)"),
    ("idx_tripoppo_dates_depart",    "tripoppo_dates_prix(date_depart)"),
    ("idx_tripoppo_hotels_url",      "tripoppo_hotels(url_circuit)"),
    ("idx_seg_mapping_croisieriste", "seg_mapping(nom_croisieriste)"),
]

for idx, defn in indexes:
    cur.execute(f"CREATE INDEX IF NOT EXISTS {idx} ON {defn}")

cur.execute("INSERT OR IGNORE INTO _migrations (nom_fichier) VALUES ('migration_v2.py')")
conn.commit()
cur.execute("PRAGMA foreign_keys = ON")
conn.close()
print("\nMigration terminée.")