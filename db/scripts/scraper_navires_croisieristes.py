#!/usr/bin/env python3
"""
scraper_navires.py — Scrape navires + compagnies depuis CruiseMapper
Tables créées: navires, croisieristes

Installation:
    pip install requests beautifulsoup4 --break-system-packages

Usage:
    python3 scraper_navires.py              # tout scraper
    python3 scraper_navires.py --echecs     # retenter les échecs
    python3 scraper_navires.py --stats      # stats DB
    python3 scraper_navires.py --limit 5    # test 5 navires
"""

import sqlite3, time, json, re, argparse
from pathlib import Path
import requests
from bs4 import BeautifulSoup

# ── Config ────────────────────────────────────────────────────────────────────

DB_PATH  = Path(__file__).parent.parent / "aeria.db"
DELAY    = 1.5
TIMEOUT  = 15
BASE_URL = "https://www.cruisemapper.com"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9",
}

RE_NAVIRE    = re.compile(r'/ships/([\w-]+-\d+)$')
RE_COMPAGNIE = re.compile(r'/cruise-lines/([\w-]+-\d+)$')

NOM_CORRECTIONS = {
    "Celebrity Millenium":      "Celebrity Millennium",
    "Independance of the Seas": "Independence of the Seas",
    "NCL Pride of America":     "Pride of America",
}

# ── Schema ────────────────────────────────────────────────────────────────────

SCHEMA = """
CREATE TABLE IF NOT EXISTS croisieristes (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    nom              TEXT NOT NULL UNIQUE,
    nom_court        TEXT,
    siege_social     TEXT,
    fondee_annee     INTEGER,
    flotte_nb        INTEGER,
    site_web         TEXT,
    description      TEXT,
    logo_url         TEXT,
    lien_cruisemapper TEXT,
    scrape_ok        INTEGER DEFAULT 0,
    scrape_date      TEXT DEFAULT (date('now')),
    donnees_brutes   TEXT
);
CREATE INDEX IF NOT EXISTS idx_croisieristes_nom ON croisieristes(nom);

CREATE TABLE IF NOT EXISTS navires (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    nom                TEXT NOT NULL UNIQUE,
    croisieriste       TEXT,
    annee_construction INTEGER,
    annee_renovation   INTEGER,
    chantier_naval     TEXT,
    pavillon           TEXT,
    tonnage            INTEGER,
    longueur_m         REAL,
    largeur_m          REAL,
    vitesse_noeuds     REAL,
    nb_ponts           INTEGER,
    nb_passagers       INTEGER,
    nb_passagers_max   INTEGER,
    nb_equipage        INTEGER,
    nb_cabines         INTEGER,
    image_url          TEXT,
    description        TEXT,
    lien_cruisemapper  TEXT,
    scrape_ok          INTEGER DEFAULT 0,
    scrape_date        TEXT DEFAULT (date('now')),
    donnees_brutes     TEXT,
    statut             TEXT
);
CREATE INDEX IF NOT EXISTS idx_navires_nom ON navires(nom);
"""

# ── Utilitaires ───────────────────────────────────────────────────────────────

def to_int(v):
    if not v: return None
    m = re.search(r'[\d]{2,}', str(v).replace(',','').replace(' ',''))
    return int(m.group()) if m else None

def to_float(v):
    if not v: return None
    m = re.search(r'\d+\.?\d*', str(v))
    return float(m.group()) if m else None

def full_url(href):
    return href if href.startswith('http') else BASE_URL + href

def slug_to_nom(slug):
    """'Symphony-of-the-Seas-1237' → 'Symphony of the Seas'"""
    return re.sub(r'-\d+$', '', slug).replace('-', ' ')

# ── Parser compagnie ──────────────────────────────────────────────────────────

def parser_compagnie(html, url, nom_comp):
    soup = BeautifulSoup(html, 'html.parser')
    data = {'nom': nom_comp, 'lien_cruisemapper': url, 'scrape_ok': 0}

    # Logo
    for sel in ['img.line-logo','img.company-logo','.cruise-line-logo img','img[src*="lines"]']:
        img = soup.select_one(sel)
        if img and img.get('src'):
            data['logo_url'] = full_url(img['src'])
            break

    # Specs dans tableaux/dl
    specs = {}
    for row in soup.select('table tr'):
        cols = row.select('td,th')
        if len(cols) >= 2:
            k = cols[0].get_text(strip=True).lower().rstrip(':')
            v = cols[1].get_text(strip=True)
            if k and v: specs[k] = v
    for dl in soup.select('dl'):
        for dt, dd in zip(dl.select('dt'), dl.select('dd')):
            k = dt.get_text(strip=True).lower().rstrip(':')
            v = dd.get_text(strip=True)
            if k and v: specs[k] = v
    for li in soup.select('li'):
        m = re.match(r'^([^:]{3,40}):\s*(.+)$', li.get_text(strip=True))
        if m: specs[m.group(1).lower().strip()] = m.group(2).strip()

    data['donnees_brutes'] = json.dumps(specs, ensure_ascii=False)

    MAPPING_COMP = {
        'siege_social':  ['headquarters','head office','based in','home port'],
        'fondee_annee':  ['founded','year founded','established'],
        'flotte_nb':     ['fleet size','number of ships','ships in fleet','vessels'],
        'site_web':      ['website','official website','web'],
        'nom_court':     ['abbreviation','short name','also known as'],
    }

    for col, cles in MAPPING_COMP.items():
        for cle in cles:
            if cle in specs:
                val = specs[cle]
                if col in ('fondee_annee','flotte_nb'):
                    data[col] = to_int(val)
                else:
                    data[col] = val[:200]
                break

    # Description
    for sel in ['.company-description p','.about p','.intro p','#description p']:
        desc = soup.select_one(sel)
        if desc:
            data['description'] = desc.get_text(strip=True)[:1000]
            break

    nb = sum(1 for k in ['siege_social','fondee_annee','flotte_nb'] if data.get(k))
    data['scrape_ok'] = 1 if nb >= 1 else 0
    return data


# ── Parser navire ─────────────────────────────────────────────────────────────

def parser_navire(html, url):
    soup = BeautifulSoup(html, 'html.parser')
    data = {'lien_cruisemapper': url, 'scrape_ok': 0}

    for sel in ['.ship-main-photo','img[src*="/ships/"]','.ship-photo img']:
        img = soup.select_one(sel)
        if img and img.get('src'):
            data['image_url'] = full_url(img['src'])
            break

    specs = {}
    for row in soup.select('table tr'):
        cols = row.select('td,th')
        if len(cols) >= 2:
            k = cols[0].get_text(strip=True).lower().rstrip(':')
            v = cols[1].get_text(strip=True)
            if k and v: specs[k] = v
    for dl in soup.select('dl'):
        for dt, dd in zip(dl.select('dt'), dl.select('dd')):
            k = dt.get_text(strip=True).lower().rstrip(':')
            v = dd.get_text(strip=True)
            if k and v: specs[k] = v
    for li in soup.select('li'):
        m = re.match(r'^([^:]{3,40}):\s*(.+)$', li.get_text(strip=True))
        if m: specs[m.group(1).lower().strip()] = m.group(2).strip()

    data['donnees_brutes'] = json.dumps(specs, ensure_ascii=False)

    # MAPPING corrigé selon les vraies clés CruiseMapper
    MAPPING = {
        'annee_construction': ['year of build','year built','year build','built','construction year'],
        'annee_renovation':   ['last refurbishment','refurbished','renovated','refit','year refitted'],
        'chantier_naval':     ['builder','shipyard','built by','yard'],
        'pavillon':           ['flag state','flag','registry'],
        'tonnage':            ['gross tonnage','gt','tonnage','grt'],
        'longueur_m':         ['length (loa)','length overall','length','loa'],
        'largeur_m':          ['beam (width)','beam','beam (m)','width'],
        'vitesse_noeuds':     ['speed','max speed','service speed','knots'],
        'nb_ponts':           ['decks','passenger decks','number of decks'],
        'nb_passagers':       ['passengers','double occupancy','passenger capacity','capacity'],
        'nb_passagers_max':   ['max passengers','maximum capacity','capacity (max)'],
        'nb_equipage':        ['crew','crew members','officers and crew'],
        'nb_cabines':         ['cabins','staterooms','number of cabins'],
    }

    for col, cles in MAPPING.items():
        for cle in cles:
            if cle in specs:
                val = specs[cle]
                if col in ('longueur_m','largeur_m','vitesse_noeuds'):
                    data[col] = to_float(val)
                elif col not in ('chantier_naval','pavillon'):
                    data[col] = to_int(val)
                else:
                    data[col] = val[:200]
                if data.get(col): break

    for sel in ['.ship-description p','#description p','.intro p','.about p']:
        desc = soup.select_one(sel)
        if desc:
            data['description'] = desc.get_text(strip=True)[:1000]
            break

    nb = sum(1 for k in ['tonnage','nb_passagers','annee_construction','nb_ponts','longueur_m','nb_equipage']
             if data.get(k))
    data['scrape_ok'] = 1 if nb >= 2 else 0
    return data, nb


# ── Sauvegarde ────────────────────────────────────────────────────────────────

COLS_COMP = ['nom','nom_court','siege_social','fondee_annee','flotte_nb','site_web',
             'description','logo_url','lien_cruisemapper','scrape_ok','donnees_brutes']

COLS_NAV  = ['nom','croisieriste','annee_construction','annee_renovation','chantier_naval',
             'pavillon','tonnage','longueur_m','largeur_m','vitesse_noeuds','nb_ponts',
             'nb_passagers','nb_passagers_max','nb_equipage','nb_cabines','image_url',
             'description','lien_cruisemapper','scrape_ok','donnees_brutes']

def upsert(cur, table, cols, data):
    vals = [data.get(c) for c in cols]
    ph   = ','.join(['?'] * len(cols))
    upd  = ','.join([f"{c}=excluded.{c}" for c in cols if c != 'nom'])
    cur.execute(
        f"INSERT INTO {table} ({','.join(cols)}) VALUES ({ph}) "
        f"ON CONFLICT(nom) DO UPDATE SET {upd}", vals)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--echecs',  action='store_true', help='Retenter les échecs (scrape_ok=0)')
    ap.add_argument('--all',     action='store_true', help='Rescraper TOUS les navires (même scrape_ok=1)')
    ap.add_argument('--stats',   action='store_true', help='Stats DB')
    ap.add_argument('--limit',   type=int,            help='Limiter à N navires')
    args = ap.parse_args()

    print("🚢 Scraper Navires + Compagnies — CruiseMapper\n")

    conn = sqlite3.connect(DB_PATH)
    cur  = conn.cursor()
    cur.executescript(SCHEMA)
    conn.commit()

    if args.stats:
        cur.execute("SELECT COUNT(*) FROM navires"); nv = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM navires WHERE scrape_ok=1"); nv_ok = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM navires WHERE statut='données_insuffisantes'"); nv_insuf = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM croisieristes"); cr = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM croisieristes WHERE scrape_ok=1"); cr_ok = cur.fetchone()[0]
        print(f"Navires:              {nv_ok}/{nv} scrapés OK")
        print(f"Données insuffisantes:{nv_insuf}")
        print(f"Compagnies:           {cr_ok}/{cr} scrapées OK")
        conn.close(); return

    session = requests.Session()

    # ── Étape 1: Liste des compagnies ─────────────────────────────────────────
    print("📋 Récupération des compagnies...")
    compagnies = {}

    try:
        r = session.get(f"{BASE_URL}/ships", headers=HEADERS, timeout=TIMEOUT)
        time.sleep(1)
        soup = BeautifulSoup(r.text, 'html.parser')

        for a in soup.find_all('a', href=RE_COMPAGNIE):
            url_c = full_url(a['href'])
            nom_c = a.get_text(strip=True)
            if url_c not in compagnies and nom_c:
                compagnies[url_c] = nom_c

        print(f"  → {len(compagnies)} compagnies\n")
    except Exception as e:
        print(f"  ❌ {e}\n")

    # ── Étape 2: Scraper chaque page compagnie ────────────────────────────────
    print("🏢 Scraping des compagnies + liste de leurs navires...")
    tous_navires = {}

    for i, (url_c, nom_c) in enumerate(compagnies.items(), 1):
        print(f"  [{i:3d}/{len(compagnies)}] {nom_c[:45]:<45}", end=' ', flush=True)

        try:
            r = session.get(url_c, headers=HEADERS, timeout=TIMEOUT)
            time.sleep(DELAY)

            data_comp = parser_compagnie(r.text, url_c, nom_c)
            upsert(cur, 'croisieristes', COLS_COMP, data_comp)
            conn.commit()

            soup = BeautifulSoup(r.text, 'html.parser')
            nb_navires = 0
            for a in soup.find_all('a', href=RE_NAVIRE):
                url_n = full_url(a['href'])
                if url_n not in tous_navires:
                    m = RE_NAVIRE.search(a['href'])
                    h = a.find(['h3','h2','h4'])
                    nom_n = (h or a).get_text(strip=True)
                    if not nom_n or nom_n.lower() in ('review','itineraries','deckplans','tracker','cabins'):
                        nom_n = slug_to_nom(m.group(1)) if m else ''
                    if nom_n and len(nom_n) > 3:
                        tous_navires[url_n] = {'nom': nom_n, 'url': url_n, 'croisieriste': nom_c}
                        nb_navires += 1

            status = '✅' if data_comp['scrape_ok'] else '⚠️ '
            print(f"{status} comp | {nb_navires} navires")

        except KeyboardInterrupt:
            print("\n⏹️  Interrompu.")
            conn.close(); return
        except Exception as e:
            print(f"❌ {e}")
            time.sleep(DELAY)

    print(f"\n  → {len(tous_navires)} navires uniques trouvés\n")

    # ── Étape 3: Sélection des navires à scraper ──────────────────────────────
    liste_navires = list(tous_navires.values())

    if args.echecs:
        cur.execute("SELECT nom FROM navires WHERE scrape_ok=0 AND (statut IS NULL OR statut != 'données_insuffisantes')")
        echecs_set = {r[0] for r in cur.fetchall()}
        liste_navires = [n for n in liste_navires if n['nom'] in echecs_set]
        print(f"🔁 Retenter {len(liste_navires)} échecs\n")
    elif args.all:
        print(f"🔄 Rescraper tous les {len(liste_navires)} navires\n")
    else:
        cur.execute("SELECT nom FROM navires WHERE scrape_ok=1")
        deja = {r[0] for r in cur.fetchall()}
        liste_navires = [n for n in liste_navires if n['nom'] not in deja]
        print(f"🚢 Scraping {len(liste_navires)} navires...\n")

    if args.limit:
        liste_navires = liste_navires[:args.limit]
        print(f"🔍 Limité à {args.limit}\n")

    succes, echecs = 0, []

    for i, nav in enumerate(liste_navires, 1):
        nom, url, comp = nav['nom'], nav['url'], nav.get('croisieriste','')
        print(f"[{i:4d}/{len(liste_navires)}] {nom[:45]:<45}", end=' ', flush=True)

        try:
            r = session.get(url, headers=HEADERS, timeout=TIMEOUT)
            time.sleep(DELAY)

            if r.status_code != 200:
                print(f"HTTP {r.status_code}")
                echecs.append(nom)
                upsert(cur, 'navires', COLS_NAV, {
                    'nom': nom, 'croisieriste': comp, 'lien_cruisemapper': url,
                    'scrape_ok': 0, 'donnees_brutes': f"HTTP {r.status_code}"})
                conn.commit(); continue

            data, nb = parser_navire(r.text, url)
            data['nom'] = nom
            data['croisieriste'] = comp
            upsert(cur, 'navires', COLS_NAV, data)
            conn.commit()

            print(f"{'✅' if data['scrape_ok'] else '⚠️ '} {nb} specs")
            if data['scrape_ok']: succes += 1
            else: echecs.append(nom)

        except KeyboardInterrupt:
            print("\n⏹️  Interrompu — données sauvegardées.")
            break
        except Exception as e:
            print(f"❌ {e}")
            echecs.append(nom)
            time.sleep(DELAY)

    conn.close()
    print(f"\n{'='*55}")
    print(f"✅ Navires OK:   {succes}/{len(liste_navires)}")
    if echecs:
        print(f"❌ Échecs:      {len(echecs)} → relancer avec --echecs")
        mins = (len(echecs) * (DELAY + 0.5)) / 60
        print(f"   Temps estimé: ~{mins:.0f} min")

if __name__ == "__main__":
    main()