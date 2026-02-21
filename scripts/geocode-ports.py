"""
geocode_ports.py — Géocodage automatique de tous les ports via Nominatim (OSM)
À lancer UNE SEULE FOIS depuis le dossier scripts/

Usage : python3 geocode_ports.py
Output : ports_coords.json (à placer dans src/data/)
"""

import json
import time
import requests
from pathlib import Path

# ─────────────────────────────────────────────────────────────────────────────
#  TOUS LES PORTS (copié depuis ports.js)
# ─────────────────────────────────────────────────────────────────────────────
PORTS = {
    # USA Est + Golfe
    "NPT": "Newport, Rhode Island, USA",
    "MIA": "Miami, Florida, USA",
    "FLL": "Fort Lauderdale, Florida, USA",
    "TPA": "Tampa, Florida, USA",
    "MCO": "Port Canaveral, Florida, USA",
    "JAX": "Jacksonville, Florida, USA",
    "EYW": "Key West, Florida, USA",
    "CHS": "Charleston, South Carolina, USA",
    "ORF": "Norfolk, Virginia, USA",
    "BWI": "Baltimore, Maryland, USA",
    "EWR": "Cape Liberty, Bayonne, New Jersey, USA",
    "NYC": "New York City, New York, USA",
    "BOS": "Boston, Massachusetts, USA",
    "PHL": "Philadelphia, Pennsylvania, USA",
    "MSY": "New Orleans, Louisiana, USA",
    "GLS": "Galveston, Texas, USA",
    "BHB": "Bar Harbor, Maine, USA",
    "SAV": "Savannah, Georgia, USA",
    "PWM": "Portland, Maine, USA",
    "PBI": "West Palm Beach, Florida, USA",
    # USA Ouest
    "SAN": "San Diego, California, USA",
    "LAX": "Los Angeles, California, USA",
    "SFO": "San Francisco, California, USA",
    "SEA": "Seattle, Washington, USA",
    "LGB": "Long Beach, California, USA",
    # Canada
    "YQB": "Quebec City, Quebec, Canada",
    "YBG": "Saguenay, Quebec, Canada",
    "CYUL": "Montreal, Quebec, Canada",
    "YHZ": "Halifax, Nova Scotia, Canada",
    "YQY": "Sydney, Nova Scotia, Canada",
    "YVR": "Vancouver, British Columbia, Canada",
    "YYJ": "Victoria, British Columbia, Canada",
    "YPR": "Prince Rupert, British Columbia, Canada",
    "YYG": "Charlottetown, Prince Edward Island, Canada",
    "TAD": "Tadoussac, Quebec, Canada",
    # Alaska
    "JNU": "Juneau, Alaska, USA",
    "KTN": "Ketchikan, Alaska, USA",
    "SIT": "Sitka, Alaska, USA",
    "SKA": "Skagway, Alaska, USA",
    "ANC": "Seward, Alaska, USA",
    "HNS": "Haines, Alaska, USA",
    "WRG": "Wrangell, Alaska, USA",
    "HNH": "Hoonah, Alaska, USA",
    # Mexique
    "CZM": "Cozumel, Mexico",
    "PVR": "Puerto Vallarta, Mexico",
    "MZT": "Mazatlan, Mexico",
    "SJD": "Cabo San Lucas, Mexico",
    "MAH": "Mahahual, Mexico",
    "PDC": "Playa del Carmen, Mexico",
    # Caraïbes
    "SJU": "San Juan, Puerto Rico",
    "STT": "Charlotte Amalie, Saint Thomas, US Virgin Islands",
    "SXM": "Philipsburg, Sint Maarten",
    "ANU": "Saint John's, Antigua",
    "SLU": "Castries, Saint Lucia",
    "BGI": "Bridgetown, Barbados",
    "GND": "Saint George's, Grenada",
    "AUA": "Oranjestad, Aruba",
    "CUR": "Willemstad, Curacao",
    "FDF": "Fort-de-France, Martinique",
    "PTP": "Pointe-a-Pitre, Guadeloupe",
    "GCM": "George Town, Grand Cayman",
    "NAS": "Nassau, Bahamas",
    "FPO": "Freeport, Bahamas",
    "GDT": "Cockburn Town, Grand Turk",
    "MBJ": "Montego Bay, Jamaica",
    "BDA": "Hamilton, Bermuda",
    "HAV": "Havana, Cuba",
    # Amérique Centrale
    "BZE": "Belize City, Belize",
    "LIO": "Limon, Costa Rica",
    "PCH": "Puntarenas, Costa Rica",
    "ROA": "Roatan, Honduras",
    "RTB": "Coxen Hole, Roatan, Honduras",
    # Amérique du Sud
    "CTG": "Cartagena, Colombia",
    "EZE": "Buenos Aires, Argentina",
    "MVD": "Montevideo, Uruguay",
    "GIG": "Rio de Janeiro, Brazil",
    "SSZ": "Santos, Brazil",
    "USH": "Ushuaia, Argentina",
    "PUQ": "Punta Arenas, Chile",
    "VAP": "Valparaiso, Chile",
    "LIM": "Callao, Lima, Peru",
    # Europe Nord
    "LEH": "Le Havre, France",
    "LHR": "Southampton, England, UK",
    "RTM": "Rotterdam, Netherlands",
    "AMS": "Amsterdam, Netherlands",
    "ZEE": "Zeebrugge, Belgium",
    "DUB": "Dublin, Ireland",
    "HAM": "Hamburg, Germany",
    "CPH": "Copenhagen, Denmark",
    "STO": "Stockholm, Sweden",
    "HEL": "Helsinki, Finland",
    "TLL": "Tallinn, Estonia",
    "RIX": "Riga, Latvia",
    # Europe Atlantique
    "CDZ": "Cadiz, Spain",
    "LIS": "Lisbon, Portugal",
    "OPO": "Porto, Portugal",
    "FNC": "Funchal, Madeira, Portugal",
    "LPA": "Las Palmas, Gran Canaria, Spain",
    "TFS": "Santa Cruz de Tenerife, Spain",
    # Europe Med
    "BCN": "Barcelona, Spain",
    "VLC": "Valencia, Spain",
    "PMI": "Palma de Mallorca, Spain",
    "MRS": "Marseille, France",
    "NCE": "Nice, France",
    "GEN": "Genoa, Italy",  # GOA est le code IATA de Goa India
    "FCO": "Civitavecchia, Rome, Italy",
    "NAP": "Naples, Italy",
    "LIV": "Livorno, Italy",
    "PMO": "Palermo, Sicily, Italy",
    "VCE": "Venice, Italy",
    "ATH": "Piraeus, Athens, Greece",
    "JMK": "Mykonos, Greece",
    "JTR": "Santorini, Greece",
    "HER": "Heraklion, Crete, Greece",
    "RHO": "Rhodes, Greece",
    "CFU": "Corfu, Greece",
    "DBV": "Dubrovnik, Croatia",
    "SPU": "Split, Croatia",
    "IST": "Istanbul, Turkey",
    "KUS": "Kusadasi, Turkey",
    "MLA": "Valletta, Malta",
    "ALY": "Alexandria, Egypt",
    # Scandinavie
    "OSL": "Oslo, Norway",
    "BGO": "Bergen, Norway",
    "TOS": "Tromso, Norway",
    "HVG": "Honningsvag, Norway",
    "REY": "Reykjavik, Iceland",
    "LYR": "Longyearbyen, Svalbard, Norway",
    "GOH": "Nuuk, Greenland",
    # Hawaii
    "HNL": "Honolulu, Hawaii, USA",
    "OGG": "Kahului, Maui, Hawaii, USA",
    "KOA": "Kailua-Kona, Hawaii, USA",
    "LIH": "Lihue, Kauai, Hawaii, USA",
    "ITO": "Hilo, Hawaii, USA",
    # Pacifique Sud
    "PPT": "Papeete, Tahiti, French Polynesia",
    "BOB": "Bora Bora, French Polynesia",
    "MOZ": "Moorea, French Polynesia",
    "NOU": "Noumea, New Caledonia",
    "APW": "Apia, Samoa",
    # Australie / NZ
    "SYD": "Sydney, Australia",
    "MEL": "Melbourne, Australia",
    "BNE": "Brisbane, Australia",
    "AKL": "Auckland, New Zealand",
    "WLG": "Wellington, New Zealand",
    # Océan Indien
    "DXB": "Dubai, UAE",
    "AUH": "Abu Dhabi, UAE",
    "MCT": "Muscat, Oman",
    "BOM": "Mumbai, India",
    "COK": "Kochi, India",
    "CMB": "Colombo, Sri Lanka",
    "MLE": "Male, Maldives",
    "SEZ": "Mahe, Seychelles",
    "MRU": "Port Louis, Mauritius",
    "RUN": "La Reunion, France",
    # Afrique
    "CPT": "Cape Town, South Africa",
    "DUR": "Durban, South Africa",
    "DSS": "Dakar, Senegal",
    # Asie Sud-Est
    "SIN": "Singapore",
    "BKK": "Laem Chabang, Bangkok, Thailand",
    "HKT": "Phuket, Thailand",
    "DAD": "Da Nang, Vietnam",
    "SGN": "Ho Chi Minh City, Vietnam",
    "PEN": "Penang, Malaysia",
    "KUL": "Port Klang, Kuala Lumpur, Malaysia",
    "DPS": "Benoa, Bali, Indonesia",
    "MNL": "Manila, Philippines",
    # Asie Est
    "TYO": "Yokohama, Japan",
    "OSA": "Kobe, Japan",
    "FUK": "Fukuoka, Japan",
    "NGS": "Nagasaki, Japan",
    "KAG": "Kagoshima, Japan",
    "OKA": "Naha, Okinawa, Japan",
    "CTS": "Otaru, Hokkaido, Japan",
    "HIJ": "Hiroshima, Japan",
    "HKG": "Hong Kong",
    "SHA": "Shanghai, China",
    "PUS": "Busan, South Korea",
    "ICN": "Incheon, South Korea",
    "CJU": "Jeju, South Korea",
    "TPE": "Keelung, Taiwan",
}

# ─────────────────────────────────────────────────────────────────────────────
#  GÉOCODAGE
# ─────────────────────────────────────────────────────────────────────────────
OUTPUT_FILE = Path(__file__).parent / "ports_coords.json"
EXISTING = {}

# Charger les résultats existants pour reprendre en cas d'interruption
if OUTPUT_FILE.exists():
    with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
        EXISTING = json.load(f)
    print(f"📂 {len(EXISTING)} ports déjà géocodés — reprise...")

results = dict(EXISTING)
ok, skip, fail = 0, 0, 0

for code, nom in PORTS.items():
    if code in results:
        skip += 1
        continue

    try:
        r = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": nom, "format": "json", "limit": 1},
            headers={"User-Agent": "aeria-voyages-geocoder/1.0"},
            timeout=10,
        )
        data = r.json()
        if data:
            results[code] = {
                "lat": round(float(data[0]["lat"]), 5),
                "lng": round(float(data[0]["lon"]), 5),
                "nom": nom,
            }
            print(f"  ✅ {code:8s} → {results[code]['lat']:10.5f}, {results[code]['lng']:10.5f}  ({nom})")
            ok += 1
        else:
            results[code] = {"lat": None, "lng": None, "nom": nom}
            print(f"  ⚠️  {code:8s} → introuvable  ({nom})")
            fail += 1

    except Exception as e:
        print(f"  ❌ {code:8s} → erreur: {e}")
        fail += 1

    # Sauvegarde progressive
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    time.sleep(1.1)  # Nominatim : max 1 req/s

print(f"\n🏁 Terminé — ✅ {ok} géocodés, ⏭️  {skip} déjà faits, ⚠️  {fail} introuvables")
print(f"📄 Résultats sauvegardés dans : {OUTPUT_FILE}")