"""
patch_navires_insuffisants.py
─────────────────────────────
- Corrige les faux positifs du run précédent (1162 navires marqués par erreur)
- Marque comme 'données_insuffisantes' uniquement les navires avec scrape_ok = 0

Usage :
    python3 db/scripts/patch_navires_insuffisants.py           # aperçu seulement
    python3 db/scripts/patch_navires_insuffisants.py --appliquer
"""

import argparse
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "aeria.db"


def run(appliquer: bool) -> None:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    total = conn.execute("SELECT COUNT(*) FROM navires").fetchone()[0]

    faux_positifs = conn.execute(
        "SELECT COUNT(*) FROM navires WHERE statut = 'données_insuffisantes' AND scrape_ok = 1"
    ).fetchone()[0]

    insuffisants = conn.execute(
        "SELECT id, nom FROM navires WHERE scrape_ok = 0 OR scrape_ok IS NULL"
    ).fetchall()

    print(f"\n{'='*55}")
    print(f"  Total navires             : {total}")
    print(f"  À marquer (scrape_ok=0)   : {len(insuffisants)}")
    print(f"  Faux positifs à corriger  : {faux_positifs}")
    print(f"{'='*55}")
    for row in insuffisants:
        print(f"  {row['nom']}")

    if not appliquer:
        print(f"\n⚠️  Mode aperçu — aucune modification effectuée.")
        print(f"   Relancez avec --appliquer pour appliquer.")
        conn.close()
        return

    # 1. Retirer le statut des navires bien scrapés (faux positifs du run précédent)
    conn.execute(
        "UPDATE navires SET statut = NULL WHERE statut = 'données_insuffisantes' AND scrape_ok = 1"
    )

    # 2. Marquer correctement les vrais échecs
    conn.execute(
        "UPDATE navires SET statut = 'données_insuffisantes' WHERE scrape_ok = 0 OR scrape_ok IS NULL"
    )

    conn.commit()
    conn.close()

    print(f"\n✅  {faux_positifs} faux positifs corrigés (statut → NULL).")
    print(f"✅  {len(insuffisants)} navires marqués 'données_insuffisantes'.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Patch navires données insuffisantes")
    parser.add_argument(
        "--appliquer",
        action="store_true",
        help="Applique les modifications (sans ce flag : aperçu seulement)"
    )
    args = parser.parse_args()
    run(appliquer=args.appliquer)