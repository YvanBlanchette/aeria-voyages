import json
import csv
import re
import os
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

# ─────────────────────────────────────────
#  CONFIGURATION
# ─────────────────────────────────────────
SECTIONS = {
    "croisieres-sud":       "https://www.voyagesconstellation.com/croisieres-sud",
    "croisieres-europe":    "https://www.voyagesconstellation.com/croisieres-europe",
    "croisieres-alaska":    "https://www.voyagesconstellation.com/croisieres-alaska",
    "croisieres-exotiques": "https://www.voyagesconstellation.com/croisieres-exotiques",
}

BASE_URL    = "https://www.voyagesconstellation.com"
BASE_IMG    = "https://www.voyagesconstellation.com"
DELAI_RENDU = 5

CHAMPS_CSV = [
    'Croisiériste', 'Navire', 'Date Départ', 'Date Retour', 'Nuits',
    'Itinéraire', 'Port Départ', 'Ports',
    'Prix Int.', 'Prix Ext.', 'Prix Balcon',
    'Prix Vol MTL Int.', 'Prix Vol MTL Ext.', 'Prix Vol MTL Balcon',
    'Boissons', 'Pourboires', 'WiFi',
    'Image Itinéraire', 'Image Navire',
    'Lien'
]

MOIS_MAP = {
    'janv': '01', 'févr': '02', 'mars': '03', 'avr': '04',
    'mai':  '05', 'juin': '06', 'juil': '07', 'août': '08',
    'sept': '09', 'oct':  '10', 'nov':  '11', 'déc':  '12'
}

INCL_LABEL = {'yes': 'Inclus', 'free': 'Gratuit', 'no': 'Non inclus'}

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
RE_PORT = re.compile(r'(?:D[ée]part)\s+de\s+([^<\n]+)', re.I)

# ─────────────────────────────────────────
#  EXTRACTION DES CODES DE PORTS
# ─────────────────────────────────────────
def extraire_codes_ports(url_carte):
    """
    Extrait les codes de ports depuis l'URL de la carte itinéraire.
    Retourne une liste de codes bruts normalisés en MAJUSCULES.

    Ex: .../itin/SEA-KTN-CYPR-CYCD-YYJ-SEA.webp
        → ['SEA', 'KTN', 'CYPR', 'CYCD', 'YYJ', 'SEA']
    """
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
    """
    Gère correctement les périodes qui traversent 2 années.
    Ex:
      - "27 déc au 2 janv 2027" -> départ 2026-12-27, retour 2027-01-02
      - "27 au 30 déc 2026"     -> départ 2026-12-27, retour 2026-12-30
      - "27 déc 2026 au 2 janv 2027" -> années explicites, on respecte
    """
    d_dep, d_ret, nuits = "N/A", "N/A", 0

    def mois_num(mois_texte):
        m = mois_texte.lower().replace('.', '').strip()
        for cle, num in MOIS_MAP.items():
            if cle in m:
                return int(num)
        return 1

    try:
        t = texte_brut.replace('\xa0', ' ').strip()

        # Cas explicite: "27 déc 2026 au 2 janv 2027"
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

        # année à la fin (souvent l'année de RETOUR)
        m_year_end = re.search(r'(\d{4})\s*$', t)
        if not m_year_end:
            return d_dep, d_ret, nuits
        year_end = int(m_year_end.group(1))

        # 1) "27 déc au 2 janv 2027"
        m_diff = re.search(r'(\d+)\s+([a-zéûà.]+)\s+au\s+(\d+)\s+([a-zéûà.]+)', t, re.I)

        # 2) "27 au 30 déc 2026"
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

        # recalcul nuits si possible
        if d_dep != "N/A" and d_ret != "N/A":
            dep_dt = datetime.strptime(d_dep, "%Y-%m-%d")
            ret_dt = datetime.strptime(d_ret, "%Y-%m-%d")

            # garde-fou: si malgré tout ret < dep, on assume que le retour est l'année suivante
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

def atomic_write(data, filename, is_json=True):
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
        print(f"   ❌ Erreur écriture {filename}: {e}")

# ─────────────────────────────────────────
#  EXTRACTION HTML → DONNÉES
# ─────────────────────────────────────────
def extraire_html(html, nom_section):
    t0 = time.perf_counter()

    blocs      = RE_BLOCS.findall(html)
    prix_map   = {(m.group(1), m.group(2), m.group(3)): int(m.group(4)) for m in RE_PRIX.finditer(html)}
    incl_map   = {}
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

            nom_navire = navire.group(1).strip() if navire else "Inconnu"
            date_txt = date_b.group(1).strip() if date_b else ""
            d_dep, d_ret, nuits = extraire_dates(date_txt)

            # Validation dates (debug utile)
            if d_dep != "N/A" and d_ret != "N/A":
                if not re.match(r"^\d{4}-\d{2}-\d{2}$", d_dep) or not re.match(r"^\d{4}-\d{2}-\d{2}$", d_ret):
                    print(f"⚠️ Date invalide: {nom_navire} | brut: {date_txt} | dep={d_dep} ret={d_ret}")

            p_int = prix_map.get((num, 'I', 'no'), 0)
            p_ext = prix_map.get((num, 'O', 'no'), 0)
            p_bal = prix_map.get((num, 'B', 'no'), 0)

            if p_int == 0 and p_ext == 0 and p_bal == 0:
                ignores += 1
                continue

            incl  = incl_map.get(num, {})
            codes = extraire_codes_ports(img_itin.get(num, ''))
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
                'Port Départ':         port.group(1).strip() if port else "N/A",
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

    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )

    total_global = 0
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
            total_global += len(resultats)

            atomic_write(resultats, f'{nom}.json', is_json=True)
            atomic_write(resultats, f'{nom}.csv', is_json=False)
            print(f"   💾 {nom}.json · {nom}.csv\n")

    finally:
        driver.quit()

    print(f"🏁 Terminé — {total_global} croisières au total en {time.perf_counter()-t_global:.1f}s")

if __name__ == "__main__":
    lancer_robot()
