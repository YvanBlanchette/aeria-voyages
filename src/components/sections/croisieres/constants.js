// ── Imports logos ─────────────────────────────────────────────────────────────
import logoRoyal from "/logos/royal.png";
import logoPrincess from "/logos/princess.png";
import logoVirgin from "/logos/virgin.png";
import logoCelebrity from "/logos/celebrity.png";
import logoNCL from "/logos/ncl.png";
import logoHAL from "/logos/hal.png";
import logoCunard from "/logos/cunard.png";
import logoSeabourn from "/logos/seabourn.png";
import logoExplora from "/logos/explora.png";

// ── Imports données ────────────────────────────────────────────────────────────
import CroisieresSudData from "@/data/croisieres-sud.json";
import CroisieresEuropeData from "@/data/croisieres-europe.json";
import CroisieresAlaskaData from "@/data/croisieres-alaska.json";
import CroisieresExotiquesData from "@/data/croisieres-exotiques.json";

import { PORTS_DESTINATIONS_SOLEIL, PORTS_EUROPE, PORTS_ALASKA, PORTS_CANADA, PORTS_EXOTIQUES, PORTS_AMERIQUE_SUD } from "@/data/ports";

export const PORT_NOMS = {
	...PORTS_DESTINATIONS_SOLEIL,
	...PORTS_EUROPE,
	...PORTS_ALASKA,
	...PORTS_CANADA,
	...PORTS_EXOTIQUES,
	...PORTS_AMERIQUE_SUD,
};

// ── Constantes globales ────────────────────────────────────────────────────────
export const MESSENGER_URL = "https://m.me/yvanblanchettecvc";
export const COMPAGNIES_EXCLUES = new Set(["Carnival Cruise Line"]);
export const ITEMS_PAR_PAGE = 9;
export const GOLD = "#B8935C";

export const DESTINATION_LABELS = {
	caraibes: "Caraïbes",
	europe: "Europe",
	alaska: "Alaska",
	exotiques: "Exotiques",
};

export const DESTINATIONS_ORDRE = ["caraibes", "europe", "alaska", "exotiques"];

export const LOGOS_CONFIG = {
	"Royal Caribbean": { src: logoRoyal, maxH: 32 },
	"Princess Cruises": { src: logoPrincess, maxH: 28 },
	"Virgin Voyages": { src: logoVirgin, maxH: 36 },
	"Celebrity Cruises": { src: logoCelebrity, maxH: 36 },
	"Norwegian Cruise Line": { src: logoNCL, maxH: 30 },
	"Holland America Line": { src: logoHAL, maxH: 32 },
	"Cunard Line": { src: logoCunard, maxH: 32 },
	Seabourn: { src: logoSeabourn, maxH: 28 },
	"Explora Journeys": { src: logoExplora, maxH: 28 },
};

export const DUREES = [
	{ label: "3 – 5 nuits", min: 3, max: 5 },
	{ label: "6 – 9 nuits", min: 6, max: 9 },
	{ label: "10 – 14 nuits", min: 10, max: 14 },
	{ label: "15 nuits +", min: 15, max: 999 },
];

export const TRI_OPTIONS = [
	{ value: "date-asc", label: "Date asc." },
	{ value: "date-desc", label: "Date desc." },
	{ value: "prix-asc", label: "Prix asc." },
	{ value: "prix-desc", label: "Prix desc." },
	{ value: "duree-asc", label: "Durée asc." },
	{ value: "duree-desc", label: "Durée desc." },
];

export const MOIS_LONG = ["", "janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

// ── Utilitaires (fonctions pures) ─────────────────────────────────────────────
export const getMois = (iso) => (iso && iso !== "N/A" ? parseInt(iso.split("-")[1]) : 0);
export const getAnnee = (iso) => (iso && iso !== "N/A" ? iso.split("-")[0] : "");
export const getJour = (iso) => (iso && iso !== "N/A" ? parseInt(iso.split("-")[2]) : 0);
export const getPrixMin = (c) => c["Prix Int."] || c["Prix Ext."] || c["Prix Balcon"] || 0;

export function fmtPeriode(dep, ret) {
	if (!dep || dep === "N/A") return "—";
	const [jD, mD, aD] = [getJour(dep), getMois(dep), getAnnee(dep)];
	const [jR, mR, aR] = [getJour(ret), getMois(ret), getAnnee(ret)];
	if (!ret || ret === "N/A") return `${jD} ${MOIS_LONG[mD]} ${aD}`;
	if (mD === mR && aD === aR) return `${jD} au ${jR} ${MOIS_LONG[mR]} ${aD}`;
	if (aD === aR) return `${jD} ${MOIS_LONG[mD]} au ${jR} ${MOIS_LONG[mR]} ${aD}`;
	return `${jD} ${MOIS_LONG[mD]} ${aD} au ${jR} ${MOIS_LONG[mR]} ${aR}`;
}

/**
 * Résout un code de port en nom lisible.
 * Ex: "KTN" → "Ketchikan, AK"
 *     "Seattle, WA" → "Seattle, WA" (déjà un nom, passthrough)
 *     "CYXX" → "CYXX" (inconnu, retourné tel quel)
 */
export function resoudrePort(code) {
	if (!code) return null;
	const s = code.trim();
	// Déjà un nom lisible (contient espace ou virgule)
	if (s.includes(" ") || s.includes(",")) return s;
	// Résolution via le dictionnaire
	const nom = PORT_NOMS[s];
	if (nom) return nom;
	// Code inconnu — log en dev, affiché tel quel en prod
	if (import.meta.env.DEV) {
		console.warn(`[ports] Code inconnu : "${s}" — ajoutez-le dans ports.js`);
	}
	return s;
}

/**
 * Extrait et résout la liste des ports d'une croisière.
 * Priorité : champ "Ports" du JSON (codes bruts) → fallback URL itinéraire.
 */
export function getPorts(c) {
	// Champ Ports présent : tableau de codes à résoudre
	if (Array.isArray(c["Ports"]) && c["Ports"].length > 0) {
		return c["Ports"].map(resoudrePort).filter(Boolean);
	}
	// Fallback : décodage depuis l'URL de la carte (ancien format)
	return decoderPortsUrl(c["Image Itinéraire"]);
}

/**
 * Fallback — extrait les codes depuis l'URL et les résout.
 * Ex: .../itin/SEA-KTN-YYJ-SEA.webp → ['Seattle, WA', 'Ketchikan, AK', ...]
 */
function decoderPortsUrl(urlCarte) {
	const match = urlCarte?.match(/\/itin\/([^.]+)\.webp/);
	if (!match) return [];
	return match[1]
		.split("-")
		.filter((p) => /^[A-Z]/.test(p))
		.map(resoudrePort)
		.filter(Boolean);
}

export function buildMessengerUrl(c) {
	const prix = getPrixMin(c);
	const ports = getPorts(c);
	const txt =
		`Bonjour Yvan ! Je suis intéressé(e) par cette croisière :\n\n` +
		`🚢 ${c["Itinéraire"]} — ${c["Navire"]} (${c["Croisiériste"]})\n` +
		`📅 ${fmtPeriode(c["Date Départ"], c["Date Retour"])} · ${c["Nuits"]} nuits\n` +
		`⚓ Port de départ : ${c["Port Départ"]}\n` +
		`💰 À partir de ${prix.toLocaleString("fr-CA")} $ / pers.\n\n` +
		`Pourriez-vous me confirmer les disponibilités et le prix exact ?`;
	return `${MESSENGER_URL}?text=${encodeURIComponent(txt)}`;
}

export function buildEmailUrl(c) {
	const prix = getPrixMin(c);
	const sujet = `Demande d'information — ${c["Itinéraire"]} (${c["Navire"]})`;
	const corps =
		`Bonjour !\n\n` +
		`Je suis intéressé(e) par cette croisière :\n\n` +
		`🚢 ${c["Itinéraire"]} — ${c["Navire"]} (${c["Croisiériste"]})\n` +
		`📅 ${fmtPeriode(c["Date Départ"], c["Date Retour"])} · ${c["Nuits"]} nuits\n` +
		`⚓ Port de départ : ${c["Port Départ"]}\n` +
		`💰 À partir de ${prix.toLocaleString("fr-CA")} $ / pers.\n\n` +
		`Pourriez-vous me confirmer les disponibilités et le prix exact ?`;

	const to = "info@aeriavoyages.com";
	return `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
}

// ── Comparateurs de tri ────────────────────────────────────────────────────────
export const COMPARATEURS = {
	"date-asc": (a, b) => a["Date Départ"].localeCompare(b["Date Départ"]),
	"date-desc": (a, b) => b["Date Départ"].localeCompare(a["Date Départ"]),
	"prix-asc": (a, b) => getPrixMin(a) - getPrixMin(b),
	"prix-desc": (a, b) => getPrixMin(b) - getPrixMin(a),
	"duree-asc": (a, b) => a["Nuits"] - b["Nuits"],
	"duree-desc": (a, b) => b["Nuits"] - a["Nuits"],
};

// ── Données pré-calculées (une seule fois à l'import) ─────────────────────────
export const TOUTES = [
	...CroisieresSudData.map((c) => ({ ...c, _dest: "caraibes" })),
	...CroisieresEuropeData.map((c) => ({ ...c, _dest: "europe" })),
	...CroisieresAlaskaData.map((c) => ({ ...c, _dest: "alaska" })),
	...CroisieresExotiquesData.map((c) => ({ ...c, _dest: "exotiques" })),
].filter((c) => !COMPAGNIES_EXCLUES.has(c["Croisiériste"]));

const DESTS_ACTIVES = new Set(TOUTES.map((c) => c._dest));

export const OPTS_DEST = DESTINATIONS_ORDRE.map((d) => ({
	value: d,
	label: DESTINATION_LABELS[d],
	disabled: !DESTS_ACTIVES.has(d),
}));

export const OPTS_COMPAGNIES = [...new Set(TOUTES.map((c) => c["Croisiériste"]))].sort().map((c) => ({ value: c, label: c }));

export const OPTS_DUREES = DUREES.map((d, i) => ({ value: String(i), label: d.label }));

const MOIS_DISPOS = [...new Set(TOUTES.map((c) => getMois(c["Date Départ"])).filter(Boolean))].sort((a, b) => a - b);

export const OPTS_MOIS = MOIS_DISPOS.map((m) => ({
	value: String(m),
	label: MOIS_LONG[m].charAt(0).toUpperCase() + MOIS_LONG[m].slice(1),
}));

const ANNEES_DISPOS = [...new Set(TOUTES.map((c) => getAnnee(c["Date Départ"])).filter(Boolean))].sort();

export const OPTS_ANNEES = ANNEES_DISPOS.map((a) => ({ value: a, label: a }));
