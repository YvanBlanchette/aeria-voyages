"""
migrate_add_seg_corrections.py — Script de migration one-shot
Crée la table `seg_name_corrections` et insère les corrections connues.

Usage : python migrate_add_seg_corrections.py
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "../../db/croisieres.db"

CORRECTIONS = [
    ("Independance of the Seas", "Independence of the Seas"),
    ("Celebrity Millenium",      "Celebrity Millennium"),
    ("NCL Pride of America",     "Pride of America"),
    ("Carnival Mardi Gras",      "Mardi Gras"),
    ("Oceania Allura",           "Allura"),
    ("Oceania Insignia",         "Insignia"),
    ("Oceania Marina",           "Marina"),
    ("Oceania Nautica",          "Nautica"),
    ("Oceania Regata",           "Regata"),
    ("Oceania Riviera",          "Riviera"),
    ("Oceania Sirena",           "Sirena"),
    ("Oceania Vista",            "Vista"),
]

def migrate():
    print(f"📂  Connexion à : {DB_PATH.resolve()}")

    if not DB_PATH.exists():
        print("❌  Fichier de base de données introuvable. Vérifiez le chemin.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # ── Création de la table ───────────────────────────────────────────────────
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='seg_name_corrections'")
    if cursor.fetchone():
        print("ℹ️   La table `seg_name_corrections` existe déjà — mise à jour des corrections...")
    else:
        print("🔨  Création de la table `seg_name_corrections`...")
        cursor.execute("""
            CREATE TABLE seg_name_corrections (
                ship_name_constellation TEXT PRIMARY KEY,
                ship_name_seg           TEXT NOT NULL
            )
        """)

    # ── Insertion des corrections ──────────────────────────────────────────────
    print("📝  Insertion des corrections...")
    cursor.executemany("""
        INSERT OR REPLACE INTO seg_name_corrections
            (ship_name_constellation, ship_name_seg)
        VALUES (?, ?)
    """, CORRECTIONS)

    conn.commit()

    # ── Vérification finale ────────────────────────────────────────────────────
    cursor.execute("SELECT ship_name_constellation, ship_name_seg FROM seg_name_corrections ORDER BY ship_name_constellation")
    rows = cursor.fetchall()
    print(f"\n✅  {len(rows)} corrections enregistrées :\n")
    print(f"  {'Voyages Constellation':<35} →  {'SEG'}")
    print(f"  {'-'*60}")
    for constellation, seg in rows:
        print(f"  {constellation:<35} →  {seg}")

    conn.close()
    print("\n🏁  Migration terminée.")

if __name__ == "__main__":
    migrate()