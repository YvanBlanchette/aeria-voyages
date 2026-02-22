#!/usr/bin/env python3
"""
revert.py — Annule la dernière migration appliquée
Usage: python revert.py (depuis n'importe où)
"""

import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, "..", "croisieres.db")

db = sqlite3.connect(DB_PATH)

cur = db.execute("SELECT filename FROM _migrations ORDER BY filename DESC LIMIT 1")
row = cur.fetchone()

if row:
    filename = row[0]
    db.execute("DELETE FROM _migrations WHERE filename = ?", (filename,))
    db.commit()
    print(f"Migration annulée: {filename}")
else:
    print("Aucune migration à annuler.")

cur = db.execute("SELECT filename FROM _migrations ORDER BY filename")
print("Migrations restantes:")
for row in cur.fetchall():
    print(f"  {row[0]}")

db.close()