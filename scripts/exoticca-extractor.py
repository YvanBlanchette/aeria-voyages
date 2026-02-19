import json
import time
import re
import os
import sqlite3
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

# ─────────────────────────────────────────
#  CONFIGURATION DES CHEMINS
# ─────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
DB_PATH     = os.path.join(BASE_DIR, "..", "db", "croisieres.db")
JSON_OUTPUT = "/var/www/aeria-voyages/dist/data/exoticca.json"

URL_CIBLE        = "https://www.exoticca.com/ca"
TOKEN_CONSEILLER = "?advisor_token=yvan-junior-blanchette-0199e876-b8a6-7198-9489-dd6873f29fb0"
DELAI_RENDU      = 5

# ─────────────────────────────────────────
#  UTILITAIRES
# ─────────────────────────────────────────
def clean_price(val):
    if val is None or val == "N/A":
        return 0
    clean = "".join(filter(str.isdigit, str(val)))
    return int(clean) if clean else 0

def extraire_region_url(url):
    match = re.search(r'/(tours|nature|discovery)/([^/]+)/', url)
    return match.group(2) if match else "autres"

def extraire_image_principale(obj):
    for champ in ('images', 'originalImages', 'image'):
        liste = obj.get(champ, [])
        if liste and isinstance(liste, list):
            premier = liste[0]
            if isinstance(premier, dict):
                url = (premier.get('desktop')
                    or premier.get('tablet')
                    or premier.get('mobile')
                    or premier.get('url', ''))
                if url:
                    return url
    return ''

def extraire_badges(obj):
    tags = obj.get('tagHeadline', []) or []
    return ', '.join(t.get('alias', '') or t.get('name', '') for t in tags if t)

# ─────────────────────────────────────────
#  SQLITE
# ─────────────────────────────────────────
def sauvegarder_exoticca_db(liste_circuits):
    """Enregistre les circuits dans SQLite et exporte le JSON pour React"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("DELETE FROM circuits_exoticca")

        for c in liste_circuits:
            cursor.execute('''
                INSERT INTO circuits_exoticca (
                    id, region, destination, titre, jours, prix_promo,
                    prix_regulier, economie, rabais_pourcentage, image,
                    lien_agent, is_flash_sale, is_new
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                str(c['id']), c['region'], c['destination'], c['titre'],
                c['jours'], c['prixPromo'], c['prixRegulier'],
                c['economie'], c['rabais'], c['image'],
                c['lienAgent'], c['isFlashSale'], c['isNew']
            ))

        conn.commit()
        print(f"💾 {len(liste_circuits)} circuits enregistrés dans SQLite.")

        # Export JSON pour React — format compatible avec CircuitsSection.jsx
        conn.row_factory = sqlite3.Row
        cursor.execute("""
            SELECT 
                id, region, destination, titre, jours,
                prix_promo as prixPromo, prix_regulier as prixRegulier,
                economie, rabais_pourcentage as rabais, image,
                lien_agent as lienAgent, is_flash_sale as isFlashSale,
                is_new as isNew
            FROM circuits_exoticca 
            ORDER BY prix_promo ASC
        """)
        rows = [dict(row) for row in cursor.fetchall()]

        # Conversion booléens SQLite (0/1) → Python
        for row in rows:
            row['isFlashSale'] = bool(row['isFlashSale'])
            row['isNew'] = bool(row['isNew'])

        os.makedirs(os.path.dirname(JSON_OUTPUT), exist_ok=True)
        temp = JSON_OUTPUT + ".tmp"
        with open(temp, 'w', encoding='utf-8') as f:
            json.dump(rows, f, indent=2, ensure_ascii=False)
        if os.path.exists(JSON_OUTPUT):
            os.remove(JSON_OUTPUT)
        os.rename(temp, JSON_OUTPUT)

        conn.close()
        print(f"🚀 JSON généré : {JSON_OUTPUT} ({len(rows)} circuits)")

    except Exception as e:
        print(f"❌ Erreur SQLite : {e}")

# ─────────────────────────────────────────
#  EXTRACTION
# ─────────────────────────────────────────
def extraire_donnees(obj, catalogue):
    """Parcourt récursivement le JSON __NEXT_DATA__"""
    if isinstance(obj, dict):
        url = obj.get('url', '')
        est_voyage = any(k in url for k in ['/tours/', '/nature/', '/discovery/'])

        if est_voyage and 'id' in obj and ('title' in obj or 'name' in obj):
            price_obj    = obj.get('priceDetail') or obj.get('price') or {}
            promo_raw    = (price_obj.get('fromPrice')
                         or price_obj.get('total')
                         or obj.get('fromPrice')
                         or obj.get('fromPriceBeautify', 'N/A'))
            regulier_raw = (price_obj.get('oldPrice')
                         or price_obj.get('originalTotal')
                         or obj.get('oldPrice')
                         or obj.get('oldPriceBeautify', 'N/A'))
            rabais_raw   = (price_obj.get('pricingPercentage')
                         or obj.get('pricingPercentage')
                         or obj.get('discountPercentage'))
            economie_raw = price_obj.get('discountSaved', 0)

            if promo_raw != 'N/A' and rabais_raw:
                p_id = str(obj['id'])
                if p_id not in catalogue:
                    duree_raw  = str(obj.get('durationText') or obj.get('days') or '')
                    duree_num  = int("".join(filter(str.isdigit, duree_raw))) if re.search(r'\d', duree_raw) else 0
                    val_rabais = int("".join(filter(str.isdigit, str(rabais_raw))))

                    catalogue[p_id] = {
                        'id':           p_id,
                        'region':       extraire_region_url(url),
                        'destination':  (obj.get('destination') or 'N/A').strip(),
                        'titre':        (obj.get('title') or obj.get('name', '')).strip(),
                        'jours':        duree_num,
                        'prixPromo':    clean_price(promo_raw),
                        'prixRegulier': clean_price(regulier_raw),
                        'economie':     clean_price(economie_raw),
                        'rabais':       f"{val_rabais}%",
                        'image':        extraire_image_principale(obj),
                        'lienAgent':    f"https://www.exoticca.com{url}{TOKEN_CONSEILLER}",
                        'isFlashSale':  bool(obj.get('isFlashSales')),
                        'isNew':        bool(obj.get('isNew')),
                    }

        for v in obj.values():
            extraire_donnees(v, catalogue)

    elif isinstance(obj, list):
        for item in obj:
            extraire_donnees(item, catalogue)

# ─────────────────────────────────────────
#  ROBOT PRINCIPAL
# ─────────────────────────────────────────
def lancer_robot():
    print("✈️ Démarrage du robot Exoticca...")

    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.binary_location = "/usr/bin/chromium-browser"

    driver = webdriver.Chrome(
        service=Service('/usr/bin/chromedriver'),
        options=chrome_options
    )

    try:
        driver.get(URL_CIBLE)
        time.sleep(DELAI_RENDU)

        soup = BeautifulSoup(driver.page_source, 'html.parser')
        script_tag = soup.find('script', id='__NEXT_DATA__')

        if not script_tag or not script_tag.string:
            print("❌ Impossible de trouver les données Next.js")
            return

        donnees_brutes = json.loads(script_tag.string)
        catalogue = {}
        extraire_donnees(donnees_brutes, catalogue)

        if catalogue:
            # Tri : rabais décroissant → région → prix croissant
            liste_finale = sorted(
                catalogue.values(),
                key=lambda x: (-int(x['rabais'].replace('%', '')), x['region'], x['prixPromo'])
            )

            flash_count = sum(1 for c in liste_finale if c['isFlashSale'])
            new_count   = sum(1 for c in liste_finale if c['isNew'])
            print(f"\n✅ {len(liste_finale)} circuits extraits")
            print(f"   ⚡ Flash Sales : {flash_count}")
            print(f"   🆕 Nouveautés  : {new_count}")

            sauvegarder_exoticca_db(liste_finale)
        else:
            print("⚠️ Aucun circuit trouvé.")

    finally:
        driver.quit()

if __name__ == "__main__":
    lancer_robot()