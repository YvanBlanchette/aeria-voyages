"""
worker_acv.py — Worker quotidien pour fetcher les circuits d'Air Canada Vacations
et les insérer dans la table `circuits_acv` de la base SQLite.

Usage : python worker_acv.py
"""

import sqlite3
import time
import json
import logging
import random
from itertools import product
from datetime import datetime, timezone
from pathlib import Path

import requests
from playwright.sync_api import sync_playwright
from tqdm import tqdm

# ── Configuration ──────────────────────────────────────────────────────────────

DB_PATH = Path(__file__).parent / "../db/croisieres.db"

GATEWAYS     = ["YUL", "YQB", "YOW"]
DESTINATIONS = ["LIS", "BCN", "FCO", "CDG", "MXP", "MAD", "TLS",
                "AMS", "DUB", "LHR", "LYS", "VIE", "BRU", "MUC",
                "FRA", "GVA", "ZRH"]
MONTHS       = ["2026-03", "2026-04", "2026-05", "2026-06"]
DURATIONS    = ["0-9", "10-99"]

REQUEST_DELAY = 1.2   # secondes entre chaque requête
API_URL       = "https://vacations-api.aircanada.com/promotion/tours"

# ── Logging ────────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
    handlers=[
        # Pas de StreamHandler ici — tqdm gère la console
        logging.FileHandler("worker_acv.log", encoding="utf-8"),
    ],
)
log = logging.getLogger(__name__)

def tlog(msg: str):
    """Affiche un message compatible avec tqdm (pas de chevauchement de barre)."""
    tqdm.write(msg)
    log.info(msg)

# ── Token ──────────────────────────────────────────────────────────────────────

def get_token() -> str | None:
    """Lance un navigateur headless pour récupérer le Bearer Token d'ACV."""
    tlog("🤖  Récupération du token via Playwright...")
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto("https://vacations.aircanada.com/fr", wait_until="networkidle", timeout=60_000)
            token = page.evaluate("() => window.sso.getUserToken()")
            browser.close()
            if token:
                tlog("✅  Token obtenu avec succès.")
                return token
            else:
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
        CREATE TABLE IF NOT EXISTS circuits_acv (
            id                TEXT PRIMARY KEY,
            name              TEXT,
            departure_city    TEXT,
            destination       TEXT,
            month             TEXT,
            duration_category TEXT,
            price             REAL,
            days              INTEGER,
            nights            INTEGER,
            image_url         TEXT,
            tour_url          TEXT,
            visited_locations TEXT,
            last_updated      TEXT
        )
    """)
    conn.commit()
    return conn

def upsert_tour(conn: sqlite3.Connection, row: dict) -> None:
    """INSERT OR REPLACE d'un circuit dans la table circuits_acv."""
    conn.execute("""
        INSERT OR REPLACE INTO circuits_acv
            (id, name, departure_city, destination, month,
             duration_category, price, days, nights,
             image_url, tour_url, visited_locations, last_updated)
        VALUES
            (:id, :name, :departure_city, :destination, :month,
             :duration_category, :price, :days, :nights,
             :image_url, :tour_url, :visited_locations, :last_updated)
    """, row)

# ── Parsing de la réponse API ──────────────────────────────────────────────────

def parse_tours(data: dict, gateway: str, destination: str,
                month: str, duration_cat: str) -> list[dict]:
    """
    Extrait les circuits de la réponse JSON de l'API ACV.
    Structure réelle : { "products": [ { "tour_name", "acv_tour_id", ... } ] }
    """
    tours = []
    now   = datetime.now(timezone.utc).isoformat()

    items = data.get("products") or []

    for item in items:
        try:
            acv_id  = item.get("acv_tour_id") or ""
            tour_id = f"{acv_id}-{gateway}-{month}"

            name   = item.get("tour_name") or ""
            price  = float(item.get("price") or 0)
            days   = int(item.get("nb_days")   or 0)
            nights = int(item.get("nb_nights") or 0)

            images    = item.get("images") or []
            image_url = images[0].get("link_large", "") if images else ""

            tour_url = item.get("tour_static_pdp_url") or item.get("action_url") or ""

            visited_raw       = item.get("visited_locations") or []
            visited_locations = json.dumps(visited_raw, ensure_ascii=False)

            tours.append({
                "id":                tour_id,
                "name":              name,
                "departure_city":    gateway,
                "destination":       destination,
                "month":             month,
                "duration_category": duration_cat,
                "price":             price,
                "days":              days,
                "nights":            nights,
                "image_url":         image_url,
                "tour_url":          tour_url,
                "visited_locations": visited_locations,
                "last_updated":      now,
            })
        except Exception as exc:
            log.warning(f"  ⚠️  Impossible de parser un item : {exc} — {item}")

    return tours

# ── Boucle principale ──────────────────────────────────────────────────────────

def run():
    # 1. Récupération du token
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

    # 2. Connexion DB
    conn = get_db_connection()

    # 3. Toutes les combinaisons
    combos = list(product(GATEWAYS, DESTINATIONS, MONTHS, DURATIONS))
    total  = len(combos)
    tlog(f"📋  {total} combinaisons à traiter. Début du run...\n")

    inserted        = 0
    errors          = 0
    token_refreshed = False

    progress = tqdm(
        combos,
        total=total,
        desc="🌍 Fetching ACV",
        unit="req",
        colour="cyan",
        dynamic_ncols=True,
        bar_format="{l_bar}{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}, {rate_fmt}]  {postfix}",
    )

    for gateway, dest, month, duration in progress:
        progress.set_postfix_str(f"{gateway}→{dest}  {month}  [{duration}j]  ✅{inserted}  ❌{errors}")

        params = {
            "year_month":    month,
            "gateway":       gateway,
            "destination":   dest,
            "duration":      duration,
            "lang":          "en",
            "promotion_id":  "top-europe-tour-packages",
            "productType":   "tour",
        }

        try:
            resp = requests.get(API_URL, params=params, headers=headers, timeout=20)

            # Token expiré : on en récupère un nouveau (une seule tentative)
            if resp.status_code == 401 and not token_refreshed:
                tlog("\n🔄  Token expiré — récupération d'un nouveau token...")
                token = get_token()
                if not token:
                    tlog("💀  Impossible de renouveler le token. Abandon.")
                    break
                headers["Authorization"] = f"Bearer {token}"
                token_refreshed = True
                resp = requests.get(API_URL, params=params, headers=headers, timeout=20)

            if resp.status_code != 200:
                log.warning(f"HTTP {resp.status_code} — {gateway}→{dest} {month} {duration}")
                errors += 1
                time.sleep(random.uniform(0.8, 2.5))
                continue

            data  = resp.json()
            tours = parse_tours(data, gateway, dest, month, duration)

            if tours:
                for tour in tours:
                    upsert_tour(conn, tour)
                conn.commit()
                inserted += len(tours)

        except requests.exceptions.Timeout:
            log.warning(f"Timeout — {gateway}→{dest} {month} {duration}")
            errors += 1
        except Exception as exc:
            log.error(f"Erreur inattendue : {exc}")
            errors += 1

        time.sleep(random.uniform(0.8, 2.5))

    progress.close()
    conn.close()
    tlog(f"\n🏁  Terminé — {inserted} enregistrements upsertés, {errors} erreurs.")

# ── Entrée ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    run()