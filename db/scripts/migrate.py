#!/usr/bin/env python3
"""
migrate.py — Runner de migrations SQLite
Usage: python migrate.py (depuis n'importe où)
"""

import sqlite3
import os
import sys

BASE_DIR       = os.path.dirname(os.path.abspath(__file__))
DB_PATH        = os.path.join(BASE_DIR, "..", "croisieres.db")
MIGRATIONS_DIR = os.path.join(BASE_DIR, "..", "migrations")

def run_migrations():
    if not os.path.exists(DB_PATH):
        print(f"❌ Base de données introuvable: {DB_PATH}")
        sys.exit(1)

    if not os.path.exists(MIGRATIONS_DIR):
        print(f"❌ Dossier migrations introuvable: {MIGRATIONS_DIR}")
        sys.exit(1)

    conn = sqlite3.connect(DB_PATH)
    cur  = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS _migrations (
            filename   TEXT PRIMARY KEY,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()

    sql_files = sorted([f for f in os.listdir(MIGRATIONS_DIR) if f.endswith(".sql")])

    if not sql_files:
        print("Aucun fichier .sql trouvé dans", MIGRATIONS_DIR)
        sys.exit(0)

    print(f"📂 {len(sql_files)} migration(s) trouvée(s)\n")

    applied = 0
    skipped = 0

    for filename in sql_files:
        cur.execute("SELECT 1 FROM _migrations WHERE filename = ?", (filename,))
        if cur.fetchone():
            print(f"  ⏭️  {filename} (déjà appliquée)")
            skipped += 1
            continue

        filepath = os.path.join(MIGRATIONS_DIR, filename)
        sql = open(filepath, "r", encoding="utf-8").read()

        print(f"  ⚙️  {filename}...", end=" ")
        try:
            cur.executescript(sql)
            cur.execute("INSERT INTO _migrations (filename) VALUES (?)", (filename,))
            conn.commit()
            print("✅")
            applied += 1
        except Exception as e:
            conn.rollback()
            print(f"❌\n     Erreur: {e}")
            sys.exit(1)

    print(f"\n{'─'*40}")
    print(f"✅ {applied} appliquée(s), ⏭️  {skipped} ignorée(s)")

    print(f"\n📊 Vérification:")
    checks = [
        ("Table ports créée",  "SELECT COUNT(*) FROM ports"),
        ("Ports US flagués",   "SELECT COUNT(*) FROM ports WHERE est_usa = 1"),
        ("Total croisières",   "SELECT COUNT(*) FROM mes_croisieres"),
    ]
    for label, query in checks:
        try:
            cur.execute(query)
            print(f"   {label}: {cur.fetchone()[0]}")
        except Exception as e:
            print(f"   {label}: ❌ {e}")

    conn.close()

if __name__ == "__main__":
    run_migrations()