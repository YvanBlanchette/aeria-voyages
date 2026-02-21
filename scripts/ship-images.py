"""
download_ship_images.py — Télécharge toutes les images de navires depuis la DB
et les stocke localement pour transfert vers le serveur.

Usage : python3 download_ship_images.py
"""

import sqlite3
import requests
import time
import random
from pathlib import Path
from urllib.parse import urlparse

DB_PATH     = Path(__file__).parent / "../db/croisieres.db"
OUTPUT_DIR  = Path(__file__).parent / "../public_assets/img/navires"
API_BASE    = "https://aeriavoyages.com/img/navires"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://www.voyagesconstellation.com/",
}

def nom_fichier(url: str) -> str:
    return Path(urlparse(url).path).name

def telecharger_image(url: str, dest: Path) -> bool:
    try:
        r = requests.get(url, headers=HEADERS, timeout=15, stream=True)
        if r.status_code == 200:
            with open(dest, "wb") as f:
                for chunk in r.iter_content(8192):
                    f.write(chunk)
            return True
        else:
            print(f"    ⚠️  HTTP {r.status_code} — {url}")
            return False
    except Exception as e:
        print(f"    ❌ Erreur : {e}")
        return False

def tester_connexion(url: str) -> bool:
    """Teste le téléchargement d'une seule image avant de lancer la boucle complète."""
    print(f"🧪 Test de connexion sur : {url}")
    test_dest = Path(__file__).parent / "_test_image.webp"
    try:
        r = requests.get(url, headers=HEADERS, timeout=15, stream=True)
        print(f"   Status      : {r.status_code}")
        print(f"   Content-Type: {r.headers.get('Content-Type', 'inconnu')}")
        if r.status_code == 200:
            with open(test_dest, "wb") as f:
                for chunk in r.iter_content(8192):
                    f.write(chunk)
            taille = test_dest.stat().st_size
            test_dest.unlink()
            print(f"   Taille reçue: {taille} bytes")
            if taille > 1000:
                print(f"   ✅ Test réussi — téléchargement fonctionnel !\n")
                return True
            else:
                print(f"   ❌ Fichier trop petit ({taille} bytes) — probablement une page d'erreur\n")
                return False
        else:
            print(f"   ❌ Échec HTTP {r.status_code}\n")
            return False
    except Exception as e:
        print(f"   ❌ Erreur : {e}\n")
        if test_dest.exists():
            test_dest.unlink()
        return False

def mettre_a_jour_db(cursor, conn, ancienne_url: str, nouvelle_url: str):
    cursor.execute("""
        UPDATE mes_croisieres 
        SET image_navire = ?
        WHERE image_navire = ?
    """, (nouvelle_url, ancienne_url))
    conn.commit()

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"📁 Dossier de sortie : {OUTPUT_DIR.resolve()}\n")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT DISTINCT image_navire 
        FROM mes_croisieres 
        WHERE image_navire IS NOT NULL AND image_navire != ''
        AND image_navire LIKE 'http%voyagesconstellation%'
        ORDER BY image_navire
    """)
    urls = [row[0] for row in cursor.fetchall()]
    print(f"🚢 {len(urls)} images de navires à télécharger\n")

    if not urls:
        print("Aucune image à télécharger.")
        conn.close()
        return

    # ── Test rapide avant de lancer les 147 ──────────────────────────────────
    if not tester_connexion(urls[0]):
        print("⛔ Test échoué — téléchargement annulé.")
        print("   Vérifie ta connexion ou si le site bloque les requêtes.")
        conn.close()
        return

    ok = 0
    deja = 0
    erreur = 0

    for i, url in enumerate(urls, 1):
        fichier = nom_fichier(url)
        dest = OUTPUT_DIR / fichier
        nouvelle_url = f"{API_BASE}/{fichier}"

        print(f"[{i:3d}/{len(urls)}] {fichier}")

        if dest.exists() and dest.stat().st_size > 1000:
            print(f"    ⏭️  Déjà présente")
            mettre_a_jour_db(cursor, conn, url, nouvelle_url)
            deja += 1
            continue

        if telecharger_image(url, dest):
            print(f"    ✅ {dest.name} ({dest.stat().st_size // 1024} KB)")
            mettre_a_jour_db(cursor, conn, url, nouvelle_url)
            ok += 1
        else:
            erreur += 1

        time.sleep(random.uniform(0.5, 1.2))

    conn.close()
    print(f"\n🏁 Terminé — ✅ {ok} téléchargées, ⏭️  {deja} déjà présentes, ❌ {erreur} erreurs")
    print(f"📁 Images dans : {OUTPUT_DIR.resolve()}")
    print(f"\n➡️  Prochaine étape : copier le dossier public_assets/ sur le serveur :")
    print(f"   scp -r public_assets/ root@IP_SERVEUR:/var/www/aeria-voyages/")

if __name__ == "__main__":
    main()