"""
worker_acv_lastminute.py — Worker quotidien pour fetcher les forfaits soleil
d'Air Canada Vacations et les insérer dans la table `lastminute_acv` de la base SQLite.

Endpoint découvert via analyse du HTML de production ACV :
  VITE_PACKAGE_PROMOTIONS_ENDPOINT = "/promotion/promotions"
  VITE_MICROSERVICE_HOST            = "https://vacations-api.aircanada.com"

Les paramètres de l'UI sont : leaveFrom, travelTo, trip-departure-month,
duration (entier), starRating.

Usage : python worker_acv_lastminute.py
         python worker_acv_lastminute.py --sniff   # mode découverte réseau
         python worker_acv_lastminute.py --test    # test rapide (YUL→CUN, mars, 7j)
"""

import argparse
import sqlite3
import time
import json
import logging
import random
from itertools import product
from datetime import datetime, timezone
from pathlib import Path

import requests
from playwright.sync_api import sync_playwright, Request as PlaywrightRequest
from tqdm import tqdm

# ── Configuration ──────────────────────────────────────────────────────────────

DB_PATH = Path(__file__).parent / "../db/aeria.db"

# Gateways : Montréal, Québec, Ottawa, Toronto
GATEWAYS = ["YUL", "YQB", "YOW", "YYZ"]

# Destinations soleil — Cuba (HAV, VRA, SNU) exclue
DESTINATIONS_SUN = [
    "CUN", "PUJ", "AZS", "CZM", "CUR", "UVF", "MBJ", "PVR", "PTP", "FDF",
    "ANU", "GND", "LIR", "POP", "TQO", "CTG", "BGI", "NAS", "HUX", "SJD",
    "PLS", "GCM", "SJO", "SVD", "AUA", "SKB", "ZIH", "BDA", "GGT", "SXM",
    "SJU", "HNL", "OGG", "KOA", "BZE",
]

# Mois de dernière minute (format year_month identique à l'UI)
MONTHS = ["2026-02", "2026-03", "2026-04"]

# Durées en nuits — 7 nuits minimum
DURATIONS = [7, 10, 14]

REQUEST_DELAY = 1.2   # secondes entre chaque requête

# Endpoint découvert via analyse HTML (VITE_PACKAGE_PROMOTIONS_ENDPOINT)
API_URL = "https://vacations-api.aircanada.com/promotion/promotions"

# promotion_id candidats pour les forfaits soleil/packages.
# Si aucun résultat : lancer avec --sniff pour capturer la valeur réelle.
PROMOTION_IDS = [
    "top-sun-packages",
    "sun-packages",
    "top-package-deals",
    "package-deals",
    "forfaits-soleil",
    "top-forfaits-soleil",
]

# ── Logging ────────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
    handlers=[
        logging.FileHandler("worker_acv_lastminute.log", encoding="utf-8"),
    ],
)
log = logging.getLogger(__name__)

def tlog(msg: str):
    tqdm.write(msg)
    log.info(msg)

# ── Mode sniff : découverte des vrais endpoints ────────────────────────────────

def sniff_api_calls():
    """
    Lance un navigateur headless sur la page forfaits-soleil d'ACV
    et intercepte toutes les requêtes vers vacations-api.aircanada.com.
    """
    print("🔍  Mode sniff — navigation vers ACV pour intercepter les appels API...")
    captured = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page    = browser.new_page()

        def on_request(request: PlaywrightRequest):
            if "vacations-api.aircanada.com" in request.url:
                captured.append(request.url)
                print(f"  📡  {request.method} {request.url}")

        page.on("request", on_request)

        urls_to_try = [
            "https://vacations.aircanada.com/fr/packages/sun",
            "https://vacations.aircanada.com/en/packages/sun",
            "https://vacations.aircanada.com/fr/forfaits/soleil",
            "https://vacations.aircanada.com/fr/offers",
            "https://vacations.aircanada.com/fr",
        ]

        for url in urls_to_try:
            print(f"\n  🌐  Navigation vers : {url}")
            try:
                page.goto(url, wait_until="networkidle", timeout=45_000)
                page.wait_for_timeout(4_000)
            except Exception as exc:
                print(f"  ⚠️  Erreur : {exc}")

        browser.close()

    print(f"\n✅  {len(captured)} requête(s) API interceptée(s).")
    if captured:
        print("\nURLs capturées :")
        for url in captured:
            print(f"  → {url}")
    else:
        print("Aucune requête interceptée.")
        print("Inspectez les Network calls dans DevTools (F12) sur le site ACV.")
    return captured

# ── Token ──────────────────────────────────────────────────────────────────────

def get_token() -> str | None:
    """Lance un navigateur headless pour récupérer le Bearer Token ACV."""
    tlog("🤖  Récupération du token via Playwright...")
    try:
        with sync_playwright() as p:
            tlog("   → Lancement du navigateur Chromium...")
            browser = p.chromium.launch(headless=True)
            page    = browser.new_page()
            tlog("   → Chargement de vacations.aircanada.com (peut prendre 20-40s)...")
            page.goto("https://vacations.aircanada.com/fr", wait_until="networkidle", timeout=60_000)
            tlog("   → Page chargée, extraction du token...")
            token = page.evaluate("() => window.sso.getUserToken()")
            browser.close()
            if token:
                tlog("✅  Token obtenu.")
                return token
            tlog("❌  getUserToken() a retourné une valeur vide.")
            return None
    except Exception as exc:
        tlog(f"❌  Erreur Playwright : {exc}")
        return None

# ── Base de données ────────────────────────────────────────────────────────────

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("""
        CREATE TABLE IF NOT EXISTS lastminute_acv (
            id                TEXT PRIMARY KEY,
            product_type      TEXT,
            name              TEXT,
            hotel_name        TEXT,
            departure_city    TEXT,
            destination       TEXT,
            destination_code  TEXT,
            month             TEXT,
            duration          INTEGER,
            promotion_id      TEXT,
            price             REAL,
            original_price    REAL,
            discount_pct      REAL,
            days              INTEGER,
            nights            INTEGER,
            stars             REAL,
            board_basis       TEXT,
            image_url         TEXT,
            product_url       TEXT,
            departure_date    TEXT,
            return_date       TEXT,
            last_updated      TEXT
        )
    """)
    conn.commit()
    return conn

def upsert_deal(conn: sqlite3.Connection, row: dict) -> None:
    conn.execute("""
        INSERT OR REPLACE INTO lastminute_acv
            (id, product_type, name, hotel_name, departure_city, destination,
             destination_code, month, duration, promotion_id,
             price, original_price, discount_pct, days, nights,
             stars, board_basis, image_url, product_url,
             departure_date, return_date, last_updated)
        VALUES
            (:id, :product_type, :name, :hotel_name, :departure_city, :destination,
             :destination_code, :month, :duration, :promotion_id,
             :price, :original_price, :discount_pct, :days, :nights,
             :stars, :board_basis, :image_url, :product_url,
             :departure_date, :return_date, :last_updated)
    """, row)

# ── Parsing ────────────────────────────────────────────────────────────────────

def _safe_float(val, default=0.0) -> float:
    try:
        return float(val) if val is not None else default
    except (TypeError, ValueError):
        return default

def _safe_int(val, default=0) -> int:
    try:
        return int(val) if val is not None else default
    except (TypeError, ValueError):
        return default

def parse_response(data: dict, gateway: str, destination: str,
                   month: str, duration: int, promo_id: str) -> list[dict]:
    """
    Parse la réponse JSON de l'endpoint /promotion/promotions.
    Structure connue depuis worker-acv.py : { "products": [...] }
    """
    items = (
        data.get("products")
        or data.get("results")
        or data.get("packages")
        or data.get("deals")
        or data.get("items")
        or data.get("data")
        or []
    )

    deals = []
    now   = datetime.now(timezone.utc).isoformat()

    for item in items:
        try:
            raw_id = (
                item.get("acv_hotel_id")
                or item.get("acv_tour_id")
                or item.get("product_id")
                or item.get("id")
                or ""
            )
            deal_id = f"{raw_id}-{gateway}-{month}-{duration}"

            product_type = item.get("product_type") or item.get("type") or "package"

            name       = (item.get("hotel_name") or item.get("tour_name")
                          or item.get("package_name") or item.get("name") or "")
            hotel_name = item.get("hotel_name") or item.get("property_name") or name

            price          = _safe_float(item.get("price") or item.get("current_price") or item.get("sale_price"))
            original_price = _safe_float(item.get("original_price") or item.get("regular_price") or item.get("was_price"))
            discount_pct   = _safe_float(item.get("discount_percentage") or item.get("savings_pct"))
            if original_price and price and not discount_pct:
                discount_pct = round((1 - price / original_price) * 100, 1)

            days   = _safe_int(item.get("nb_days")   or item.get("duration_days"))
            nights = _safe_int(item.get("nb_nights") or item.get("duration_nights") or item.get("nights"))

            departure_date = item.get("departure_date") or item.get("depart_date") or ""
            return_date    = item.get("return_date")    or item.get("arrival_date") or ""

            dest_code = item.get("destination") or item.get("destination_code") or destination
            dest_name = item.get("destination_name") or item.get("destination_city") or destination

            stars       = _safe_float(item.get("star_rating") or item.get("stars") or item.get("category"))
            board_basis = item.get("board_basis") or item.get("meal_plan") or item.get("room_type") or ""

            images    = item.get("images") or []
            image_url = images[0].get("link_large", "") if images else (item.get("image_url") or item.get("thumbnail") or "")

            product_url = (
                item.get("hotel_static_pdp_url")
                or item.get("tour_static_pdp_url")
                or item.get("action_url")
                or item.get("url")
                or ""
            )

            deals.append({
                "id":               deal_id,
                "product_type":     product_type,
                "name":             name,
                "hotel_name":       hotel_name,
                "departure_city":   gateway,
                "destination":      dest_name,
                "destination_code": dest_code,
                "month":            month,
                "duration":         duration,
                "promotion_id":     promo_id,
                "price":            price,
                "original_price":   original_price,
                "discount_pct":     discount_pct,
                "days":             days,
                "nights":           nights,
                "stars":            stars,
                "board_basis":      board_basis,
                "image_url":        image_url,
                "product_url":      product_url,
                "departure_date":   departure_date,
                "return_date":      return_date,
                "last_updated":     now,
            })

        except Exception as exc:
            log.warning(f"  ⚠️  Parse error : {exc} — {item}")

    return deals

# ── Requête API avec retry sur 401 ────────────────────────────────────────────

def fetch_api(params: dict, headers: dict, on_token_expired) -> tuple[dict | None, dict]:
    try:
        resp = requests.get(API_URL, params=params, headers=headers, timeout=20)

        if resp.status_code == 401:
            new_token = on_token_expired()
            if new_token:
                headers = {**headers, "Authorization": f"Bearer {new_token}"}
                resp = requests.get(API_URL, params=params, headers=headers, timeout=20)

        if resp.status_code == 200:
            return resp.json(), headers

        log.warning(f"HTTP {resp.status_code} — {params.get('gateway')}→{params.get('destination')} "
                    f"{params.get('year_month')} {params.get('duration')}j promo={params.get('promotion_id')}")
        return None, headers

    except requests.exceptions.Timeout:
        log.warning(f"Timeout — {params}")
        return None, headers
    except Exception as exc:
        log.error(f"Erreur : {exc}")
        return None, headers

# ── Boucle principale ──────────────────────────────────────────────────────────

def run(test_mode: bool = False):
    token = get_token()
    if not token:
        tlog("💀  Impossible d'obtenir un token. Abandon.")
        return

    headers = {
        "User-Agent":    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                         "AppleWebKit/537.36 (KHTML, like Gecko) "
                         "Chrome/121.0.0.0 Safari/537.36",
        "Authorization": f"Bearer {token}",
        "Origin":        "https://vacations.aircanada.com",
        "Referer":       "https://vacations.aircanada.com/",
    }

    token_refreshed = False

    def on_token_expired():
        nonlocal token_refreshed
        if token_refreshed:
            tlog("💀  Token déjà rafraîchi. Abandon.")
            return None
        tlog("\n🔄  Token expiré — rafraîchissement...")
        new_token = get_token()
        token_refreshed = True
        return new_token

    conn = get_db_connection()

    if test_mode:
        gateways     = ["YUL"]
        destinations = ["CUN", "PUJ"]
        months       = ["2026-03"]
        durations    = [7]
        promo_ids    = PROMOTION_IDS
        tlog("🧪  Mode test — YUL, CUN+PUJ, mars 2026, 7 nuits")
    else:
        gateways     = GATEWAYS
        destinations = DESTINATIONS_SUN
        months       = MONTHS
        durations    = DURATIONS
        promo_ids    = PROMOTION_IDS

    combos = list(product(gateways, destinations, months, durations, promo_ids))
    total  = len(combos)
    tlog(f"📋  {total} combinaisons ({len(gateways)} gateways × "
         f"{len(destinations)} destinations × {len(months)} mois × "
         f"{len(durations)} durées × {len(promo_ids)} promotion_ids)\n")

    inserted      = 0
    errors        = 0
    active_promos: set[str] = set()

    progress = tqdm(
        combos,
        total=total,
        desc="🌴 Fetching ACV",
        unit="req",
        colour="yellow",
        dynamic_ncols=True,
        bar_format="{l_bar}{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}, {rate_fmt}]  {postfix}",
    )

    for gateway, dest, month, duration, promo_id in progress:
        progress.set_postfix_str(
            f"{gateway}→{dest}  {month}  {duration}j  promo={promo_id}  ✅{inserted}  ❌{errors}"
        )

        params = {
            "year_month":   month,
            "gateway":      gateway,
            "destination":  dest,
            "duration":     duration,       # entier, comme dans l'UI ACV
            "lang":         "fr",
            "promotion_id": promo_id,
            "productType":  "package",
        }

        data, headers = fetch_api(params, headers, on_token_expired)
        if data is not None:
            deals = parse_response(data, gateway, dest, month, duration, promo_id)
            if deals:
                for deal in deals:
                    upsert_deal(conn, deal)
                conn.commit()
                inserted += len(deals)
                active_promos.add(promo_id)
                if test_mode:
                    tlog(f"  ✅  {len(deals)} deal(s) — {gateway}→{dest} {month} {duration}j [{promo_id}]")
        else:
            errors += 1

        time.sleep(random.uniform(0.6, REQUEST_DELAY + 0.4))

    progress.close()
    conn.close()

    tlog(f"\n🏁  Terminé — {inserted} deals upsertés, {errors} erreurs.")
    if active_promos:
        tlog(f"✅  Promotion IDs actifs : {', '.join(sorted(active_promos))}")
    else:
        tlog("⚠️  Aucun promotion_id n'a retourné de données.")
        tlog("    Mettez à jour PROMOTION_IDS ou lancez avec --sniff pour découvrir")
        tlog("    le promotion_id exact depuis le trafic réseau du site ACV.")

# ── Entrée ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Worker ACV forfaits soleil")
    parser.add_argument("--sniff", action="store_true",
                        help="Intercepte les requêtes API depuis le site ACV")
    parser.add_argument("--test",  action="store_true",
                        help="Run rapide : YUL→CUN/PUJ, mars 2026, 7 nuits")
    args = parser.parse_args()

    if args.sniff:
        sniff_api_calls()
    elif args.test:
        run(test_mode=True)
    else:
        run()