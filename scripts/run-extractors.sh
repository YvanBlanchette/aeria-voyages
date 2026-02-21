#!/bin/bash
cd /var/www/aeria-voyages/scripts
python3 cruises-extractor.py
python3 exoticca-extractor.py
python3 tripoppo-extractor.py