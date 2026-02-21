import json
import re
import os
import time
import sqlite3
import random
import requests
from datetime import datetime
from difflib import get_close_matches
from pathlib import Path
from urllib.parse import urlparse
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

# ─────────────────────────────────────────
#  CONFIGURATION DES CHEMINS
# ─────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
DB_PATH     = os.path.join(BASE_DIR, "..", "db", "croisieres.db")
JSON_DIR    = "/var/www/aeria-voyages/dist/data"
IMG_DIR     = Path("/var/www/aeria-voyages/public_assets/img/navires")
IMG_BASE    = "https://aeriavoyages.com/img/navires"

SECTIONS = {
    "sud":       "https://www.voyagesconstellation.com/croisieres-sud",
    "europe":    "https://www.voyagesconstellation.com/croisieres-europe",
    "alaska":    "https://www.voyagesconstellation.com/croisieres-alaska",
    "exotiques": "https://www.voyagesconstellation.com/croisieres-exotiques",
}

BASE_URL    = "https://www.voyagesconstellation.com"
BASE_IMG    = "https://www.voyagesconstellation.com"
DELAI_RENDU = 5

MOIS_MAP = {
    'janv': '01', 'févr': '02', 'mars': '03', 'avr': '04',
    'mai':  '05', 'juin': '06', 'juil': '07', 'août': '08',
    'sept': '09', 'oct':  '10', 'nov':  '11', 'déc':  '12'
}

INCL_LABEL = {'yes': 'Inclus', 'free': 'Gratuit', 'no': 'Non inclus'}

SEG_BASE      = "https://www.shoreexcursionsgroup.com/results/"
SEG_AFFILIATE = "source=portal&id=1771540&data=yvanblanchette%40aeriavoyages.com"

IMG_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://www.voyagesconstellation.com/",
}

# ─────────────────────────────────────────
#  REGEX COMPILÉES
# ─────────────────────────────────────────
RE_BLOCS = re.compile(
    r'<a href="([^"]+)" id="cruisenum_(\d+)"[^>]*>(.*?)</a>(?=\s*(?:<a |</))',
    re.DOTALL
)
RE_PRIX   = re.compile(r"window\['pr_(\d+)_([IOB])_(no|dr_wi_ti)'\]\s*=\s*(\d+)")
RE_INCL   = re.compile(r'class="(\w+)" id="(drinks|tips|wifi)_incl_(\d+)"')
RE_MAP    = re.compile(r'id="map_(\d+)"[^>]*src="([^"]+)"')
RE_PRV    = re.compile(r'id="prv_(\d+)"[^>]*src="([^"]+)"')
RE_ITIN   = re.compile(r'<div class="name">([^<]+)')
RE_NAVIRE = re.compile(r'<div class="subname">([^<]+)')
RE_DATE   = re.compile(r'<b>([^<]+)</b>')
RE_PORT   = re.compile(r'(?:D[ée]part)\s+de\s+([^<\n]+)', re.I)

# ─────────────────────────────────────────
#  TÉLÉCHARGEMENT D'IMAGES
# ─────────────────────────────────────────
def telecharger_image_navire(url_source: str) -> str:
    """
    Télécharge l'image du navire si elle n'existe pas déjà localement.
    Retourne l'URL locale si succès, l'URL source sinon.
    """
    if not url_source:
        return url_source

    IMG_DIR.mkdir(parents=True, exist_ok=True)

    fichier = Path(urlparse(url_source).path).name
    dest    = IMG_DIR / fichier
    url_locale = f"{IMG_BASE}/{fichier}"

    # Déjà téléchargée
    if dest.exists() and dest.stat().st_size > 1000:
        return url_locale

    try:
        r = requests.get(url_source, headers=IMG_HEADERS, timeout=15, stream=True)
        if r.status_code == 200 and "image" in r.headers.get("Content-Type", ""):
            with open(dest, "wb") as f:
                for chunk in r.iter_content(8192):
                    f.write(chunk)
            return url_locale
        else:
            print(f"    ⚠️  Image non téléchargée (HTTP {r.status_code}) : {fichier}")
    except Exception as e:
        print(f"    ❌ Erreur téléchargement image : {e}")

    return url_source  # fallback sur l'URL originale

# ─────────────────────────────────────────
#  EXTRACTION DES CODES DE PORTS
# ─────────────────────────────────────────
def extraire_codes_ports(url_carte):
    match = re.search(r'/itin/([^.]+)\.webp', url_carte)
    if not match:
        return []
    codes = []
    for segment in match.group(1).split('-'):
        if segment and re.match(r'^[A-Z]', segment):
            codes.append(segment.upper())
    return codes

# ─────────────────────────────────────────
#  UTILITAIRES
# ─────────────────────────────────────────
def convertir_iso(jour, mois_texte, annee):
    m = mois_texte.lower().replace('.', '').strip()
    for cle, num in MOIS_MAP.items():
        if cle in m:
            return f"{annee}-{num}-{int(jour):02d}"
    return f"{annee}-01-{int(jour):02d}"

def extraire_dates(texte_brut):
    d_dep, d_ret, nuits = "N/A", "N/A", 0

    def mois_num(mois_texte):
        m = mois_texte.lower().replace('.', '').strip()
        for cle, num in MOIS_MAP.items():
            if cle in m:
                return int(num)
        return 1

    try:
        t = texte_brut.replace('\xa0', ' ').strip()

        m_two_years = re.search(
            r'(\d+)\s+([a-zéûà.]+)\s+(\d{4})\s+au\s+(\d+)\s+([a-zéûà.]+)\s+(\d{4})',
            t, re.I
        )
        if m_two_years:
            j1, m1, y1 = int(m_two_years.group(1)), m_two_years.group(2), int(m_two_years.group(3))
            j2, m2, y2 = int(m_two_years.group(4)), m_two_years.group(5), int(m_two_years.group(6))
            d_dep = convertir_iso(j1, m1, str(y1))
            d_ret = convertir_iso(j2, m2, str(y2))
            dep_dt = datetime.strptime(d_dep, "%Y-%m-%d")
            ret_dt = datetime.strptime(d_ret, "%Y-%m-%d")
            nuits = (ret_dt - dep_dt).days
            return d_dep, d_ret, nuits

        m_year_end = re.search(r'(\d{4})\s*$', t)
        if not m_year_end:
            return d_dep, d_ret, nuits
        year_end = int(m_year_end.group(1))

        m_diff = re.search(r'(\d+)\s+([a-zéûà.]+)\s+au\s+(\d+)\s+([a-zéûà.]+)', t, re.I)
        m_meme = re.search(r'(\d+)\s+au\s+(\d+)\s+([a-zéûà.]+)', t, re.I)

        if m_diff:
            j1, m1 = int(m_diff.group(1)), m_diff.group(2)
            j2, m2 = int(m_diff.group(3)), m_diff.group(4)
            m1n = mois_num(m1)
            m2n = mois_num(m2)
            y_ret = year_end
            y_dep = year_end - 1 if m2n < m1n else year_end
            d_dep = convertir_iso(j1, m1, str(y_dep))
            d_ret = convertir_iso(j2, m2, str(y_ret))
        elif m_meme:
            j1, j2, m = int(m_meme.group(1)), int(m_meme.group(2)), m_meme.group(3)
            d_dep = convertir_iso(j1, m, str(year_end))
            d_ret = convertir_iso(j2, m, str(year_end))

        if d_dep != "N/A" and d_ret != "N/A":
            dep_dt = datetime.strptime(d_dep, "%Y-%m-%d")
            ret_dt = datetime.strptime(d_ret, "%Y-%m-%d")
            if ret_dt < dep_dt:
                ret_dt = ret_dt.replace(year=ret_dt.year + 1)
                d_ret = ret_dt.strftime("%Y-%m-%d")
            nuits = (ret_dt - dep_dt).days

    except Exception:
        pass

    return d_dep, d_ret, nuits

def identifier_compagnie(navire):
    n = navire.strip().lower()
    for suffixe, comp in [
        ('of the seas', 'Royal Caribbean'),
        ('princess', 'Princess Cruises'),
        ('lady', 'Virgin Voyages'),
        ('dam', 'Holland America Line'),
    ]:
        if n.endswith(suffixe):
            return comp
    for prefixe, comp in [
        ('queen', 'Cunard Line'),
        ('msc', 'MSC Croisières'),
        ('norwegian', 'Norwegian Cruise Line'),
        ('carnival', 'Carnival Cruise Line'),
        ('celebrity', 'Celebrity Cruises'),
        ('oceania', 'Oceania Cruises'),
        ('explora', 'Explora Journeys'),
        ('seven seas', 'Regent Seven Seas'),
        ('silver', 'Silversea Cruises'),
        ('seabourn', 'Seabourn'),
        ('viking', 'Viking Ocean'),
        ('windstar', 'Windstar Cruises'),
        ('azamara', 'Azamara'),
    ]:
        if n.startswith(prefixe):
            return comp
    return navire.split(' ')[0].capitalize()

def normaliser_img(src):
    if not src:
        return ''
    if src.startswith('http'):
        return re.sub(r'([a-z])//img', r'\1/img', src)
    return BASE_IMG + src

# ─────────────────────────────────────────
#  MAPPING SEG — chargé une seule fois
# ─────────────────────────────────────────
def charger_mapping_seg():
    """
    Charge le mapping SEG complet en mémoire.
    Retourne deux dicts lowercase pour des lookups O(1).
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    corrections = {}
    try:
        for row in cursor.execute(
            "SELECT ship_name_constellation, ship_name_seg FROM seg_name_corrections"
        ):
            corrections[row[0].lower()] = row[1]
    except Exception:
        print("  ⚠️  Table seg_name_corrections introuvable — corrections ignorées.")

    mapping = {}
    try:
        for row in cursor.execute(
            "SELECT ship_name, ship_id, line_id FROM seg_mapping"
        ):
            mapping[row[0].lower()] = {"ship_id": row[1], "line_id": row[2]}
    except Exception as e:
        print(f"  ❌  Impossible de charger seg_mapping : {e}")

    conn.close()
    print(f"✅  Mapping SEG chargé : {len(mapping)} navires, {len(corrections)} corrections.")
    return corrections, mapping


def generer_lien_seg(nom_navire, date_depart, nuits, corrections, mapping):
    """
    Génère le lien affilié SEG.
    Priorité : match exact → correction manuelle → matching flou (cutoff 0.85).
    """
    nom            = nom_navire.strip()
    nom_lower      = nom.lower()
    seg_name_lower = corrections.get(nom_lower, nom).lower()
    seg            = mapping.get(seg_name_lower)

    if not seg:
        candidats = get_close_matches(seg_name_lower, mapping.keys(), n=1, cutoff=0.85)
        if candidats:
            seg = mapping[candidats[0]]
            print(f"  🔍 Match flou : '{nom}' → '{candidats[0]}'")
        else:
            print(f"  ⚠️  Navire introuvable dans SEG : '{nom}'")
            return ""

    return (
        f"{SEG_BASE}"
        f"?line={seg['line_id']}&shipId={seg['ship_id']}"
        f"&arrival={date_depart}&nights={nuits}"
        f"&{SEG_AFFILIATE}"
    )

# ─────────────────────────────────────────
#  SQLITE
# ─────────────────────────────────────────
def sauvegarder_db(tous_les_resultats):
    """Enregistre toutes les croisières dans SQLite et exporte les JSON par section."""

    corrections, mapping = charger_mapping_seg()

    # Cache des images déjà traitées ce run (évite de re-télécharger le même navire)
    cache_images = {}

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM mes_croisieres")

    liens_ok    = 0
    liens_vide  = 0
    imgs_ok     = 0
    imgs_skip   = 0

    for c in tous_les_resultats:
        ports_str = ",".join(c.get('Ports', []))
        lien_seg  = generer_lien_seg(
            c['Navire'], c['Date Départ'], c['Nuits'],
            corrections, mapping
        )
        if lien_seg:
            liens_ok += 1
        else:
            liens_vide += 1

        # Téléchargement image navire avec cache
        url_navire_orig = c['Image Navire']
        if url_navire_orig in cache_images:
            url_navire = cache_images[url_navire_orig]
            imgs_skip += 1
        else:
            url_navire = telecharger_image_navire(url_navire_orig)
            cache_images[url_navire_orig] = url_navire
            if url_navire != url_navire_orig:
                imgs_ok += 1

        cursor.execute('''
            INSERT INTO mes_croisieres (
                croisieriste, navire, date_depart, date_retour, nuits,
                itineraire, port_depart, ports, prix_int, prix_ext, prix_balcon,
                prix_vol_int, prix_vol_ext, prix_vol_balcon, boissons, pourboires,
                wifi, image_itin, image_navire, lien_constellation, lien_seg, section
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            c['Croisiériste'], c['Navire'], c['Date Départ'], c['Date Retour'], c['Nuits'],
            c['Itinéraire'], c['Port Départ'], ports_str,
            c['Prix Int.'], c['Prix Ext.'], c['Prix Balcon'],
            c['Prix Vol MTL Int.'], c['Prix Vol MTL Ext.'], c['Prix Vol MTL Balcon'],
            c['Boissons'], c['Pourboires'], c['WiFi'],
            c['Image Itinéraire'], url_navire, c['Lien'], lien_seg, c['section']
        ))

    conn.commit()
    conn.close()
    print(f"💾 {len(tous_les_resultats)} croisières enregistrées — "
          f"✅ {liens_ok} liens SEG, ⚠️  {liens_vide} sans lien.")
    print(f"🖼️  Images navires — ✅ {imgs_ok} téléchargées, ⏭️  {imgs_skip} depuis cache.")

    # ── Export JSON par section pour React ───────────────────────────────────
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    os.makedirs(JSON_DIR, exist_ok=True)

    sections_map = {
        "sud":       "croisieres-sud",
        "europe":    "croisieres-europe",
        "alaska":    "croisieres-alaska",
        "exotiques": "croisieres-exotiques",
    }

    for section_key, fichier in sections_map.items():
        cursor.execute(
            "SELECT * FROM mes_croisieres WHERE section = ? ORDER BY date_depart ASC",
            (section_key,)
        )
        rows = [dict(row) for row in cursor.fetchall()]

        for row in rows:
            row['Ports']                = row['ports'].split(',') if row['ports'] else []
            row['Croisiériste']         = row['croisieriste']
            row['Navire']               = row['navire']
            row['Date Départ']          = row['date_depart']
            row['Date Retour']          = row['date_retour']
            row['Nuits']                = row['nuits']
            row['Itinéraire']           = row['itineraire']
            row['Port Départ']          = row['port_depart']
            row['Prix Int.']            = row['prix_int']
            row['Prix Ext.']            = row['prix_ext']
            row['Prix Balcon']          = row['prix_balcon']
            row['Prix Vol MTL Int.']    = row['prix_vol_int']
            row['Prix Vol MTL Ext.']    = row['prix_vol_ext']
            row['Prix Vol MTL Balcon']  = row['prix_vol_balcon']
            row['Boissons']             = row['boissons']
            row['Pourboires']           = row['pourboires']
            row['WiFi']                 = row['wifi']
            row['Image Itinéraire']     = row['image_itin']
            row['Image Navire']         = row['image_navire']
            row['Lien']                 = row['lien_constellation']
            row['LienSEG']              = row['lien_seg']
            row['_dest']                = 'caraibes' if section_key == 'sud' else section_key

        json_path = os.path.join(JSON_DIR, f"{fichier}.json")
        temp_path = json_path + ".tmp"
        with open(temp_path, 'w', encoding='utf-8') as f:
            json.dump(rows, f, indent=2, ensure_ascii=False)
        if os.path.exists(json_path):
            os.remove(json_path)
        os.rename(temp_path, json_path)
        print(f"   📄 {fichier}.json ({len(rows)} croisières)")

    conn.close()

# ─────────────────────────────────────────
#  EXTRACTION HTML → DONNÉES
# ─────────────────────────────────────────
def extraire_html(html, nom_section):
    t0 = time.perf_counter()

    blocs    = RE_BLOCS.findall(html)
    prix_map = {(m.group(1), m.group(2), m.group(3)): int(m.group(4)) for m in RE_PRIX.finditer(html)}
    incl_map = {}
    for m in RE_INCL.finditer(html):
        n = m.group(3)
        if n not in incl_map:
            incl_map[n] = {}
        incl_map[n][m.group(2)] = m.group(1)

    img_itin   = dict(RE_MAP.findall(html))
    img_navire = dict(RE_PRV.findall(html))

    resultats, ignores = [], 0

    for href, num, c in blocs:
        try:
            itin   = RE_ITIN.search(c)
            navire = RE_NAVIRE.search(c)
            date_b = RE_DATE.search(c)
            port   = RE_PORT.search(c)

            nom_navire  = navire.group(1).strip() if navire else "Inconnu"
            date_txt    = date_b.group(1).strip() if date_b else ""
            d_dep, d_ret, nuits = extraire_dates(date_txt)

            if d_dep != "N/A" and d_ret != "N/A":
                if not re.match(r"^\d{4}-\d{2}-\d{2}$", d_dep) or not re.match(r"^\d{4}-\d{2}-\d{2}$", d_ret):
                    print(f"⚠️ Date invalide: {nom_navire} | brut: {date_txt} | dep={d_dep} ret={d_ret}")

            p_int = prix_map.get((num, 'I', 'no'), 0)
            p_ext = prix_map.get((num, 'O', 'no'), 0)
            p_bal = prix_map.get((num, 'B', 'no'), 0)

            if p_int == 0 and p_ext == 0 and p_bal == 0:
                ignores += 1
                continue

            incl        = incl_map.get(num, {})
            codes       = extraire_codes_ports(img_itin.get(num, ''))
            port_depart = port.group(1).strip() if port else "N/A"
            if port_depart == "N/A" and codes:
                port_depart = codes[0]

            resultats.append({
                'Croisiériste':        identifier_compagnie(nom_navire),
                'Navire':              nom_navire,
                'Date Départ':         d_dep,
                'Date Retour':         d_ret,
                'Nuits':               nuits,
                'Itinéraire':          itin.group(1).strip() if itin else "N/A",
                'Port Départ':         port_depart,
                'Ports':               codes,
                'Prix Int.':           p_int,
                'Prix Ext.':           p_ext,
                'Prix Balcon':         p_bal,
                'Prix Vol MTL Int.':   prix_map.get((num, 'I', 'dr_wi_ti'), 0),
                'Prix Vol MTL Ext.':   prix_map.get((num, 'O', 'dr_wi_ti'), 0),
                'Prix Vol MTL Balcon': prix_map.get((num, 'B', 'dr_wi_ti'), 0),
                'Boissons':            INCL_LABEL.get(incl.get('drinks', ''), '?'),
                'Pourboires':          INCL_LABEL.get(incl.get('tips',   ''), '?'),
                'WiFi':                INCL_LABEL.get(incl.get('wifi',   ''), '?'),
                'Image Itinéraire':    normaliser_img(img_itin.get(num, '')),
                'Image Navire':        normaliser_img(img_navire.get(num, '')),
                'Lien':                BASE_URL + href,
                'section':             nom_section,
            })
        except Exception:
            pass

    resultats.sort(key=lambda x: (x['Date Départ'], x['Croisiériste'], x['Prix Int.'] or 99999))

    elapsed = time.perf_counter() - t0
    print(f"   ✅ {len(resultats)} croisières extraites en {elapsed:.2f}s ({ignores} sans prix ignorées)")

    return resultats

# ─────────────────────────────────────────
#  ROBOT PRINCIPAL
# ─────────────────────────────────────────
def lancer_robot():
    print("🚢 Démarrage du robot Voyages Constellation...\n")

    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    ]

    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument(f"--user-agent={random.choice(USER_AGENTS)}")
    chrome_options.binary_location = "/usr/bin/chromium-browser"

    driver = webdriver.Chrome(
        service=Service('/usr/bin/chromedriver'),
        options=chrome_options
    )

    tous_les_resultats = []
    t_global = time.perf_counter()

    try:
        for nom, url in SECTIONS.items():
            print(f"📍 Section : {nom}")
            print(f"   URL : {url}")

            t0 = time.perf_counter()
            driver.get(url)
            time.sleep(DELAI_RENDU)
            html = driver.page_source
            print(f"   🌐 Chargé en {time.perf_counter()-t0:.1f}s")

            resultats = extraire_html(html, nom)
            tous_les_resultats.extend(resultats)
            time.sleep(random.uniform(2, 6))

    finally:
        driver.quit()

    sauvegarder_db(tous_les_resultats)
    print(f"\n🏁 Terminé — {len(tous_les_resultats)} croisières au total en {time.perf_counter()-t_global:.1f}s")

if __name__ == "__main__":
    lancer_robot()