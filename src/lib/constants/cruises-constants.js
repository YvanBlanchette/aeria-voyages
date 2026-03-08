import { useState, useEffect } from "react";

// ── Imports logos ─────────────────────────────────────────────────────────────
import logoRoyal     from "/logos/royal.png";
import logoPrincess  from "/logos/princess.png";
import logoVirgin    from "/logos/virgin.png";
import logoCelebrity from "/logos/celebrity.png";
import logoNCL       from "/logos/ncl.png";
import logoHAL       from "/logos/hal.png";
import logoCunard    from "/logos/cunard.png";
import logoSeabourn  from "/logos/seabourn.png";
import logoExplora   from "/logos/explora.png";

export const MESSENGER_URL      = "https://m.me/yvanblanchettecvc";
export const ITEMS_PAR_PAGE     = 9;
export const GOLD               = "#B8935C";

// ─────────────────────────────────────────────────────────────────────────────
//  DESTINATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const DESTINATION_LABELS = {
	caraibes_est:      "Caraïbes de l'Est",
	caraibes_ouest:    "Caraïbes de l'Ouest",
	caraibes_sud:      "Caraïbes du Sud",
	bahamas:           "Bahamas",
	bermudes:          "Bermudes",
	riviera_mexicaine: "Riviera Mexicaine",
	canal_panama:      "Canal de Panama",
	cote_est:          "Côte Est & N.-Angleterre",
	amerique_sud:      "Amérique du Sud",
	alaska:            "Alaska",
	hawaii:            "Hawaï",
	cote_pacifique:    "Côte Pacifique",
	mediterranee:      "Méditerranée",
	europe_nord:       "Europe du Nord",
	transatlantique:   "Transatlantique",
	asie:              "Asie",
	pacifique_sud:     "Pacifique Sud",
	moyen_orient:      "Moyen-Orient",
	ocean_indien:      "Océan Indien",
	afrique:           "Afrique",
};

export const DESTINATION_GROUPES = [
	{
		label: "Caraïbes & Amériques",
		destinations: [
			"caraibes_est","caraibes_ouest","caraibes_sud",
			"bahamas","bermudes","riviera_mexicaine",
			"canal_panama","cote_est","amerique_sud",
		],
	},
	{
		label: "Pacifique & Amérique du Nord",
		destinations: ["alaska","hawaii","cote_pacifique"],
	},
	{
		label: "Europe",
		destinations: ["mediterranee","europe_nord","transatlantique"],
	},
	{
		label: "Reste du monde",
		destinations: ["asie","pacifique_sud","moyen_orient","ocean_indien","afrique"],
	},
];

export const DESTINATIONS_ORDRE = [
	"caraibes_est","caraibes_ouest","caraibes_sud",
	"bahamas","bermudes","riviera_mexicaine",
	"canal_panama","cote_est","amerique_sud",
	"alaska","hawaii","cote_pacifique",
	"mediterranee","europe_nord","transatlantique",
	"asie","pacifique_sud","moyen_orient","ocean_indien","afrique",
];

export const LOGOS_CONFIG = {
	"Royal Caribbean":       { src: logoRoyal,     maxH: 32 },
	"Princess Cruises":      { src: logoPrincess,  maxH: 28 },
	"Virgin Voyages":        { src: logoVirgin,    maxH: 36 },
	"Celebrity Cruises":     { src: logoCelebrity, maxH: 36 },
	"Norwegian Cruise Line": { src: logoNCL,       maxH: 30 },
	"Holland America Line":  { src: logoHAL,       maxH: 32 },
	"Cunard Line":           { src: logoCunard,    maxH: 32 },
	"Seabourn":              { src: logoSeabourn,  maxH: 28 },
	"Explora Journeys":      { src: logoExplora,   maxH: 28 },
};

export const DUREES = [
	{ label: "3 – 5 nuits",   min: 3,  max: 5   },
	{ label: "6 – 9 nuits",   min: 6,  max: 9   },
	{ label: "10 – 14 nuits", min: 10, max: 14  },
	{ label: "15 nuits +",    min: 15, max: 999 },
];

export const TRI_OPTIONS = [
	{ value: "date-asc",   label: "Date asc."   },
	{ value: "date-desc",  label: "Date desc."  },
	{ value: "prix-asc",   label: "Prix asc."   },
	{ value: "prix-desc",  label: "Prix desc."  },
	{ value: "duree-asc",  label: "Durée asc."  },
	{ value: "duree-desc", label: "Durée desc." },
];

export const MOIS_LONG = [
	"", "janvier", "février", "mars", "avril", "mai", "juin",
	"juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

// ─────────────────────────────────────────────────────────────────────────────
//  UTILITAIRES — DATES & PRIX
// ─────────────────────────────────────────────────────────────────────────────

export const getMois    = (iso) => (iso && iso !== "N/A" ? parseInt(iso.split("-")[1]) : 0);
export const getAnnee   = (iso) => (iso && iso !== "N/A" ? iso.split("-")[0] : "");
export const getJour    = (iso) => (iso && iso !== "N/A" ? parseInt(iso.split("-")[2]) : 0);
export const getPrixMin = (c)   => c["Prix Int."] || c["Prix Ext."] || c["Prix Balcon"] || 0;

export function fmtPeriode(dep, ret) {
	if (!dep || dep === "N/A") return "—";
	const [jD, mD, aD] = [getJour(dep), getMois(dep), getAnnee(dep)];
	const [jR, mR, aR] = [getJour(ret), getMois(ret), getAnnee(ret)];
	if (!ret || ret === "N/A")  return `${jD} ${MOIS_LONG[mD]} ${aD}`;
	if (mD === mR && aD === aR) return `${jD} au ${jR} ${MOIS_LONG[mR]} ${aD}`;
	if (aD === aR)              return `${jD} ${MOIS_LONG[mD]} au ${jR} ${MOIS_LONG[mR]} ${aD}`;
	return `${jD} ${MOIS_LONG[mD]} ${aD} au ${jR} ${MOIS_LONG[mR]} ${aR}`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  UTILITAIRES — PORTS
// ─────────────────────────────────────────────────────────────────────────────

export function getPorts(c) {
	if (Array.isArray(c["Ports"]) && c["Ports"].length > 0) {
		return c["Ports"].filter(Boolean);
	}
	return [];
}

// ─────────────────────────────────────────────────────────────────────────────
//  UTILITAIRES — PARTAGE & CONTACT
// ─────────────────────────────────────────────────────────────────────────────

export function buildMessengerUrl(c) {
	const prix = getPrixMin(c);
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
	const prix  = getPrixMin(c);
	const sujet = `Demande d'information — ${c["Itinéraire"]} (${c["Navire"]})`;
	const corps =
		`Bonjour !\n\n` +
		`Je suis intéressé(e) par cette croisière :\n\n` +
		`🚢 ${c["Itinéraire"]} — ${c["Navire"]} (${c["Croisiériste"]})\n` +
		`📅 ${fmtPeriode(c["Date Départ"], c["Date Retour"])} · ${c["Nuits"]} nuits\n` +
		`⚓ Port de départ : ${c["Port Départ"]}\n` +
		`💰 À partir de ${prix.toLocaleString("fr-CA")} $ / pers.\n\n` +
		`Pourriez-vous me confirmer les disponibilités et le prix exact ?`;
	return `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent("info@aeriavoyages.com")}&su=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMPARATEURS DE TRI (gardés pour compatibilité éventuelle)
// ─────────────────────────────────────────────────────────────────────────────

export const COMPARATEURS = {
	"date-asc":   (a, b) => a["Date Départ"].localeCompare(b["Date Départ"]),
	"date-desc":  (a, b) => b["Date Départ"].localeCompare(a["Date Départ"]),
	"prix-asc":   (a, b) => getPrixMin(a) - getPrixMin(b),
	"prix-desc":  (a, b) => getPrixMin(b) - getPrixMin(a),
	"duree-asc":  (a, b) => a["Nuits"] - b["Nuits"],
	"duree-desc": (a, b) => b["Nuits"] - a["Nuits"],
};

// ─────────────────────────────────────────────────────────────────────────────
//  HOOK — useCroisieresMeta  (options de filtres — chargé une seule fois)
// ─────────────────────────────────────────────────────────────────────────────

export function useCroisieresMeta() {
	const [meta, setMeta] = useState(null);

	useEffect(() => {
		fetch("/api/croisieres/meta")
			.then((r) => r.json())
			.then(setMeta)
			.catch(console.error);
	}, []);

	return {
		OPTS_COMPAGNIES: (meta?.compagnies ?? [])
			.map((c) => ({ value: c, label: c })),
		OPTS_DUREES: DUREES.map((d, i) => ({ value: String(i), label: d.label })),
		OPTS_MOIS: (meta?.mois ?? [])
			.map((m) => ({ value: String(m), label: MOIS_LONG[m].charAt(0).toUpperCase() + MOIS_LONG[m].slice(1) })),
		OPTS_ANNEES: (meta?.annees ?? [])
			.map((a) => ({ value: a, label: a })),
		OPTS_DEST: DESTINATIONS_ORDRE.map((d) => ({ value: d, label: DESTINATION_LABELS[d] })),
	};
}

// ─────────────────────────────────────────────────────────────────────────────
//  HOOK — useCroisieres  (données paginées avec filtres côté serveur)
// ─────────────────────────────────────────────────────────────────────────────

export function useCroisieres({
	excludeUSA  = false,
	fDests      = [],
	fComps      = [],
	fNavires    = [],   // ← ajouter
	fDurees     = [],
	fMois       = [],
	fAnnees     = [],
	tri         = "date-asc",
	page        = 1,
	limit       = ITEMS_PAR_PAGE,
} = {}) {
	const [croisieres, setCroisieres] = useState([]);
	const [total, setTotal]           = useState(0);
	const [chargement, setChargement] = useState(true);

	useEffect(() => {
		setChargement(true);

		const params = new URLSearchParams();
		if (excludeUSA)        params.set("exclude_usa", "true");
		if (fDests.length > 0) params.set("destination", fDests.join(","));
		if (fComps.length > 0) params.set("croisieriste", fComps.join(","));
		if (fNavires.length > 0) params.set("navire", fNavires.join(","));
		if (fMois.length === 1) params.set("mois", fMois[0]);
		if (fAnnees.length === 1) params.set("annee", fAnnees[0]);
		if (fDurees.length > 0) {
			// Prend la plage min/max englobant toutes les durées sélectionnées
			const mins = fDurees.map((i) => DUREES[+i].min);
			const maxs = fDurees.map((i) => DUREES[+i].max);
			params.set("duree_min", Math.min(...mins));
			params.set("duree_max", Math.max(...maxs));
		}
		params.set("tri", tri);
		params.set("limit", limit);
		params.set("offset", (page - 1) * limit);

		fetch(`/api/croisieres?${params.toString()}`)
			.then((r) => r.json())
			.then((json) => {
				setCroisieres(json.data ?? []);
				setTotal(json.total ?? 0);
			})
			.catch(console.error)
			.finally(() => setChargement(false));
	}, [excludeUSA, fDests.join(","), fComps.join(","), fNavires.join(","), fDurees.join(","), fMois.join(","), fAnnees.join(","), tri, page, limit]);

	return { croisieres, total, chargement };
}

// ─────────────────────────────────────────────────────────────────────────────
//  PARTAGE
// ─────────────────────────────────────────────────────────────────────────────

async function chargerImageFichier(url, nom) {
	try {
		const response = await fetch(url);
		const blob = await response.blob();
		return new File([blob], nom, { type: blob.type });
	} catch {
		return null;
	}
}

export async function partagerCroisiere(c, fallbackMsg) {
	const ports = getPorts(c);

	const itineraireTexte = ports.length > 0
		? ports.join(" → ")
		: c["Itinéraire"];

	const prixLignes = [
		c["Prix Int."]   > 0 ? `  • Intérieure : ${c["Prix Int."].toLocaleString("fr-CA")} $`   : null,
		c["Prix Ext."]   > 0 ? `  • Extérieure : ${c["Prix Ext."].toLocaleString("fr-CA")} $`   : null,
		c["Prix Balcon"] > 0 ? `  • Balcon     : ${c["Prix Balcon"].toLocaleString("fr-CA")} $`  : null,
	].filter(Boolean).join("\n");

	const texte =
		`🚢 ${c["Itinéraire"]}\n\n` +
		`🗺️ ${itineraireTexte}\n\n` +
		`🛳️ Navire    : ${c["Navire"]} (${c["Croisiériste"]})\n` +
		`📍 Départ    : ${c["Port Départ"] || "N/A"}\n` +
		`📅 Période   : ${fmtPeriode(c["Date Départ"], c["Date Retour"])} · ${c["Nuits"]} nuits\n\n` +
		`💰 Prix par personne (occ. double, taxes incl.) :\n${prixLignes}\n\n` +
		`✈️ Réservez avec Aeria Voyages :\n👉 https://aeriavoyages.com`;

	if (navigator.share) {
		try {
			const [imgItineraire, imgNavire] = await Promise.all([
				c["Image Itinéraire"] ? chargerImageFichier(c["Image Itinéraire"], "itineraire.jpg") : null,
				c["Image Navire"]     ? chargerImageFichier(c["Image Navire"], "navire.jpg")         : null,
			]);

			const fichiers = [imgItineraire, imgNavire].filter(Boolean);

			if (fichiers.length > 0 && navigator.canShare({ files: fichiers })) {
				await navigator.share({
					title: `🚢 ${c["Itinéraire"]} – ${c["Nuits"]} nuits`,
					text: texte,
					files: fichiers,
				});
			} else {
				await navigator.share({
					title: `🚢 ${c["Itinéraire"]} – ${c["Nuits"]} nuits`,
					text: texte,
				});
			}
		} catch (e) {
			if (e.name !== "AbortError") console.error(e);
		}
	} else {
		await navigator.clipboard.writeText(texte);
		fallbackMsg?.();
	}
}

export function useNavires(fComps) {
	const [navires, setNavires] = useState([]);

	useEffect(() => {
		if (fComps.length === 0) { setNavires([]); return; }
		fetch(`/api/croisieres/navires?croisieriste=${fComps.join(",")}`)
			.then((r) => r.json())
			.then(setNavires)
			.catch(console.error);
	}, [fComps.join(",")]);

	return navires.map((n) => ({ value: n, label: n }));
}