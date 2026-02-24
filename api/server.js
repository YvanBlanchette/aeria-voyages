const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");
const cheerio = require("cheerio");

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, "..", "db", "aeria.db");

app.use(cors());
app.use(express.json());

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("busy_timeout = 5000");

const US_PORTS = new Set(
	db.prepare("SELECT code FROM ports WHERE est_usa = 1").all().map((r) => r.code),
);

db.function("has_us_port", (port_depart, ports_csv) => {
	if (port_depart && US_PORTS.has(port_depart.trim())) return 1;
	if (ports_csv) {
		for (const code of ports_csv.split(",")) {
			if (US_PORTS.has(code.trim())) return 1;
		}
	}
	return 0;
});

const PORT_NOMS = db.prepare("SELECT code, nom FROM ports").all()
	.reduce((acc, r) => { acc[r.code] = r.nom; return acc; }, {});

function resoudrePort(code) {
	if (!code || code === "N/A") return code;
	const s = code.trim();
	if (s.includes(" ") || s.includes(",")) return s;
	return PORT_NOMS[s] ?? s;
}

function parseJSON(val) {
	try { return JSON.parse(val); } catch { return val; }
}

const ACV_DESTINATIONS = {
	AMS: "Amsterdam", BCN: "Barcelone", BRU: "Bruxelles",
	CDG: "Paris",     DUB: "Dublin",    FCO: "Rome",
	FRA: "Francfort", GVA: "Genève",    LHR: "Londres",
	LIS: "Lisbonne",  LYS: "Lyon",      MAD: "Madrid",
	MUC: "Munich",    MXP: "Milan",     TLS: "Toulouse",
	VIE: "Vienne",    ZRH: "Zurich",
};

const ACV_VILLES = {
	YUL: "Montréal",
	YQB: "Québec",
	YOW: "Ottawa",
};

// ─────────────────────────────────────────────────────────────────────────────
//  ROUTES — CROISIÈRES
// ─────────────────────────────────────────────────────────────────────────────

app.get("/api/ports", (req, res) => {
	try {
		const rows = db.prepare("SELECT code, nom FROM ports").all();
		const dict = {};
		for (const r of rows) dict[r.code] = r.nom;
		res.json(dict);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/croisieres", (req, res) => {
	try {
		const { section, croisieriste, navire, mois, annee, duree_min, duree_max, tri, exclude_usa } = req.query;

		let query = "SELECT * FROM mes_croisieres WHERE 1=1";
		const params = [];

		if (exclude_usa === "true") {
			query += " AND has_us_port(port_depart, ports) = 0";
		}
		if (section) {
			query += " AND section = ?";
			params.push(section);
		}
		if (req.query.destination) {
			const liste = req.query.destination.split(",");
			query += ` AND destination IN (${liste.map(() => "?").join(",")})`;
			params.push(...liste);
		}
		if (croisieriste) {
			const liste = croisieriste.split(",");
			query += ` AND croisieriste IN (${liste.map(() => "?").join(",")})`;
			params.push(...liste);
		}
		if (navire) {
			const liste = navire.split(",");
			query += ` AND navire IN (${liste.map(() => "?").join(",")})`;
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

		const tris = {
				"date-asc":   "date_depart ASC",
				"date-desc":  "date_depart DESC",
				"prix-asc":   "COALESCE(NULLIF(prix_int,0), NULLIF(prix_ext,0), NULLIF(prix_balcon,0)) ASC",
				"prix-desc":  "COALESCE(NULLIF(prix_int,0), NULLIF(prix_ext,0), NULLIF(prix_balcon,0)) DESC",
				"duree-asc":  "nuits ASC",
				"duree-desc": "nuits DESC",
		};

		if (tri && tri.startsWith("prix")) {
    	query += " AND (prix_int > 0 OR prix_ext > 0 OR prix_balcon > 0)";
		}

		query += ` ORDER BY ${tris[tri] || "date_depart ASC"}`;

		const countQuery = query.replace(/^SELECT \*/, "SELECT COUNT(*) as total");
		const { total } = db.prepare(countQuery).get(...params);

		const limit  = Math.min(parseInt(req.query.limit) || 24, 100);
		const offset = parseInt(req.query.offset) || 0;
		query += ` LIMIT ? OFFSET ?`;
		params.push(limit, offset);

		const rows = db.prepare(query).all(...params);

		const mapper = (r) => ({
			LienSEG:               r.lien_seg,
			...r,
			Croisiériste:          r.croisieriste,
			Navire:                r.navire,
			"Date Départ":         r.date_depart,
			"Date Retour":         r.date_retour,
			Nuits:                 r.nuits,
			Itinéraire:            r.itineraire,
			"Port Départ":         resoudrePort(r.port_depart),
			Ports:                 r.ports ? r.ports.split(",").filter(Boolean).map(resoudrePort) : [],
			"Prix Int.":           r.prix_int,
			"Prix Ext.":           r.prix_ext,
			"Prix Balcon":         r.prix_balcon,
			"Prix Vol MTL Int.":   r.prix_vol_int,
			"Prix Vol MTL Ext.":   r.prix_vol_ext,
			"Prix Vol MTL Balcon": r.prix_vol_balcon,
			Boissons:              r.boissons,
			Pourboires:            r.pourboires,
			WiFi:                  r.wifi,
			"Image Itinéraire":    r.image_itineraire,
			"Image Navire":        r.image_navire,
			Lien:                  r.lien_constellation,
			destination:           r.destination,
		});

		res.json({ total, limit, offset, data: rows.map(mapper) });

	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/croisieres/meta", (req, res) => {
	try {
		res.json({
			compagnies: db.prepare("SELECT DISTINCT croisieriste FROM mes_croisieres ORDER BY croisieriste").all().map((r) => r.croisieriste),
			mois:       db.prepare("SELECT DISTINCT CAST(strftime('%m', date_depart) AS INTEGER) as mois FROM mes_croisieres ORDER BY mois").all().map((r) => r.mois),
			annees:     db.prepare("SELECT DISTINCT strftime('%Y', date_depart) as annee FROM mes_croisieres ORDER BY annee").all().map((r) => r.annee),
			sections:   db.prepare("SELECT DISTINCT section FROM mes_croisieres").all().map((r) => r.section),
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/croisieres/navires", (req, res) => {
	try {
		const { croisieriste } = req.query;
		let query = "SELECT DISTINCT navire FROM mes_croisieres WHERE navire IS NOT NULL";
		const params = [];

		if (croisieriste) {
			const liste = croisieriste.split(",");
			query += ` AND croisieriste IN (${liste.map(() => "?").join(",")})`;
			params.push(...liste);
		}

		query += " ORDER BY navire ASC";
		res.json(db.prepare(query).all(...params).map((r) => r.navire));
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ─────────────────────────────────────────────────────────────────────────────
//  ROUTES — CIRCUITS EXOTICCA
// ─────────────────────────────────────────────────────────────────────────────

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

		res.json(db.prepare(query).all(...params).map((r) => ({
			...r,
			source:       "exoticca",
			prixPromo:    r.prix_promo,
			prixRegulier: r.prix_regulier,
			rabais:       r.rabais_pct,
			lienAgent:    r.lien_agent,
			image:        r.image_url,
			destination:  r.destination,
			jours:        r.jours,
		})));
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ─────────────────────────────────────────────────────────────────────────────
//  ROUTES — CIRCUITS VACANCES AIR CANADA (ACV)
// ─────────────────────────────────────────────────────────────────────────────

app.get("/api/circuits/acv", (req, res) => {
	try {
		const { destination, ville_depart, mois, duree } = req.query;
		let query = "SELECT * FROM circuits_acv WHERE 1=1";
		const params = [];

		if (destination)  { query += " AND destination = ?";     params.push(destination); }
		if (ville_depart) { query += " AND ville_depart = ?";    params.push(ville_depart); }
		if (mois)         { query += " AND mois = ?";            params.push(mois); }
		if (duree)        { query += " AND categorie_duree = ?"; params.push(duree); }
		query += " ORDER BY prix ASC";

		res.json(db.prepare(query).all(...params).map((r) => ({
			...r,
			source:          "acv",
			titre:           r.nom,
			prixPromo:       r.prix,
			prixRegulier:    null,
			rabais:          null,
			lienAgent:       r.url_circuit?.replace("/en/", "/fr/").replace("distribution=yes&distribution=yes", "distribution=yes"),
			image:           r.image_url,
			jours:           r.jours ?? r.days,
			destinationCode: r.destination,
			destinationNom:  ACV_DESTINATIONS[r.destination] ?? r.destination,
			destination:     `${ACV_DESTINATIONS[r.destination] ?? r.destination} (${r.destination})`,
			villeDepart:     ACV_VILLES[r.ville_depart] ?? r.departure_city,
			villedepartCode: r.ville_depart,
			lieux:           parseJSON(r.lieux_visites),
			region:          "europe",
		})));
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/circuits/acv/meta", (req, res) => {
	try {
		res.json({
			destinations: db.prepare("SELECT DISTINCT destination FROM circuits_acv ORDER BY destination").all().map((r) => ({
				code:  r.destination,
				nom:   ACV_DESTINATIONS[r.destination] ?? r.destination,
				label: `${ACV_DESTINATIONS[r.destination] ?? r.destination} (${r.destination})`,
			})),
			villes: db.prepare("SELECT DISTINCT departure_city FROM circuits_acv ORDER BY date_departure_city").all().map((r) => ({
				code: r.departure_city,
				nom:  ACV_VILLES[r.ville_depart] ?? r.departure_city,
			})),
			mois:   db.prepare("SELECT DISTINCT month FROM circuits_acv ORDER BY month").all().map((r) => r.month),
			durees: db.prepare("SELECT DISTINCT duration_category FROM circuits_acv ORDER BY duration_category").all().map((r) => r.duration_category),
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ─────────────────────────────────────────────────────────────────────────────
//  ROUTES — CIRCUITS TRIPOPPO
// ─────────────────────────────────────────────────────────────────────────────

app.get("/api/circuits/tripoppo", (req, res) => {
	try {
		const { region } = req.query;
		let query = "SELECT * FROM circuits_tripoppo";
		const params = [];

		if (region) { query += " WHERE region = ?"; params.push(region); }
		query += " ORDER BY region, titre";

		res.json(db.prepare(query).all(...params).map((r) => ({
			...r,
			source:          "tripoppo",
			prixPromo:       parseFloat(r.prix_promo) || 0,
			prixRegulier:    parseFloat(r.prix_regulier) || null,
			lienAgent:       r.lien_agent ?? r.url_circuit,
			image:           r.image_url,
			infos_rapides:   parseJSON(r.infos_rapides),
			images_carousel: parseJSON(r.images_carousel),
			inclus:          parseJSON(r.inclus),
			non_inclus:      parseJSON(r.non_inclus),
		})));
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/circuits/tripoppo/:id", (req, res) => {
	try {
		const circuit = db.prepare("SELECT * FROM circuits_tripoppo WHERE id = ?").get(req.params.id);
		if (!circuit) return res.status(404).json({ error: "Circuit introuvable" });

		const itineraire = db.prepare("SELECT * FROM tripoppo_itineraire WHERE url_circuit = ? ORDER BY id").all(circuit.url_circuit)
			.map((j) => ({ ...j, images: parseJSON(j.images) }));

		const dates_prix = db.prepare("SELECT * FROM tripoppo_dates_prix WHERE url_circuit = ? ORDER BY date_depart").all(circuit.url_circuit)
			.map((d) => ({ ...d, liens_resa: parseJSON(d.liens_resa) }));

		const hotels = db.prepare("SELECT * FROM tripoppo_hotels WHERE url_circuit = ?").all(circuit.url_circuit);

		res.json({
			...circuit,
			source:          "tripoppo",
			prixPromo:       parseFloat(circuit.prix_promo) || 0,
			prixRegulier:    parseFloat(circuit.prix_regulier) || null,
			lienAgent:       circuit.lien_agent ?? circuit.url_circuit,
			image:           circuit.image_url,
			infos_rapides:   parseJSON(circuit.infos_rapides),
			images_carousel: parseJSON(circuit.images_carousel),
			inclus:          parseJSON(circuit.inclus),
			non_inclus:      parseJSON(circuit.non_inclus),
			itineraire,
			dates_prix,
			hotels,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ─────────────────────────────────────────────────────────────────────────────
//  PROXY TRANSPARENT — VACANCES AIR CANADA
// ─────────────────────────────────────────────────────────────────────────────

const ACV_BASE = "https://vacations.aircanada.com";

const ACV_HEADERS = {
	"User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
	Accept:            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
	"Accept-Language": "fr-CA,fr;q=0.9,en;q=0.8",
	"Accept-Encoding": "identity",
};

const MIME_MAP = {
	css: "text/css", js: "application/javascript", svg: "image/svg+xml",
	png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
	webp: "image/webp", gif: "image/gif", ico: "image/x-icon",
	woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf",
};

function mimeFromPath(chemin) {
	const ext = chemin.split("?")[0].split(".").pop().toLowerCase();
	return MIME_MAP[ext] ?? null;
}

function rewriteUrl(val) {
	if (!val || val.startsWith("data:") || val.startsWith("#") || val.startsWith("mailto:") || val.startsWith("javascript:")) return val;
	if (val.startsWith(ACV_BASE))                return "/acv-proxy?url=" + encodeURIComponent(val);
	if (val.startsWith("http://") || val.startsWith("https://")) return val;
	if (val.startsWith("//"))                    return "/acv-proxy?url=" + encodeURIComponent("https:" + val);
	if (val.startsWith("/"))                     return "/acv-proxy?url=" + encodeURIComponent(ACV_BASE + val);
	return val;
}

const AERIA_CSS = `<style id="aeria-overrides">
	header, footer, .header, .footer, nav, .nav, .navbar,
	.breadcrumb, .return-btn-top, .return-previous-btn,
	[class*="return-btn"], .back-link, .page-header-wrapper,
	.site-header, .site-footer, .ac-header, .ac-footer { display: none !important; }
	body { padding: 20px !important; margin: 0 !important; background: #fff !important; }
	.btn-primary, .ac-btn-primary, a.btn-red, .btn-red,
	.day-selector li.active a { background-color: #B8935C !important; border-color: #B8935C !important; color: white !important; }
</style>`;

app.get("/api/circuits/acv/page", async (req, res) => {
	const { url } = req.query;
	if (!url || !url.startsWith(ACV_BASE)) return res.status(403).json({ error: "URL non autorisée" });

	try {
		const response = await fetch(url, { headers: ACV_HEADERS });
		if (!response.ok) return res.status(response.status).send("Erreur ACV");
		const html = await response.text();
		const $ = cheerio.load(html);

		$("[href]").each((_, el)     => { const v = $(el).attr("href");     if (v) $(el).attr("href", rewriteUrl(v)); });
		$("[src]").each((_, el)      => { const v = $(el).attr("src");      if (v) $(el).attr("src", rewriteUrl(v)); });
		$("[action]").each((_, el)   => { const v = $(el).attr("action");   if (v) $(el).attr("action", rewriteUrl(v)); });
		$("[data-src]").each((_, el) => { const v = $(el).attr("data-src"); if (v) $(el).attr("data-src", rewriteUrl(v)); });

		$('meta[http-equiv="Content-Security-Policy"]').remove();
		$('meta[http-equiv="X-Frame-Options"]').remove();
		$("head").append(AERIA_CSS);

		res.setHeader("Content-Type", "text/html; charset=utf-8");
		res.setHeader("X-Frame-Options", "SAMEORIGIN");
		res.removeHeader("Content-Security-Policy");
		res.send($.html());
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/acv-proxy", async (req, res) => {
	const { url } = req.query;
	if (!url || !url.startsWith(ACV_BASE)) return res.status(403).end();

	try {
		const response = await fetch(url, { headers: ACV_HEADERS });
		if (!response.ok) return res.status(response.status).end();

		const forcedMime  = mimeFromPath(url.split("?")[0]);
		const contentType = forcedMime ?? response.headers.get("content-type") ?? "application/octet-stream";

		res.setHeader("Content-Type", contentType);
		res.setHeader("Cache-Control", "public, max-age=3600");
		res.removeHeader("Content-Security-Policy");

		if (contentType.includes("text/css")) {
			let css = await response.text();
			css = css.replace(/url\(["']?(\/[^)"'\s]+)["']?\)/g, (_, p) => {
				return 'url("/acv-proxy?url=' + encodeURIComponent(ACV_BASE + p) + '")';
			});
			return res.send(css);
		}

		const buffer = await response.arrayBuffer();
		res.send(Buffer.from(buffer));
	} catch (err) {
		res.status(500).end();
	}
});

// ─────────────────────────────────────────────────────────────────────────────
//  SANTÉ & DÉMARRAGE
// ─────────────────────────────────────────────────────────────────────────────

app.get("/api/health", (req, res) => res.json({ status: "ok", db: DB_PATH }));

app.listen(PORT, () => {
	console.log(`🚀 API Aeria Voyages démarrée sur le port ${PORT}`);
	console.log(`📦 DB : ${DB_PATH}`);
	console.log(`🇺🇸 Ports US chargés : ${US_PORTS.size} codes`);
});