const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, "..", "db", "croisieres.db");

app.use(cors());
app.use(express.json());

// ── Connexion DB ──────────────────────────────────────────────────────────────
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

// ── Utilitaires ───────────────────────────────────────────────────────────────
function parseJSON(val) {
    try { return JSON.parse(val); } catch { return val; }
}

// ─────────────────────────────────────────────────────────────────────────────
//  CROISIÈRES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/croisieres
// Query params: section, croisieriste, mois, annee, duree_min, duree_max, tri
app.get("/api/croisieres", (req, res) => {
    try {
        const { section, croisieriste, mois, annee, duree_min, duree_max, tri } = req.query;

        let query = "SELECT * FROM mes_croisieres WHERE 1=1";
        const params = [];

        if (section) {
            query += " AND section = ?";
            params.push(section);
        }
        if (croisieriste) {
            const liste = croisieriste.split(",");
            query += ` AND croisieriste IN (${liste.map(() => "?").join(",")})`;
            params.push(...liste);
        }
        if (mois) {
            query += " AND CAST(strftime('%m', date_depart) AS INTEGER) = ?";
            params.push(parseInt(mois));
        }
        if (annee) {
            query += " AND strftime('%Y', date_depart) = ?";
            params.push(annee);
        }
        if (duree_min) {
            query += " AND nuits >= ?";
            params.push(parseInt(duree_min));
        }
        if (duree_max) {
            query += " AND nuits <= ?";
            params.push(parseInt(duree_max));
        }

        // Tri
        const tris = {
            "date-asc":   "date_depart ASC",
            "date-desc":  "date_depart DESC",
            "prix-asc":   "MIN(COALESCE(NULLIF(prix_int,0), NULLIF(prix_ext,0), prix_balcon)) ASC",
            "prix-desc":  "MIN(COALESCE(NULLIF(prix_int,0), NULLIF(prix_ext,0), prix_balcon)) DESC",
            "duree-asc":  "nuits ASC",
            "duree-desc": "nuits DESC",
        };
        query += ` ORDER BY ${tris[tri] || "date_depart ASC"}`;

        const rows = db.prepare(query).all(...params);

        // Reformater pour React (clés françaises + ports en tableau)
        const result = rows.map(r => ({
            ...r,
            "Croisiériste":     r.croisieriste,
            "Navire":           r.navire,
            "Date Départ":      r.date_depart,
            "Date Retour":      r.date_retour,
            "Nuits":            r.nuits,
            "Itinéraire":       r.itineraire,
            "Port Départ":      r.port_depart,
            "Ports":            r.ports ? r.ports.split(",").filter(Boolean) : [],
            "Prix Int.":        r.prix_int,
            "Prix Ext.":        r.prix_ext,
            "Prix Balcon":      r.prix_balcon,
            "Prix Vol MTL Int.":    r.prix_vol_int,
            "Prix Vol MTL Ext.":    r.prix_vol_ext,
            "Prix Vol MTL Balcon":  r.prix_vol_balcon,
            "Boissons":         r.boissons,
            "Pourboires":       r.pourboires,
            "WiFi":             r.wifi,
            "Image Itinéraire": r.image_itin,
            "Image Navire":     r.image_navire,
            "Lien":             r.lien_constellation,
            "Lien Excursions":  r.lien_excursions,
            "_dest": r.section === "sud" ? "caraibes" : r.section,
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/croisieres/meta — options pour les filtres
app.get("/api/croisieres/meta", (req, res) => {
    try {
        const compagnies = db.prepare(
            "SELECT DISTINCT croisieriste FROM mes_croisieres ORDER BY croisieriste"
        ).all().map(r => r.croisieriste);

        const mois = db.prepare(
            "SELECT DISTINCT CAST(strftime('%m', date_depart) AS INTEGER) as mois FROM mes_croisieres ORDER BY mois"
        ).all().map(r => r.mois);

        const annees = db.prepare(
            "SELECT DISTINCT strftime('%Y', date_depart) as annee FROM mes_croisieres ORDER BY annee"
        ).all().map(r => r.annee);

        const sections = db.prepare(
            "SELECT DISTINCT section FROM mes_croisieres"
        ).all().map(r => r.section);

        res.json({ compagnies, mois, annees, sections });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
//  CIRCUITS EXOTICCA
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/circuits/exoticca
app.get("/api/circuits/exoticca", (req, res) => {
    try {
        const { region } = req.query;
        let query = "SELECT * FROM circuits_exoticca";
        const params = [];

        if (region) {
            query += " WHERE region = ?";
            params.push(region);
        }
        query += " ORDER BY prix_promo ASC";

        const rows = db.prepare(query).all(...params);
        const result = rows.map(r => ({
            ...r,
            isFlashSale: Boolean(r.is_flash_sale),
            isNew: Boolean(r.is_new),
            prixPromo: r.prix_promo,
            prixRegulier: r.prix_regulier,
            rabais: r.rabais_pourcentage,
            lienAgent: r.lien_agent,
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
//  CIRCUITS TRIPOPPO
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/circuits/tripoppo
app.get("/api/circuits/tripoppo", (req, res) => {
    try {
        const { region } = req.query;
        let query = "SELECT * FROM circuits_tripoppo";
        const params = [];

        if (region) {
            query += " WHERE region = ?";
            params.push(region);
        }
        query += " ORDER BY region, titre";

        const rows = db.prepare(query).all(...params);
        const result = rows.map(r => ({
            ...r,
            infos_rapides: parseJSON(r.infos_rapides),
            images_carousel: parseJSON(r.images_carousel),
            inclus: parseJSON(r.inclus),
            non_inclus: parseJSON(r.non_inclus),
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/circuits/tripoppo/:id — détail complet avec itinéraire, hôtels, dates
app.get("/api/circuits/tripoppo/:id", (req, res) => {
    try {
        const circuit = db.prepare(
            "SELECT * FROM circuits_tripoppo WHERE id = ?"
        ).get(req.params.id);

        if (!circuit) return res.status(404).json({ error: "Circuit introuvable" });

        const itineraire = db.prepare(
            "SELECT * FROM tripoppo_itineraire WHERE circuit_url = ? ORDER BY id"
        ).all(circuit.circuit_url).map(j => ({
            ...j,
            images: parseJSON(j.images),
        }));

        const dates_prix = db.prepare(
            "SELECT * FROM tripoppo_dates_prix WHERE circuit_url = ? ORDER BY depart"
        ).all(circuit.circuit_url).map(d => ({
            ...d,
            liens_resa: parseJSON(d.liens_resa),
        }));

        const hotels = db.prepare(
            "SELECT * FROM tripoppo_hotels WHERE circuit_url = ?"
        ).all(circuit.circuit_url);

        res.json({
            ...circuit,
            infos_rapides: parseJSON(circuit.infos_rapides),
            images_carousel: parseJSON(circuit.images_carousel),
            inclus: parseJSON(circuit.inclus),
            non_inclus: parseJSON(circuit.non_inclus),
            itineraire,
            dates_prix,
            hotels,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
//  HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", db: DB_PATH });
});

// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 API Aeria Voyages démarrée sur le port ${PORT}`);
    console.log(`📦 DB : ${DB_PATH}`);
});
