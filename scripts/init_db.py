import sqlite3
import os

def initialiser_db():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, 'croisieres.db')

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print(f"🔨 Création de la base de données à : {db_path}")

    # ── 1. MAPPING SHORE EXCURSIONS ───────────────────────────────────────────
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS seg_mapping (
            ship_name TEXT PRIMARY KEY,
            ship_id TEXT,
            line_id TEXT,
            line_name TEXT,
            itineraries_json TEXT
        )
    ''')

    # ── 2. CROISIÈRES VOYAGES CONSTELLATION ───────────────────────────────────
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mes_croisieres (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            croisieriste TEXT,
            navire TEXT,
            date_depart TEXT,
            date_retour TEXT,
            nuits INTEGER,
            itineraire TEXT,
            port_depart TEXT,
            ports TEXT,
            prix_int REAL,
            prix_ext REAL,
            prix_balcon REAL,
            prix_vol_int REAL,
            prix_vol_ext REAL,
            prix_vol_balcon REAL,
            boissons TEXT,
            pourboires TEXT,
            wifi TEXT,
            image_itin TEXT,
            image_navire TEXT,
            lien_constellation TEXT,
            lien_excursions TEXT,
            section TEXT,
            derniere_maj DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # ── 3. CIRCUITS EXOTICCA ──────────────────────────────────────────────────
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS circuits_exoticca (
            id TEXT PRIMARY KEY,
            region TEXT,
            destination TEXT,
            titre TEXT,
            jours INTEGER,
            prix_promo REAL,
            prix_regulier REAL,
            economie REAL,
            rabais_pourcentage TEXT,
            image TEXT,
            lien_agent TEXT,
            is_flash_sale BOOLEAN,
            is_new BOOLEAN,
            derniere_maj DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # ── 4. CIRCUITS TRIPOPPO ──────────────────────────────────────────────────
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS circuits_tripoppo (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            region TEXT,
            titre TEXT,
            sous_titre TEXT,
            duree TEXT,
            code_voyage TEXT,
            prix_promo TEXT,
            prix_regulier TEXT,
            badge TEXT,
            description TEXT,
            infos_rapides TEXT,
            circuit_url TEXT UNIQUE,
            image_url TEXT,
            images_carousel TEXT,
            carte_itineraire TEXT,
            pdf_itineraire TEXT,
            inclus TEXT,
            non_inclus TEXT,
            derniere_maj DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tripoppo_itineraire (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            circuit_url TEXT,
            jour TEXT,
            titre TEXT,
            description TEXT,
            images TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tripoppo_dates_prix (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            circuit_url TEXT,
            depart TEXT,
            retour TEXT,
            prix_terrestre TEXT,
            prix_package TEXT,
            liens_resa TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tripoppo_hotels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            circuit_url TEXT,
            nom TEXT,
            nuits TEXT,
            description TEXT,
            image TEXT
        )
    ''')

    conn.commit()
    conn.close()
    print("✅ Base de données initialisée avec succès !")
    print("   Tables créées :")
    print("   - seg_mapping")
    print("   - mes_croisieres")
    print("   - circuits_exoticca")
    print("   - circuits_tripoppo")
    print("   - tripoppo_itineraire")
    print("   - tripoppo_dates_prix")
    print("   - tripoppo_hotels")

if __name__ == "__main__":
    initialiser_db()