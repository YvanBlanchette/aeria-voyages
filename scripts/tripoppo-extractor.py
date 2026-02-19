import json
import re
import time
import os
import sqlite3
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# ─────────────────────────────────────────
#  CONFIGURATION
# ─────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
DB_PATH     = os.path.join(BASE_DIR, "..", "db", "croisieres.db")
JSON_OUTPUT = "/var/www/aeria-voyages/dist/data/tripoppo.json"

BASE_URL = "https://www.tripoppo.com"

REGIONS = [
    {"nom": "Afrique",         "url": f"{BASE_URL}/fr/travel/travel_lists/type/14/t/rtcnew"},
    {"nom": "Asie",            "url": f"{BASE_URL}/fr/travel/travel_lists/type/11/t/rtcnew"},
    {"nom": "Moyen-Orient",    "url": f"{BASE_URL}/fr/travel/travel_lists/type/106/t/rtcnew"},
    {"nom": "Amérique du Sud", "url": f"{BASE_URL}/fr/travel/travel_lists/type/2/t/rtcnew"},
]

# ─────────────────────────────────────────
#  UTILITAIRES TEXTE
# ─────────────────────────────────────────
def txt(el):
    return el.get_text(strip=True) if el else ""

def abs_url(href):
    if not href:
        return ""
    return BASE_URL + href if href.startswith("/") else href

def fix_encoding(s):
    if not s:
        return s
    try:
        s = s.encode("latin-1").decode("utf-8")
    except Exception:
        pass
    FIXES = [
        ("\u00e2\u0080\u0099", "\u2019"),
        ("\u00e2\u0080\u009c", "\u201c"),
        ("\u00e2\u0080\u009d", "\u201d"),
        ("\u00e2\u0080\u0094", "\u2014"),
        ("\u00e2\u0080\u0093", "\u2013"),
        ("\u00c3\u00a9", "é"), ("\u00c3\u00a8", "è"), ("\u00c3\u00aa", "ê"),
        ("\u00c3\u00a0", "à"), ("\u00c3\u00a2", "â"), ("\u00c3\u00ae", "î"),
        ("\u00c3\u00b4", "ô"), ("\u00c3\u00bb", "û"), ("\u00c3\u00a7", "ç"),
        ("\u00c5\u0093", "\u0153"),
    ]
    for bad, good in FIXES:
        s = s.replace(bad, good)
    return s

def fix_dict(obj):
    if isinstance(obj, str):
        return fix_encoding(obj)
    elif isinstance(obj, list):
        return [fix_dict(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: fix_dict(v) for k, v in obj.items()}
    return obj

def traduire_jours(texte):
    if not texte:
        return texte
    texte = re.sub(r'\bDay\s+(\d+)\s*:', r'Jour \1 :', texte)
    texte = re.sub(r'\b(\d+)\s*Days?\b', lambda m: m.group(1) + (" Jours" if m.group().endswith("s") else " Jour"), texte)
    texte = texte.replace("Days", "Jours").replace("Day", "Jour")
    return texte

# ─────────────────────────────────────────
#  SCROLL INFINI
# ─────────────────────────────────────────
def scroll_jusqu_en_bas(driver):
    derniere_hauteur = 0
    tentatives = 0
    while tentatives < 3:
        nb_avant = len(driver.find_elements(By.CSS_SELECTOR, ".tour-wrapper"))
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2)
        nb_apres = len(driver.find_elements(By.CSS_SELECTOR, ".tour-wrapper"))
        hauteur  = driver.execute_script("return document.body.scrollHeight")
        print(f"    🔄 Scroll... {nb_apres} circuits visibles")
        if nb_apres == nb_avant and hauteur == derniere_hauteur:
            tentatives += 1
        else:
            tentatives = 0
        derniere_hauteur = hauteur

# ─────────────────────────────────────────
#  EXTRACTION LISTE
# ─────────────────────────────────────────
def extraire_liste(html, region):
    soup = BeautifulSoup(html, "html.parser")
    resultats = []
    for c in soup.select(".tour-wrapper"):
        prix_promo_el = c.select_one(".discount-price")
        prix_reg_el   = c.select_one(".org-price")
        badge_el      = c.select_one(".promotion")
        img_tag       = c.find("img")
        link_tag      = c.find("a", href=True)
        src = ""
        if img_tag:
            src = img_tag.get("src") or img_tag.get("data-src") or ""
        resultats.append({
            "region":        region,
            "titre":         txt(c.select_one(".desc")),
            "duree":         txt(c.select_one(".trip-days")),
            "prix_promo":    prix_promo_el.get_text(strip=True).replace("$", "").strip() if prix_promo_el else "",
            "prix_regulier": prix_reg_el.get_text(strip=True).replace("$", "").strip() if prix_reg_el else "",
            "badge":         txt(badge_el),
            "image_url":     abs_url(src),
            "circuit_url":   abs_url(link_tag["href"]) if link_tag else "",
        })
    return resultats

# ─────────────────────────────────────────
#  EXTRACTION DÉTAIL
# ─────────────────────────────────────────
def extraire_detail(html):
    soup = BeautifulSoup(html, "html.parser")

    code_el = soup.select_one(".line-trip-code")
    code_voyage = txt(code_el).replace("Code de voyage:", "").replace("Code de voyage :", "").strip() if code_el else ""

    desc_el = soup.select_one(".line-short-desc")
    description = desc_el.get_text(separator=" ", strip=True) if desc_el else ""

    sous_titre = ""
    h4 = soup.select_one(".line-title h4")
    if h4:
        sous_titre = txt(h4)

    infos_rapides = [txt(el) for el in soup.select(".line-other-info .text") if txt(el)]

    itineraire = []
    for item in soup.select(".itinerary-item"):
        jour_el  = item.select_one(".itinerary-item-day")
        titre_el = item.select_one(".itinerary-item-title")
        desc_el  = item.select_one(".itinerary-item-desc")

        jour  = txt(jour_el)
        titre = txt(titre_el)

        contenu = ""
        if desc_el:
            for nav in desc_el.select(".swiper-button-next, .swiper-button-prev, .swiper-notification, .swiper-pagination"):
                nav.decompose()
            contenu = desc_el.get_text(separator="\n", strip=True)

        images_jour = []
        if desc_el:
            for img in desc_el.find_all("img"):
                src = img.get("src") or img.get("data-src") or ""
                if src:
                    images_jour.append(abs_url(src))

        itineraire.append({
            "jour":        jour,
            "titre":       titre,
            "description": contenu,
            "images":      images_jour,
        })

    hotels = []
    hotel_section = soup.find(id="line-hotels")
    if hotel_section:
        for slide in hotel_section.select(".swiper-slide"):
            nom   = txt(slide.select_one("h4, h5, .hotel-name, strong"))
            nuits = txt(slide.select_one(".hotel-nights, .nights"))
            desc  = ""
            for p in slide.find_all("p"):
                t = txt(p)
                if t:
                    desc += t + " "
            img_el = slide.find("img")
            img_url = abs_url(img_el.get("src", "") if img_el else "")
            if nom:
                hotels.append({"nom": nom, "nuits": nuits, "description": desc.strip(), "image": img_url})

    excursions = []
    exc_section = soup.find(id="line-optional-excursions")
    if exc_section:
        for item in exc_section.select(".excursion-item, .optional-item, li"):
            t = txt(item)
            if t:
                prix_m = re.search(r'\$[\d,]+', t)
                excursions.append({"titre": t, "prix": prix_m.group(0) if prix_m else ""})

    inclus, non_inclus = [], []
    for section in soup.select(".included-section, .line-included"):
        for li in section.find_all("li"):
            t = txt(li)
            if t:
                inclus.append(t)
    for section in soup.select(".not-included-section, .line-not-included"):
        for li in section.find_all("li"):
            t = txt(li)
            if t:
                non_inclus.append(t)

    dates_prix = []
    for table in soup.select("table"):
        for row in table.find_all("tr"):
            cols = [txt(td) for td in row.find_all(["td", "th"])]
            if cols and cols[0] and ("/" in cols[0] or "-" in cols[0]):
                liens = [abs_url(a["href"]) for a in row.find_all("a", href=True)]
                dates_prix.append({
                    "depart":         cols[0] if len(cols) > 0 else "",
                    "retour":         cols[1] if len(cols) > 1 else "",
                    "prix_terrestre": cols[2] if len(cols) > 2 else "",
                    "prix_package":   cols[3] if len(cols) > 3 else "",
                    "liens_resa":     liens,
                })

    carte_url = ""
    carte_img = soup.select_one(".itinerary-map img")
    if carte_img:
        carte_url = abs_url(carte_img.get("src", ""))

    pdf_url = ""
    pdf_link = soup.find("a", class_="itinerary-download", href=True)
    if pdf_link:
        href = pdf_link.get("href", "")
        if href and href.strip().lower().endswith(".pdf"):
            pdf_url = abs_url(href)

    images_carousel = []
    carousel = soup.select_one("#carousel-example-generic .carousel-inner")
    if carousel:
        for img in carousel.find_all("img"):
            src = img.get("src", "")
            if src:
                images_carousel.append(abs_url(src))

    return {
        "code_voyage":      code_voyage,
        "sous_titre":       sous_titre,
        "description":      description,
        "infos_rapides":    infos_rapides,
        "images_carousel":  images_carousel,
        "carte_itineraire": carte_url,
        "pdf_itineraire":   pdf_url,
        "itineraire":       itineraire,
        "hotels":           hotels,
        "excursions_opt":   excursions,
        "inclus":           inclus,
        "non_inclus":       non_inclus,
        "dates_prix":       dates_prix,
    }

# ─────────────────────────────────────────
#  SQLITE
# ─────────────────────────────────────────
def sauvegarder_tripoppo_db(circuits):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Créer les tables si elles n'existent pas
    cursor.executescript('''
        CREATE TABLE IF NOT EXISTS circuits_tripoppo (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            region TEXT, titre TEXT, sous_titre TEXT, duree TEXT,
            code_voyage TEXT, prix_promo TEXT, prix_regulier TEXT,
            badge TEXT, description TEXT, infos_rapides TEXT,
            circuit_url TEXT UNIQUE, image_url TEXT,
            images_carousel TEXT, carte_itineraire TEXT,
            pdf_itineraire TEXT, inclus TEXT, non_inclus TEXT,
            derniere_maj DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS tripoppo_itineraire (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            circuit_url TEXT, jour TEXT, titre TEXT,
            description TEXT, images TEXT
        );
        CREATE TABLE IF NOT EXISTS tripoppo_dates_prix (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            circuit_url TEXT, depart TEXT, retour TEXT,
            prix_terrestre TEXT, prix_package TEXT, liens_resa TEXT
        );
        CREATE TABLE IF NOT EXISTS tripoppo_hotels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            circuit_url TEXT, nom TEXT, nuits TEXT,
            description TEXT, image TEXT
        );
    ''')

    # Nettoyer les tables dépendantes
    cursor.execute("DELETE FROM tripoppo_itineraire")
    cursor.execute("DELETE FROM tripoppo_dates_prix")
    cursor.execute("DELETE FROM tripoppo_hotels")
    cursor.execute("DELETE FROM circuits_tripoppo")

    for c in circuits:
        url = c.get("circuit_url", "")

        cursor.execute('''
            INSERT OR REPLACE INTO circuits_tripoppo (
                region, titre, sous_titre, duree, code_voyage,
                prix_promo, prix_regulier, badge, description, infos_rapides,
                circuit_url, image_url, images_carousel, carte_itineraire,
                pdf_itineraire, inclus, non_inclus
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            c.get("region", ""), c.get("titre", ""), c.get("sous_titre", ""),
            c.get("duree", ""), c.get("code_voyage", ""),
            c.get("prix_promo", ""), c.get("prix_regulier", ""),
            c.get("badge", ""), c.get("description", ""),
            json.dumps(c.get("infos_rapides", []), ensure_ascii=False),
            url, c.get("image_url", ""),
            json.dumps(c.get("images_carousel", []), ensure_ascii=False),
            c.get("carte_itineraire", ""), c.get("pdf_itineraire", ""),
            json.dumps(c.get("inclus", []), ensure_ascii=False),
            json.dumps(c.get("non_inclus", []), ensure_ascii=False),
        ))

        for j in c.get("itineraire", []):
            cursor.execute('''
                INSERT INTO tripoppo_itineraire (circuit_url, jour, titre, description, images)
                VALUES (?, ?, ?, ?, ?)
            ''', (url, j.get("jour", ""), j.get("titre", ""),
                  j.get("description", ""), json.dumps(j.get("images", []), ensure_ascii=False)))

        for d in c.get("dates_prix", []):
            cursor.execute('''
                INSERT INTO tripoppo_dates_prix (circuit_url, depart, retour, prix_terrestre, prix_package, liens_resa)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (url, d.get("depart", ""), d.get("retour", ""),
                  d.get("prix_terrestre", ""), d.get("prix_package", ""),
                  json.dumps(d.get("liens_resa", []), ensure_ascii=False)))

        for h in c.get("hotels", []):
            cursor.execute('''
                INSERT INTO tripoppo_hotels (circuit_url, nom, nuits, description, image)
                VALUES (?, ?, ?, ?, ?)
            ''', (url, h.get("nom", ""), h.get("nuits", ""),
                  h.get("description", ""), h.get("image", "")))

    conn.commit()
    print(f"💾 {len(circuits)} circuits Tripoppo enregistrés dans SQLite.")

    # Export JSON pour React
    os.makedirs(os.path.dirname(JSON_OUTPUT), exist_ok=True)
    temp = JSON_OUTPUT + ".tmp"
    with open(temp, "w", encoding="utf-8") as f:
        json.dump(circuits, f, indent=2, ensure_ascii=False)
    if os.path.exists(JSON_OUTPUT):
        os.remove(JSON_OUTPUT)
    os.rename(temp, JSON_OUTPUT)
    print(f"🚀 JSON généré : {JSON_OUTPUT}")

    conn.close()

# ─────────────────────────────────────────
#  ROBOT PRINCIPAL
# ─────────────────────────────────────────
def lancer_robot():
    print("🚀 Démarrage du robot Tripoppo...\n")

    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
    chrome_options.binary_location = "/usr/bin/chromium-browser"

    driver = webdriver.Chrome(
        service=Service('/usr/bin/chromedriver'),
        options=chrome_options
    )
    wait = WebDriverWait(driver, 15)

    tous_les_circuits = []
    vus = set()

    try:
        # Étape 1 : collecter tous les circuits uniques
        for region in REGIONS:
            print(f"🌍 Région : {region['nom']}")
            driver.get(region["url"])
            try:
                wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".tour-wrapper")))
            except Exception:
                print(f"   ⚠️  Aucun circuit — on continue.\n")
                continue
            scroll_jusqu_en_bas(driver)
            circuits = extraire_liste(driver.page_source, region["nom"])
            circuits = [fix_dict(c) for c in circuits]
            nouveaux = [c for c in circuits if c["circuit_url"] not in vus]
            for c in nouveaux:
                vus.add(c["circuit_url"])
            tous_les_circuits.extend(nouveaux)
            print(f"   ✅ {len(nouveaux)} circuits uniques pour {region['nom']}\n")

        # Étape 2 : scraper chaque page détaillée
        total = len(tous_les_circuits)
        for i, circuit in enumerate(tous_les_circuits, 1):
            url = circuit["circuit_url"]
            if not url:
                continue
            print(f"📄 [{i}/{total}] {circuit['titre']}")
            try:
                driver.get(url)
                wait.until(EC.presence_of_element_located(
                    (By.CSS_SELECTOR, ".itinerary-item, .line-short-desc")
                ))
                time.sleep(1)
                detail = extraire_detail(driver.page_source)
                detail = fix_dict(detail)
                for j in detail.get("itineraire", []):
                    j["jour"]  = traduire_jours(j.get("jour", ""))
                    j["titre"] = traduire_jours(j.get("titre", ""))
                if detail.get("duree"):
                    detail["duree"] = traduire_jours(detail["duree"])
                circuit.update(detail)
                nb_jours  = len(detail["itineraire"])
                nb_dates  = len(detail["dates_prix"])
                nb_inclus = len(detail["inclus"])
                nb_images = sum(len(j.get("images", [])) for j in detail["itineraire"])
                print(f"   ✅ {nb_jours} jours ({nb_images} imgs) | {nb_dates} dates | {nb_inclus} inclusions | code: {detail['code_voyage']}")
            except Exception as e:
                print(f"   ⚠️  Erreur : {e}")

    finally:
        driver.quit()

    sauvegarder_tripoppo_db(tous_les_circuits)
    print(f"\n🎉 Terminé ! {len(tous_les_circuits)} circuits complets.")

if __name__ == "__main__":
    lancer_robot()