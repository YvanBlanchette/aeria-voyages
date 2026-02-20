"""
migrate_rename_lien_excursions.py — Script de migration one-shot
Renomme la colonne `lien_excursions` en `lien_seg` dans la table `mes_croisieres`.

Usage : python migrate_rename_lien_excursions.py
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "../../db/croisieres.db"

def migrate():
    print(f"📂  Connexion à : {DB_PATH.resolve()}")

    if not DB_PATH.exists():
        print("❌  Fichier de base de données introuvable.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Vérifier que la colonne existe bien
    cursor.execute("PRAGMA table_info(mes_croisieres)")
    colonnes = [row[1] for row in cursor.fetchall()]

    if "lien_seg" in colonnes:
        print("ℹ️   La colonne `lien_seg` existe déjà. Aucune modification effectuée.")
        conn.close()
        return

    if "lien_excursions" not in colonnes:
        print("❌  La colonne `lien_excursions` est introuvable dans `mes_croisieres`.")
        conn.close()
        return

    # SQLite ne supporte pas RENAME COLUMN avant la version 3.25
    # On vérifie la version
    version = sqlite3.sqlite_version_info
    print(f"ℹ️   Version SQLite : {sqlite3.sqlite_version}")

    if version >= (3, 25, 0):
        print("🔨  Renommage de `lien_excursions` → `lien_seg`...")
        cursor.execute("ALTER TABLE mes_croisieres RENAME COLUMN lien_excursions TO lien_seg")
        conn.commit()
    else:
        # Fallback pour les vieilles versions : recréer la table
        print("⚠️   SQLite trop ancien pour RENAME COLUMN — migration via recréation de table...")
        cursor.execute("ALTER TABLE mes_croisieres RENAME TO mes_croisieres_old")
        
        # Récupérer le schéma original et remplacer le nom de colonne
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='mes_croisieres_old'")
        schema = cursor.fetchone()[0]
        new_schema = schema.replace(
            "mes_croisieres_old", "mes_croisieres"
        ).replace(
            "lien_excursions", "lien_seg"
        )
        cursor.execute(new_schema)
        cursor.execute("INSERT INTO mes_croisieres SELECT * FROM mes_croisieres_old")
        cursor.execute("DROP TABLE mes_croisieres_old")
        conn.commit()

    # Vérification finale
    cursor.execute("PRAGMA table_info(mes_croisieres)")
    colonnes_finales = [row[1] for row in cursor.fetchall()]

    if "lien_seg" in colonnes_finales and "lien_excursions" not in colonnes_finales:
        print("✅  Colonne renommée avec succès.")
    else:
        print("❌  Quelque chose s'est mal passé. Vérifiez manuellement.")

    conn.close()
    print("🏁  Migration terminée.")

if __name__ == "__main__":
    migrate()