from __future__ import annotations
import sys, json, re, time, sqlite3, os
import requests
from bs4 import BeautifulSoup

BASE_LIST_URL   = "https://www.cruisespecialists.com/{year}-World-Cruises.aspx"
BASE_DETAIL_URL = "https://www.cruisespecialists.com/cruise-promotion-detail.aspx?packageId={pkg_id}"
OUTPUT_JSON     = "world_cruises.json"
OUTPUT_DB       = "world_cruises.db"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}

# ─── Helpers ──────────────────────────────────────────────────────────────────

def clean(text):
    return " ".join(text.split()).strip() if text else ""

def parse_price(text):
    if not text: return None
    digits = re.sub(r"[^\d]", "", text)
    return int(digits) if digits else None

def parse_duration(text):
    if not text: return None
    m = re.search(r"\d+", text)
    return int(m.group()) if m else None

def parse_date(text):
    if not text: return None
    parts = clean(text).split("/")
    if len(parts) == 3:
        try:
            mo, d, y = int(parts[0]), int(parts[1]), int(parts[2])
            return f"{y:04d}-{mo:02d}-{d:02d}"
        except: pass
    return text

def get_field(label, section):
    if not section: return ""
    for lbl in section.find_all("div", class_="div_square_offer_box_label"):
        if label.lower() in lbl.get_text().lower():
            nxt = lbl.find_next_sibling("div", class_="div_square_offer_box_info")
            if nxt: return clean(nxt.get_text())
    return ""

def fetch(url):
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        return resp.text
    except Exception as e:
        print(f"    ❌ {e}")
        return None

# ─── Étape 1 : scrape la liste annuelle ───────────────────────────────────────

def scrape_year(year):
    url = BASE_LIST_URL.format(year=year)
    print(f"\n🌍 Liste {year} → {url}")
    html = fetch(url)
    if not html: return []

    soup = BeautifulSoup(html, "html.parser")
    h1 = soup.find("h1")
    if not h1 or "world cruise" not in h1.get_text().lower():
        print(f"  ⚠️  Page introuvable"); return []

    boxes = soup.find_all("div", class_="div_square_offer_box_tall")
    print(f"  ✅ {len(boxes)} croisières trouvées")

    cruises = []
    for box in boxes:
        c = {"year": year}
        t = box.find("div", class_="div_square_offer_box_title_large")
        a = t.find("a") if t else None
        if a:
            c["title"] = clean(a.get_text())
            href = a.get("href", "")
            c["detail_url"] = ("https://www.cruisespecialists.com" + href) if href and not href.startswith("http") else href
        else:
            c["title"] = f"{year} World Cruise"; c["detail_url"] = None

        pkg = re.search(r"packageId=(\d+)", c.get("detail_url") or "")
        c["package_id"] = int(pkg.group(1)) if pkg else None

        info = box.find("div", class_="hidden-md")
        c["cruise_line"]    = get_field("Cruise Line", info)
        c["ship"]           = get_field("Ship",        info)
        c["departure_date"] = parse_date(get_field("Departure", info))
        c["duration_days"]  = parse_duration(get_field("Length", info))
        c["departure_port"] = get_field("Starts",    info)
        c["capacity"]       = get_field("Capacity",  info)

        pd = box.find("div", class_="div_square_offer_box_blue_price")
        c["price_from"] = parse_price(pd.get_text()) if pd else None

        bl = box.find("div", id="div_Bullets")
        c["highlights"] = [clean(li.get_text()) for li in bl.find_all("li") if clean(li.get_text())] if bl else []

        img = box.find("img", class_="div_square_offer_box_feature")
        c["image_url"] = img.get("src", "") if img else ""

        cruises.append(c)
        prix = f"${c['price_from']:,}" if c["price_from"] else "N/A"
        print(f"  • [{c['cruise_line']}] {c['title']} | {c['departure_date']} | {prix}")

    return cruises

# ─── Étape 2 : scrape les détails d'un packageId ──────────────────────────────

def scrape_detail(package_id):
    url = BASE_DETAIL_URL.format(pkg_id=package_id)
    html = fetch(url)
    if not html: return {}

    soup = BeautifulSoup(html, "html.parser")
    d = {"package_id": package_id}

    desc = soup.find("div", id="ContentPlaceHolder1_div_DescriptionShort")
    d["description"] = clean(desc.get_text()) if desc else ""

    offer_title = soup.find("h3", id="ContentPlaceHolder1_header_OfferTitle")
    d["offer_title"] = clean(offer_title.get_text()) if offer_title else ""

    subtitle = soup.find("h2", id="ContentPlaceHolder1_header_CruiseLineTitle")
    d["itinerary_subtitle"] = clean(subtitle.get_text()) if subtitle else ""

    for field, el_id in [
        ("main_image_url",       "ContentPlaceHolder1_img_PackageImage"),
        ("map_image_url",        "ContentPlaceHolder1_img_ItineraryMap"),
        ("ship_image_url",       "ContentPlaceHolder1_img_ShipImage"),
        ("cruise_line_logo_url", "ContentPlaceHolder1_img_VendorLogo"),
    ]:
        el = soup.find("img", id=el_id)
        d[field] = el.get("src", "") if el else ""

    price_div = soup.find("div", id="ContentPlaceHolder1_div_TopStartingFrom")
    if price_div:
        digits = re.sub(r"[^\d]", "", price_div.get_text())
        d["price_from_detail"] = int(digits) if digits else None

    amenities_div = soup.find("div", id="ContentPlaceHolder1_div_AmenitiesForSingleOffer")
    if amenities_div:
        d["amenities"] = [clean(li.get_text()) for li in amenities_div.find_all("li") if clean(li.get_text())]
        d["amenities_html"] = str(amenities_div)
    else:
        d["amenities"] = []; d["amenities_html"] = ""

    itinerary_table = soup.find("table", id="tbl_EmptyTable")
    ports = []
    if itinerary_table:
        for row in itinerary_table.find_all("tr")[1:]:
            cols = row.find_all("td")
            if len(cols) >= 5:
                port = clean(cols[2].get_text())
                if port:
                    ports.append({
                        "date":   clean(cols[0].get_text()),
                        "day":    clean(cols[1].get_text()),
                        "port":   port,
                        "arrive": clean(cols[3].get_text()),
                        "depart": clean(cols[4].get_text()),
                    })
    d["itinerary_ports"] = ports

    disclaimer = soup.find("div", id="ContentPlaceHolder1_div_disclaimer")
    d["disclaimer"] = clean(disclaimer.get_text()) if disclaimer else ""

    return d

# ─── SQLite ────────────────────────────────────────────────────────────────────

def init_db(path):
    conn = sqlite3.connect(path)
    cur = conn.cursor()

    # Vérifie si la contrainte UNIQUE existe déjà
    cur.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='world_cruises'")
    row = cur.fetchone()
    if row and "UNIQUE" not in row[0]:
        print("  ⚠️  DB existante sans contrainte UNIQUE — recréation de la table...")
        cur.execute("DROP TABLE IF EXISTS world_cruises")
        conn.commit()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS world_cruises (
            id                   INTEGER PRIMARY KEY AUTOINCREMENT,
            year                 INTEGER,
            package_id           INTEGER UNIQUE,
            title                TEXT,
            cruise_line          TEXT,
            ship                 TEXT,
            departure_date       TEXT,
            duration_days        INTEGER,
            departure_port       TEXT,
            capacity             TEXT,
            price_from           INTEGER,
            highlights           TEXT,
            image_url            TEXT,
            detail_url           TEXT,
            description          TEXT,
            offer_title          TEXT,
            itinerary_subtitle   TEXT,
            main_image_url       TEXT,
            map_image_url        TEXT,
            ship_image_url       TEXT,
            cruise_line_logo_url TEXT,
            amenities            TEXT,
            amenities_html       TEXT,
            itinerary_ports      TEXT,
            disclaimer           TEXT,
            active               INTEGER DEFAULT 1,
            created_at           TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    return conn

def upsert_cruise(cur, c):
    cur.execute("""
        INSERT INTO world_cruises
          (year, package_id, title, cruise_line, ship, departure_date,
           duration_days, departure_port, capacity, price_from,
           highlights, image_url, detail_url,
           description, offer_title, itinerary_subtitle,
           main_image_url, map_image_url, ship_image_url, cruise_line_logo_url,
           amenities, amenities_html, itinerary_ports, disclaimer)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(package_id) DO UPDATE SET
          year=excluded.year, title=excluded.title,
          cruise_line=excluded.cruise_line, ship=excluded.ship,
          departure_date=excluded.departure_date, duration_days=excluded.duration_days,
          departure_port=excluded.departure_port, capacity=excluded.capacity,
          price_from=excluded.price_from, highlights=excluded.highlights,
          image_url=excluded.image_url, detail_url=excluded.detail_url,
          description=excluded.description, offer_title=excluded.offer_title,
          itinerary_subtitle=excluded.itinerary_subtitle,
          main_image_url=excluded.main_image_url, map_image_url=excluded.map_image_url,
          ship_image_url=excluded.ship_image_url,
          cruise_line_logo_url=excluded.cruise_line_logo_url,
          amenities=excluded.amenities, amenities_html=excluded.amenities_html,
          itinerary_ports=excluded.itinerary_ports, disclaimer=excluded.disclaimer
    """, (
        c.get("year"), c.get("package_id"), c.get("title"),
        c.get("cruise_line"), c.get("ship"), c.get("departure_date"),
        c.get("duration_days"), c.get("departure_port"), c.get("capacity"),
        c.get("price_from"),
        json.dumps(c.get("highlights", []), ensure_ascii=False),
        c.get("image_url"), c.get("detail_url"),
        c.get("description"), c.get("offer_title"), c.get("itinerary_subtitle"),
        c.get("main_image_url"), c.get("map_image_url"), c.get("ship_image_url"),
        c.get("cruise_line_logo_url"),
        json.dumps(c.get("amenities", []), ensure_ascii=False),
        c.get("amenities_html"),
        json.dumps(c.get("itinerary_ports", []), ensure_ascii=False),
        c.get("disclaimer"),
    ))

# ─── Main ──────────────────────────────────────────────────────────────────────

def main():
    years = [int(a) for a in sys.argv[1:]] if len(sys.argv) > 1 else [2027, 2028, 2029]
    print(f"🚢 World Cruises Scraper — années: {years}")
    print("=" * 60)

    conn = init_db(OUTPUT_DB)
    cur = conn.cursor()
    all_cruises = []

    # ── Phase 1 : listes annuelles ────────────────────────────────────────────
    print("\n📋 PHASE 1 — Listes annuelles")
    for i, year in enumerate(years):
        cruises = scrape_year(year)
        all_cruises.extend(cruises)
        if i < len(years) - 1:
            time.sleep(2)

    if not all_cruises:
        print("\n⚠️  Aucune croisière trouvée."); sys.exit(1)

    print(f"\n✅ {len(all_cruises)} croisières récupérées au total")

    # ── Phase 2 : détails par packageId ──────────────────────────────────────
    print(f"\n📋 PHASE 2 — Détails ({len(all_cruises)} pages)")
    print("=" * 60)

    for i, cruise in enumerate(all_cruises):
        pkg_id = cruise.get("package_id")
        if not pkg_id:
            print(f"  [{i+1}/{len(all_cruises)}] ⚠️  Pas de packageId pour: {cruise['title']}")
            upsert_cruise(cur, cruise)
            conn.commit()
            continue

        print(f"  [{i+1}/{len(all_cruises)}] packageId={pkg_id} — {cruise['cruise_line']} {cruise['title']}")
        detail = scrape_detail(pkg_id)

        # Fusionne les données de liste + détail
        cruise.update(detail)
        ports_n = len(cruise.get("itinerary_ports", []))
        amen_n  = len(cruise.get("amenities", []))

        # Skip si pas de ports (croisière incomplète / pas encore publiée)
        if ports_n == 0:
            print(f"    ⏭️  Skipped — aucun port dans l'itinéraire")
            if i < len(all_cruises) - 1:
                time.sleep(1.5)
            continue

        print(f"    ✅ {ports_n} ports | {amen_n} aménités | {cruise.get('offer_title', '')[:55]}")

        upsert_cruise(cur, cruise)
        conn.commit()

        if i < len(all_cruises) - 1:
            time.sleep(1.5)

    conn.close()

    # ── Export JSON final ─────────────────────────────────────────────────────
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(all_cruises, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"✅ Terminé!")
    print(f"📄 JSON  → {OUTPUT_JSON}")
    print(f"🗄️  SQLite → {OUTPUT_DB}")
    print(f"\n📊 Résumé:")
    for year in years:
        s = [c for c in all_cruises if c["year"] == year]
        p = [c["price_from"] for c in s if c.get("price_from")]
        if s:
            line = f"  {year}: {len(s)} croisières"
            if p: line += f" | ${min(p):,} → ${max(p):,}"
            print(line)

if __name__ == "__main__":
    main()