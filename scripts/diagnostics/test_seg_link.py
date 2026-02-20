"""
test_seg_link.py — Teste la génération de liens affiliés SEG
pour un navire et une date de départ donnés.

Usage : python test_seg_link.py
"""

import sqlite3
from pathlib import Path
from urllib.parse import urlencode

DB_PATH       = Path(__file__).parent / "../../db/croisieres.db"
SEG_BASE_URL  = "https://www.shoreexcursionsgroup.com"
SEG_AFFILIATE = "portal"
SEG_ID        = "1771540"
SEG_EMAIL     = "yvanblanchette@aeriavoyages.com"

def get_seg_link(ship_name: str, date_depart: str, nights: int) -> str | None:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    try:
        correction = conn.execute("""
            SELECT ship_name_seg
            FROM seg_name_corrections
            WHERE ship_name_constellation = ?
        """, (ship_name,)).fetchone()

        seg_ship_name = correction["ship_name_seg"] if correction else ship_name

        mapping = conn.execute("""
            SELECT ship_id, line_id
            FROM seg_mapping
            WHERE ship_name = ?
        """, (seg_ship_name,)).fetchone()

        if not mapping:
            print(f"  ⚠️  Navire introuvable dans seg_mapping : '{seg_ship_name}'")
            return None

        params = {
            "line":    mapping["line_id"],
            "shipId":  mapping["ship_id"],
            "arrival": date_depart,
            "nights":  nights,
            "source":  SEG_AFFILIATE,
            "id":      SEG_ID,
            "data":    SEG_EMAIL,
        }

        url = f"{SEG_BASE_URL}/results/?{urlencode(params)}"
        return url

    finally:
        conn.close()


def run_tests():
    """Lance une série de tests avec des navires réels de la DB."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    # Récupère 10 croisières variées pour tester
    samples = conn.execute("""
        SELECT DISTINCT navire, date_depart, nuits
        FROM mes_croisieres
        WHERE date_depart IS NOT NULL
        ORDER BY RANDOM()
        LIMIT 10
    """).fetchall()

    print(f"{'='*70}")
    print(f"  TEST DE GÉNÉRATION DE LIENS SEG AFFILIÉS")
    print(f"{'='*70}\n")

    success = 0
    failure = 0

    for row in samples:
        ship = row["navire"]
        date = row["date_depart"]
        print(f"🚢  {ship}  |  {date}")

        link = get_seg_link(ship, date, row["nuits"])
        if link:
            print(f"  ✅  {link}\n")
            success += 1
        else:
            print(f"  ❌  Lien non généré\n")
            failure += 1

    print(f"{'='*70}")
    print(f"  Résultat : {success} succès, {failure} échecs sur {success+failure} tests")
    print(f"{'='*70}")


if __name__ == "__main__":
    run_tests()