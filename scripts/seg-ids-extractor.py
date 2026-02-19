import json
import time
import os
import sqlite3
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

# ─────────────────────────────────────────
#  CONFIGURATION DES CHEMINS
# ─────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, "..", "db", "croisieres.db")

URL_CIBLE     = "https://www.shoreexcursionsgroup.com"
SEG_AFFILIATE = "&source=portal&id=1771540&data=yvanblanchette@aeriavoyages.com"

# ─────────────────────────────────────────
#  SAUVEGARDE SQLITE
# ─────────────────────────────────────────
def mettre_a_jour_mapping_db(data):
    """Insère les IDs de Shore Excursions dans SQLite"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        count = 0
        for ship_name, details in data['ships'].items():
            cursor.execute('''
                INSERT OR REPLACE INTO seg_mapping
                (ship_name, ship_id, line_id, line_name, itineraries_json)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                ship_name,
                details['shipId'],
                details['lineId'],
                details['lineName'],
                json.dumps(details['itineraries'])
            ))
            count += 1

        conn.commit()
        conn.close()
        print(f"✅ Succès : {count} navires mappés dans la base de données.")

    except Exception as e:
        print(f"❌ Erreur lors de la mise à jour SQL : {e}")

# ─────────────────────────────────────────
#  EXTRACTION
# ─────────────────────────────────────────
def extraire_seg():
    print("🌐 Connexion à Shore Excursions Group pour mise à jour du mapping...")

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
        time.sleep(7)  # Plus de temps pour charger les grosses variables JS

        js_script = """
        var shipsData = JSON.parse(ships);
        var itinData = JSON.parse(shipItin);
        var lines_map = {};
        var ships_map = {};

        // 1. Récupérer les noms des compagnies dans le menu Select
        var lineSelect = document.querySelector('select[name="line"]');
        if(lineSelect){
            Array.from(lineSelect.options).forEach(opt => {
                if(opt.value) lines_map[opt.value] = opt.text;
            });
        }

        // 2. Structurer les données des navires
        for (var lineId in shipsData) {
            for (var shipIdWithUnderscore in shipsData[lineId]) {
                var cleanShipId = shipIdWithUnderscore.replace('_', '');
                var shipName = shipsData[lineId][shipIdWithUnderscore];

                ships_map[shipName] = {
                    "shipId": cleanShipId,
                    "lineId": lineId,
                    "lineName": lines_map[lineId] || "Inconnu",
                    "itineraries": {}
                };

                if (itinData[cleanShipId]) {
                    for (var key in itinData[cleanShipId]) {
                        var parts = key.split('-');
                        if (parts.length >= 4) {
                            var date = parts[0] + '-' + parts[1] + '-' + parts[2];
                            var nights = parts[3];
                            ships_map[shipName]["itineraries"][date] = nights;
                        }
                    }
                }
            }
        }
        return { "ships": ships_map };
        """

        data = driver.execute_script(js_script)

        if data and data['ships']:
            print(f"🚢 {len(data['ships'])} navires trouvés.")
            mettre_a_jour_mapping_db(data)
        else:
            print("⚠️ Aucune donnée extraite. Vérifiez si le site a changé de structure.")

    finally:
        driver.quit()

if __name__ == "__main__":
    extraire_seg()