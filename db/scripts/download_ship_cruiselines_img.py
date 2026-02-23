#!/usr/bin/env python3
"""
download_images.py — Télécharge logos croisieristes + images navires depuis CruiseMapper
et les stocke localement pour ne pas dépendre de CruiseMapper.

Structure créée :
    public/images/croisieristes/<id>.<ext>
    public/images/navires/<id>.<ext>

Les colonnes logo_url / image_url de la DB sont mises à jour avec le chemin local.

Usage :
    python3 db/scripts/download_images.py              # tout télécharger
    python3 db/scripts/download_images.py --navires    # navires seulement
    python3 db/scripts/download_images.py --croisieristes  # logos seulement
    python3 db/scripts/download_images.py --manquants  # uniquement ceux pas encore téléchargés
    python3 db/scripts/download_images.py --stats      # stats
"""

import sqlite3, time, argparse, hashlib, mimetypes
from pathlib import Path
from urllib.parse import urlparse

import requests

# ── Config ────────────────────────────────────────────────────────────────────

DB_PATH = Path('/var/www/aeria-voyages/db/aeria.db')
PUBLIC_DIR = Path('/var/www/aeria-voyages/public')
DIR_NAV      = PUBLIC_DIR / "images" / "navires"
DIR_CROIS    = PUBLIC_DIR / "images" / "croisieristes"
DELAY        = 0.5
TIMEOUT      = 20
BASE_URL     = "https://www.cruisemapper.com"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer":    "https://www.cruisemapper.com/",
    "Accept":     "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def full_url(href: str) -> str:
    if not href:
        return ""
    return href if href.startswith("http") else BASE_URL + href

def ext_from_url(url: str, content_type: str = "") -> str:
    """Détermine l'extension depuis l'URL ou le Content-Type."""
    path = urlparse(url).path
    suffix = Path(path).suffix.lower()
    if suffix in (".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"):
        return suffix
    if content_type:
        ext = mimetypes.guess_extension(content_type.split(";")[0].strip())
        if ext:
            return ext.replace(".jpe", ".jpg")
    return ".jpg"

def slug(name: str) -> str:
    """Transforme un nom en slug safe pour filesystem."""
    import re
    return re.sub(r'[^\w-]', '_', name.strip().lower())[:80]

def download_image(session: requests.Session, url: str, dest_dir: Path,
                   filename_base: str) -> str | None:
    """
    Télécharge une image vers dest_dir/filename_base.<ext>.
    Retourne le chemin relatif depuis public/ ou None si échec.
    """
    if not url:
        return None
    url = full_url(url)

    try:
        r = session.get(url, headers=HEADERS, timeout=TIMEOUT, stream=True)
        if r.status_code != 200:
            return None

        content_type = r.headers.get("Content-Type", "")
        if "text/html" in content_type:
            return None  # CruiseMapper redirige vers une page HTML si image absente

        ext      = ext_from_url(url, content_type)
        filename = f"{filename_base}{ext}"
        filepath = dest_dir / filename

        with open(filepath, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)

        # Vérifier taille minimale (évite les images vides / placeholder)
        if filepath.stat().st_size < 500:
            filepath.unlink()
            return None

        # Chemin relatif depuis public/
        return str(filepath.relative_to(PUBLIC_DIR))

    except Exception:
        return None

# ── Téléchargement navires ────────────────────────────────────────────────────

def dl_navires(conn: sqlite3.Connection, session: requests.Session,
               manquants_only: bool) -> None:
    DIR_NAV.mkdir(parents=True, exist_ok=True)
    cur = conn.cursor()

    if manquants_only:
        cur.execute("""
            SELECT id, nom, image_url FROM navires
            WHERE image_url IS NOT NULL
              AND image_url NOT LIKE 'images/%'
              AND image_url != ''
        """)
    else:
        cur.execute("""
            SELECT id, nom, image_url FROM navires
            WHERE image_url IS NOT NULL AND image_url != ''
        """)

    rows = cur.fetchall()
    print(f"\n🚢 Téléchargement images navires : {len(rows)} à traiter\n")

    ok = ko = skip = 0
    for i, (nid, nom, url) in enumerate(rows, 1):
        print(f"  [{i:4d}/{len(rows)}] {nom[:50]:<50}", end=" ", flush=True)

        filename_base = f"{nid}_{slug(nom)}"
        local_path = download_image(session, url, DIR_NAV, filename_base)

        if local_path:
            cur.execute("UPDATE navires SET image_url = ? WHERE id = ?",
                        (local_path, nid))
            conn.commit()
            print(f"✅ {local_path}")
            ok += 1
        else:
            print("⚠️  échec")
            ko += 1

        time.sleep(DELAY)

    print(f"\n  → ✅ {ok}  ⚠️  {ko}  ignorés {skip}")

# ── Téléchargement logos croisieristes ───────────────────────────────────────

def dl_croisieristes(conn: sqlite3.Connection, session: requests.Session,
                     manquants_only: bool) -> None:
    DIR_CROIS.mkdir(parents=True, exist_ok=True)
    cur = conn.cursor()

    if manquants_only:
        cur.execute("""
            SELECT id, nom, logo_url FROM croisieristes
            WHERE logo_url IS NOT NULL
              AND logo_url NOT LIKE 'images/%'
              AND logo_url != ''
        """)
    else:
        cur.execute("""
            SELECT id, nom, logo_url FROM croisieristes
            WHERE logo_url IS NOT NULL AND logo_url != ''
        """)

    rows = cur.fetchall()
    print(f"\n🏢 Téléchargement logos croisieristes : {len(rows)} à traiter\n")

    ok = ko = 0
    for i, (cid, nom, url) in enumerate(rows, 1):
        print(f"  [{i:3d}/{len(rows)}] {nom[:50]:<50}", end=" ", flush=True)

        filename_base = f"{cid}_{slug(nom)}"
        local_path = download_image(session, url, DIR_CROIS, filename_base)

        if local_path:
            cur.execute("UPDATE croisieristes SET logo_url = ? WHERE id = ?",
                        (local_path, cid))
            conn.commit()
            print(f"✅ {local_path}")
            ok += 1
        else:
            print("⚠️  échec")
            ko += 1

        time.sleep(DELAY)

    print(f"\n  → ✅ {ok}  ⚠️  {ko}")

# ── Stats ─────────────────────────────────────────────────────────────────────

def stats(conn: sqlite3.Connection) -> None:
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM navires WHERE image_url IS NOT NULL AND image_url != ''")
    nav_total = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM navires WHERE image_url LIKE 'images/%'")
    nav_local = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM croisieristes WHERE logo_url IS NOT NULL AND logo_url != ''")
    cr_total = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM croisieristes WHERE logo_url LIKE 'images/%'")
    cr_local = cur.fetchone()[0]

    # Taille sur disque
    nav_size  = sum(f.stat().st_size for f in DIR_NAV.glob("*")  if f.is_file()) if DIR_NAV.exists()  else 0
    cr_size   = sum(f.stat().st_size for f in DIR_CROIS.glob("*") if f.is_file()) if DIR_CROIS.exists() else 0

    print(f"\n{'='*50}")
    print(f"  Navires    : {nav_local}/{nav_total} images locales  ({nav_size/1024/1024:.1f} MB)")
    print(f"  Croisieristes : {cr_local}/{cr_total} logos locaux  ({cr_size/1024/1024:.1f} MB)")
    print(f"{'='*50}\n")

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(description="Téléchargement images CruiseMapper → local")
    ap.add_argument("--navires",       action="store_true", help="Navires seulement")
    ap.add_argument("--croisieristes", action="store_true", help="Logos croisieristes seulement")
    ap.add_argument("--manquants",     action="store_true", help="Uniquement les images pas encore téléchargées")
    ap.add_argument("--stats",         action="store_true", help="Afficher les stats")
    args = ap.parse_args()

    print("📸 Téléchargement images — CruiseMapper → local\n")

    conn    = sqlite3.connect(DB_PATH)
    session = requests.Session()

    if args.stats:
        stats(conn)
        conn.close()
        return

    do_nav   = args.navires   or (not args.navires and not args.croisieristes)
    do_crois = args.croisieristes or (not args.navires and not args.croisieristes)

    if do_crois:
        dl_croisieristes(conn, session, manquants_only=args.manquants)

    if do_nav:
        dl_navires(conn, session, manquants_only=args.manquants)

    stats(conn)
    conn.close()
    print("\n✅ Terminé.")

if __name__ == "__main__":
    main()