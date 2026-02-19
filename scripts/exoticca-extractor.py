import json
import csv
import time
import re
import os
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

# ─────────────────────────────────────────
#  CONFIGURATION
# ─────────────────────────────────────────
URL_CIBLE          = "https://www.exoticca.com/ca"
NOM_JSON           = 'exoticca.json'
NOM_CSV            = 'exoticca.csv'
TOKEN_CONSEILLER   = "?advisor_token=yvan-junior-blanchette-0199e876-b8a6-7198-9489-dd6873f29fb0"
DELAI_RENDU        = 4   # secondes pour le rendu Next.js

CHAMPS_CSV = [
    'id', 'rabais_num', 'region', 'destination', 'titre',
    'jours', 'prixPromo', 'prixRegulier', 'economie',
    'prixParNuit', 'nuitsBonusDisponibles',
    'isFlashSale', 'isNew', 'isTourPrive', 'isSansVol',
    'badges', 'image', 'images',
    'rabais', 'lienAgent'
]

# ─────────────────────────────────────────
#  UTILITAIRES
# ─────────────────────────────────────────
def clean_price(val):
    """Convertit un prix texte ou nombre en entier."""
    if val is None or val == "N/A":
        return 0
    clean = "".join(filter(str.isdigit, str(val)))
    return int(clean) if clean else 0

def extraire_region_url(url):
    """Identifie la région (america, europe, etc.) via l'URL."""
    match = re.search(r'/(tours|nature|discovery)/([^/]+)/', url)
    return match.group(2) if match else "autres"

def extraire_image_principale(obj):
    """
    Priorité : images[] (carte optimisée) → originalImages[] → image[]
    Retourne l'URL desktop de la première image disponible.
    """
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

def extraire_toutes_images(obj):
    """
    Retourne la liste complète des URLs depuis originalImages[]
    (galerie haute résolution), séparées par | pour le CSV.
    """
    originales = obj.get('originalImages', [])
    if not originales:
        return ''
    urls = []
    for img in originales:
        if isinstance(img, dict):
            url = img.get('desktop') or img.get('tablet') or img.get('mobile', '')
            if url and url not in urls:
                urls.append(url)
    return '|'.join(urls)

def extraire_badges(obj):
    """Extrait les labels marketing (ex: 'Flash Sale', 'New')."""
    tags = obj.get('tagHeadline', []) or []
    return ', '.join(t.get('alias', '') or t.get('name', '') for t in tags if t)

def atomic_write(data, filename, is_json=True):
    """Écrit dans un fichier temporaire avant de renommer (évite les corruptions)."""
    temp = filename + ".tmp"
    try:
        if is_json:
            with open(temp, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
        else:
            with open(temp, 'w', newline='', encoding='utf-16') as f:
                writer = csv.DictWriter(
                    f, fieldnames=CHAMPS_CSV,
                    delimiter='\t', extrasaction='ignore'
                )
                writer.writeheader()
                writer.writerows(data)
        if os.path.exists(filename):
            os.remove(filename)
        os.rename(temp, filename)
    except Exception as e:
        if os.path.exists(temp):
            os.remove(temp)
        print(f"❌ Erreur écriture {filename}: {e}")

# ─────────────────────────────────────────
#  EXTRACTION
# ─────────────────────────────────────────
def extraire_donnees(obj, catalogue):
    """Parcourt récursivement le JSON pour extraire les voyages valides."""
    if isinstance(obj, dict):
        url = obj.get('url', '')
        est_voyage = any(k in url for k in ['/tours/', '/nature/', '/discovery/'])

        if est_voyage and 'id' in obj and ('title' in obj or 'name' in obj):
            # ── Prix ──────────────────────────────────────
            price_obj   = obj.get('priceDetail') or obj.get('price') or {}
            promo_raw   = (price_obj.get('fromPrice')
                        or price_obj.get('total')
                        or obj.get('fromPrice')
                        or obj.get('fromPriceBeautify', 'N/A'))
            regulier_raw = (price_obj.get('oldPrice')
                         or price_obj.get('originalTotal')
                         or obj.get('oldPrice')
                         or obj.get('oldPriceBeautify', 'N/A'))
            rabais_raw  = (price_obj.get('pricingPercentage')
                        or obj.get('pricingPercentage')
                        or obj.get('discountPercentage'))
            economie_raw = price_obj.get('discountSaved', 0)
            prix_nuit    = price_obj.get('pricePerNight', '')

            if promo_raw != 'N/A' and rabais_raw:
                p_id = str(obj['id'])
                if p_id not in catalogue:
                    # ── Durée ──────────────────────────────────────
                    duree_raw = str(obj.get('durationText') or obj.get('days') or '')
                    duree_num = int("".join(filter(str.isdigit, duree_raw))) if re.search(r'\d', duree_raw) else 0
                    val_rabais = int("".join(filter(str.isdigit, str(rabais_raw))))

                    # ── Flags marketing ────────────────────────────
                    is_flash = bool(obj.get('isFlashSales'))
                    is_new   = bool(obj.get('isNew'))
                    is_prive = bool(obj.get('hasPrivateTour'))
                    is_sol   = bool(obj.get('isLandOnly'))   # sans vol

                    # ── Images ─────────────────────────────────────
                    image_principale = extraire_image_principale(obj)
                    toutes_images    = extraire_toutes_images(obj)

                    catalogue[p_id] = {
                        'id':                   p_id,
                        'rabais_num':           val_rabais,
                        'region':               extraire_region_url(url),
                        'destination':          (obj.get('destination') or 'N/A').strip(),
                        'titre':                (obj.get('title') or obj.get('name', '')).strip(),
                        'jours':                duree_num,
                        'prixPromo':            clean_price(promo_raw),
                        'prixRegulier':         clean_price(regulier_raw),
                        'economie':             clean_price(economie_raw),
                        'prixParNuit':          prix_nuit,
                        'nuitsBonusDisponibles': obj.get('extraNights', 0),
                        'isFlashSale':          is_flash,
                        'isNew':                is_new,
                        'isTourPrive':          is_prive,
                        'isSansVol':            is_sol,
                        'badges':               extraire_badges(obj),
                        'image':                image_principale,
                        'images':               toutes_images,
                        'rabais':               f"{val_rabais}%",
                        'lienAgent':            f"https://www.exoticca.com{url}{TOKEN_CONSEILLER}"
                    }

        # Récursion
        for v in obj.values():
            extraire_donnees(v, catalogue)

    elif isinstance(obj, list):
        for item in obj:
            extraire_donnees(item, catalogue)

# ─────────────────────────────────────────
#  ROBOT
# ─────────────────────────────────────────
def lancer_robot():
    print(f"🤖 Robot en action sur {URL_CIBLE}...")

    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )

    try:
        driver.get(URL_CIBLE)
        time.sleep(DELAI_RENDU)

        soup = BeautifulSoup(driver.page_source, 'html.parser')
        script_tag = soup.find('script', id='__NEXT_DATA__')

        if not script_tag or not script_tag.string:
            print("❌ Impossible de capturer le flux de données.")
            return

        donnees_brutes = json.loads(script_tag.string)
        catalogue = {}
        extraire_donnees(donnees_brutes, catalogue)

        # Tri : rabais décroissant → région alphabétique → prix croissant
        liste_finale = sorted(
            catalogue.values(),
            key=lambda x: (-x['rabais_num'], x['region'], x['prixPromo'])
        )

        # Résumé console
        flash_count = sum(1 for c in liste_finale if c['isFlashSale'])
        new_count   = sum(1 for c in liste_finale if c['isNew'])
        print(f"\n✅ SUCCÈS : {len(liste_finale)} circuits extraits")
        print(f"   ⚡ Flash Sales : {flash_count}")
        print(f"   🆕 Nouveautés  : {new_count}")
        if liste_finale:
            top = liste_finale[0]
            print(f"   🔥 Top Deal    : {top['titre']} — {top['rabais']} off")
            print(f"                    {top['prixPromo']}$ (économie: {top['economie']}$)")

        # Sauvegardes
        atomic_write(liste_finale, NOM_JSON, is_json=True)
        atomic_write(liste_finale, NOM_CSV,  is_json=False)
        print(f"\n📁 Fichiers sauvegardés : {NOM_JSON} · {NOM_CSV}")

    finally:
        driver.quit()


if __name__ == "__main__":
    lancer_robot()