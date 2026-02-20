# diagnostic_seg_matching.py
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../db/croisieres.db")

conn = sqlite3.connect(DB_PATH)

print("=== NOMS DE NAVIRES dans croisieres (Voyages Constellation) ===")
rows = conn.execute("SELECT DISTINCT navire FROM mes_croisieres ORDER BY navire").fetchall()
for r in rows:
    print(f"  {r[0]}")

print("\n=== NOMS DE NAVIRES dans seg_mapping (Shore Excursions Group) ===")
rows = conn.execute("SELECT DISTINCT ship_name FROM seg_mapping ORDER BY ship_name").fetchall()
for r in rows:
    print(f"  {r[0]}")

conn.close()