#!/bin/bash
cd /var/www/aeria-voyages/scripts
python3 cruises-extractor.py
python3 exoticca-extractor.py
python3 tripoppo-extractor.py

# Nettoyage post-scrape
echo "Nettoyage de la base de données..."
sqlite3 /var/www/aeria-voyages/db/aeria.db "
DELETE FROM mes_croisieres WHERE croisieriste = 'Carnival Cruise Line';
DELETE FROM mes_croisieres WHERE id NOT IN (
    SELECT MIN(id) FROM mes_croisieres
    GROUP BY croisieriste, navire, date_depart, date_retour, prix_int, prix_ext, prix_balcon
);
"
echo "Nettoyage terminé."