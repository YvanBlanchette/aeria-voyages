"""
download_itin_images.py — Télécharge les cartes d'itinéraires de Constellation
et supprime le logo en rognant les derniers pixels du bas.

Usage : python3 download_itin_images.py
"""

import sqlite3
import requests
import time
import random
from pathlib import Path
from urllib.parse import urlparse
from PIL import Image
import io

DB_PATH     = Path(__file__).parent / "../db/croisieres.db"
OUTPUT_DIR  = Path(__file__).parent / "../public_assets/img/itineraires"
API_BASE    = "https://aeriavoyages.com/img/itineraires"
CROP_BOTTOM = 22  # pixels à rogner en bas pour supprimer le logo Constellation

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://www.voyagesconstellation.com/",
}

def nom_fichier(url: str) -> str:
    return Path(urlparse(url).path).name

def telecharger_et_crop(url: str, dest: Path) -> bool:
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        if r.status_code != 200:
            print(f"    ⚠️  HTTP {r.status_code}")
            return False

        # Ouvrir avec PIL et rogner le bas
        img = Image.open(io.BytesIO(r.content))
        w, h = img.size
        img_cropped = img.crop((0, 0, w, h - CROP_BOTTOM))
        img_cropped.save(dest, "WEBP", quality=92)
        return True

    except Exception as e:
        print(f"    ❌ Erreur : {e}")
        return False

def tester_connexion(url: str) -> bool:
    print(f"🧪 Test sur : {url}")
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        print(f"   Status      : {r.status_code}")
        print(f"   Content-Type: {r.headers.get('Content-Type', 'inconnu')}")
        if r.status_code == 200:
            img = Image.open(io.BytesIO(r.content))
            w, h = img.size
            print(f"   Dimensions  : {w}x{h}px")
            print(f"   Après crop  : {w}x{h - CROP_BOTTOM}px")
            # Sauvegarder un aperçu pour vérification
            test_dest = Path(__file__).parent / "_test_itin.webp"
            img_cropped = img.crop((0, 0, w, h - CROP_BOTTOM))
            img_cropped.save(test_dest, "WEBP", quality=92)
            print(f"   ✅ Aperçu sauvegardé : {test_dest.resolve()}")
            print(f"      Vérifie que le logo est bien supprimé avant de continuer !\n")
            return True
        return False
    except Exception as e:
        print(f"   ❌ Erreur : {e}\n")
        return False

def mettre_a_jour_db(cursor, conn, ancienne_url: str, nouvelle_url: str):
    cursor.execute("""
        UPDATE mes_croisieres 
        SET image_itin = ?
        WHERE image_itin = ?
    """, (nouvelle_url, ancienne_url))
    conn.commit()

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"📁 Dossier de sortie : {OUTPUT_DIR.resolve()}\n")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT DISTINCT image_itin 
        FROM mes_croisieres 
        WHERE image_itin IS NOT NULL AND image_itin != ''
        AND image_itin LIKE 'http%voyagesconstellation%'
        ORDER BY image_itin
    """)
    urls = [row[0] for row in cursor.fetchall()]
    print(f"🗺️  {len(urls)} cartes d'itinéraires à traiter\n")

    if not urls:
        print("Aucune image à télécharger.")
        conn.close()
        return

    # Test rapide + aperçu avant de lancer
    if not tester_connexion(urls[0]):
        print("⛔ Test échoué — annulé.")
        conn.close()
        return

    reponse = input("Le crop est correct ? (o/n) : ").strip().lower()
    if reponse != 'o':
        print("⛔ Ajuste CROP_BOTTOM dans le script et relance.")
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

        if telecharger_et_crop(url, dest):
            print(f"    ✅ {dest.name} ({dest.stat().st_size // 1024} KB)")
            mettre_a_jour_db(cursor, conn, url, nouvelle_url)
            ok += 1
        else:
            erreur += 1

        time.sleep(random.uniform(0.4, 1.0))

    conn.close()
    print(f"\n🏁 Terminé — ✅ {ok} téléchargées, ⏭️  {deja} déjà présentes, ❌ {erreur} erreurs")
    print(f"📁 Cartes dans : {OUTPUT_DIR.resolve()}")
    print(f"\n➡️  Prochaine étape :")
    print(f"   scp -r public_assets/ root@IP_SERVEUR:/var/www/aeria-voyages/")

if __name__ == "__main__":
    main()