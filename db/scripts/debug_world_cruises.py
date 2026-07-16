#!/usr/bin/env python3
"""
Debug - teste la connexion à CruiseSpecialists
"""

import sys
print("Python:", sys.version)
print()

# Test imports
try:
    import requests
    print("✅ requests OK")
except ImportError:
    print("❌ requests manquant -> pip install requests")
    sys.exit(1)

try:
    from bs4 import BeautifulSoup
    print("✅ beautifulsoup4 OK")
except ImportError:
    print("❌ beautifulsoup4 manquant -> pip install beautifulsoup4")
    sys.exit(1)

print()

# Test connexion
url = "https://www.cruisespecialists.com/2027-World-Cruises.aspx"
print(f"🌍 Test connexion vers: {url}")
print()

headers = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
}

try:
    resp = requests.get(url, headers=headers, timeout=15)
    print(f"✅ Status HTTP: {resp.status_code}")
    print(f"   Content-Type: {resp.headers.get('Content-Type', 'N/A')}")
    print(f"   Taille réponse: {len(resp.text):,} caractères")
    print()

    # Vérifie le contenu
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(resp.text, "html.parser")

    h1 = soup.find("h1")
    print(f"   H1 trouvé: {h1.get_text().strip() if h1 else 'AUCUN'}")

    boxes = soup.find_all("div", class_="div_square_offer_box_tall")
    print(f"   Offer boxes trouvées: {len(boxes)}")

    if len(boxes) == 0:
        print()
        print("⚠️  Aucune croisière trouvée. Contenu de la page (500 premiers chars):")
        print(resp.text[:500])

except requests.exceptions.SSLError as e:
    print(f"❌ Erreur SSL: {e}")
    print()
    print("💡 Solution: essaie avec verify=False")
    print("   resp = requests.get(url, headers=headers, verify=False, timeout=15)")

except requests.exceptions.ProxyError as e:
    print(f"❌ Erreur Proxy: {e}")
    print()
    print("💡 Ton réseau utilise un proxy. Essaie:")
    print("   resp = requests.get(url, headers=headers, proxies={'http': None, 'https': None}, timeout=15)")

except requests.exceptions.ConnectionError as e:
    print(f"❌ Erreur de connexion: {e}")

except requests.exceptions.Timeout:
    print("❌ Timeout - le serveur ne répond pas")

except Exception as e:
    print(f"❌ Erreur inattendue: {type(e).__name__}: {e}")