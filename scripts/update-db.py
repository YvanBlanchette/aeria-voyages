"""
migrate_add_circuits_acv.py — Script de migration one-shot
Crée la table `circuits_acv` dans croisieres.db si elle n'existe pas déjà.

Usage : python migrate_add_circuits_acv.py
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "../db/croisieres.db"

def migrate():
    print(f"📂  Connexion à : {DB_PATH.resolve()}")

    if not DB_PATH.exists():
        print("❌  Fichier de base de données introuvable. Vérifiez le chemin.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # ── Vérification avant création ────────────────────────────────────────────
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='circuits_acv'")
    already_exists = cursor.fetchone()

    if already_exists:
        print("ℹ️   La table `circuits_acv` existe déjà. Aucune modification effectuée.")
        conn.close()
        return

    # ── Création de la table ───────────────────────────────────────────────────
    print("🔨  Création de la table `circuits_acv`...")
    cursor.execute("""
        CREATE TABLE circuits_acv (
            id                TEXT PRIMARY KEY,
            name              TEXT,
            departure_city    TEXT,
            destination       TEXT,
            month             TEXT,
            duration_category TEXT,
            price             REAL,
            days              INTEGER,
            nights            INTEGER,
            image_url         TEXT,
            tour_url          TEXT,
            visited_locations TEXT,
            last_updated      TEXT
        )
    """)

    # ── Index utiles pour les requêtes fréquentes ──────────────────────────────
    print("📑  Création des index...")
    cursor.execute("CREATE INDEX idx_acv_destination    ON circuits_acv (destination)")
    cursor.execute("CREATE INDEX idx_acv_month          ON circuits_acv (month)")
    cursor.execute("CREATE INDEX idx_acv_departure_city ON circuits_acv (departure_city)")
    cursor.execute("CREATE INDEX idx_acv_price          ON circuits_acv (price)")

    conn.commit()

    # ── Vérification finale ────────────────────────────────────────────────────
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='circuits_acv'")
    if cursor.fetchone():
        print("✅  Table `circuits_acv` créée avec succès.")
    else:
        print("❌  Échec inattendu de la création.")

    # ── Affichage du schéma pour confirmation ─────────────────────────────────
    cursor.execute("PRAGMA table_info(circuits_acv)")
    cols = cursor.fetchall()
    print("\n📋  Schéma de la table :")
    print(f"  {'#':<4} {'Colonne':<20} {'Type':<10} {'PK'}")
    print(f"  {'-'*45}")
    for col in cols:
        cid, name, col_type, notnull, dflt, pk = col
        print(f"  {cid:<4} {name:<20} {col_type:<10} {'✓' if pk else ''}")

    conn.close()
    print("\n🏁  Migration terminée.")

if __name__ == "__main__":
    migrate()