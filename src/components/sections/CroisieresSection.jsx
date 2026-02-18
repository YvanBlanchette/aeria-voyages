import { useState, useMemo, useEffect, useRef, memo, useCallback } from "react";
import { X, MapPin, Calendar, Ship, ChevronRight, Anchor, MessageCircle, Check, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
// ── Logos PNG (/public/logos/) ────────────────────────────────────────────────
import logoRoyal from "/logos/royal.png";
import logoPrincess from "/logos/princess.png";
import logoVirgin from "/logos/virgin.png";
import logoCelebrity from "/logos/celebrity.png";
import logoNCL from "/logos/ncl.png";
import logoHAL from "/logos/hal.png";
import logoCunard from "/logos/cunard.png";
import logoSeabourn from "/logos/seabourn.png";
import logoExplora from "/logos/explora.png";

// ── Données (décommenter au fur et à mesure) ──────────────────────────────────
import CroisieresSudData from "@/data/croisieres-sud.json";
import CroisieresEuropeData from "@/data/croisieres-europe.json";
import CroisieresAlaskaData from "@/data/croisieres-alaska.json";
import CroisieresExotiquesData from "@/data/croisieres-exotiques.json";

// ── Constantes ────────────────────────────────────────────────────────────────
const MESSENGER_URL = "https://m.me/yvanblanchettecvc";
const COMPAGNIES_EXCLUES = new Set(["Carnival Cruise Line"]);
const ITEMS_PAR_PAGE = 9;
const GOLD = "#B8935C";

const DESTINATION_LABELS = {
	sud: "Destinations Soleil",
	europe: "Europe",
	alaska: "Alaska",
	exotiques: "Exotiques",
};

// Toutes les destinations disponibles dans l'ordre d'affichage souhaité
const DESTINATIONS_ORDRE = ["sud", "europe", "alaska", "exotiques"];

const LOGOS_CONFIG = {
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

const DUREES = [
	{ label: "3 – 5 nuits", min: 3, max: 5 },
	{ label: "6 – 9 nuits", min: 6, max: 9 },
	{ label: "10 – 14 nuits", min: 10, max: 14 },
	{ label: "15 nuits +", min: 15, max: 999 },
];

const TRI_OPTIONS = [
	{ value: "date-asc", label: "Date ↑ (plus proche)" },
	{ value: "date-desc", label: "Date ↓ (plus loin)" },
	{ value: "prix-asc", label: "Prix ↑ (moins cher)" },
	{ value: "prix-desc", label: "Prix ↓ (plus cher)" },
	{ value: "duree-asc", label: "Durée ↑ (plus courte)" },
	{ value: "duree-desc", label: "Durée ↓ (plus longue)" },
];

const MOIS_LONG = ["", "janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

// ── Dictionnaire des ports (codes IATA → noms) ────────────────────────────────
const PORT_NOMS = {
	MIA: "Miami, FL",
	FLL: "Fort Lauderdale, FL",
	TPA: "Tampa, FL",
	MCO: "Port Canaveral, FL",
	JAX: "Jacksonville, FL",
	CHS: "Charleston, SC",
	ORF: "Norfolk, VA",
	BWI: "Baltimore, MD",
	EWR: "New York, NJ",
	NYC: "New York, NY",
	BOS: "Boston, MA",
	PHL: "Philadelphie, PA",
	MSY: "La Nouvelle-Orléans, LA",
	GLS: "Galveston, TX",
	KMOB: "Mobile, AL",
	SAN: "San Diego, CA",
	LAX: "Los Angeles, CA",
	SFO: "San Francisco, CA",
	SEA: "Seattle, WA",
	PDX: "Astoria/Portland, OR",
	SBA: "Santa Barbara, CA",
	AVX: "Catalina Island, CA",
	CZM: "Cozumel",
	PVR: "Puerto Vallarta",
	MZT: "Mazatlán",
	ZIH: "Zihuatanejo",
	HUX: "Huatulco",
	ACA: "Acapulco",
	ZLO: "Manzanillo",
	SJD: "Cabo San Lucas",
	MMGM: "Guaymas",
	MMLP: "La Paz",
	MMLT: "Loreto",
	MMMD: "Progreso",
	MGPB: "Puerto Barrios, Guatemala",
	GUA: "Puerto Quetzal, Guatemala",
	PTY: "Panama City",
	ONX: "Colón, Panama",
	BZE: "Belize City",
	LIO: "Limon, Costa Rica",
	PCH: "Puntarenas, Costa Rica",
	MRQP: "Quepos, Costa Rica",
	MRCH: "Caldera, Costa Rica",
	CTG: "Carthagène, Colombie",
	SKSM: "San Andrés",
	SKSP: "Providencia",
	SJU: "San Juan, Porto Rico",
	MAZ: "Mayaguez, Porto Rico",
	STT: "St. Thomas, USVI",
	STX: "St. Croix, USVI",
	EIS: "Tortola, BVI",
	TFFJ: "St. Barth",
	SXM: "Sint Maarten",
	ANU: "Antigua",
	DOM: "Dominique",
	SLU: "Sainte-Lucie",
	BGI: "Barbade",
	GND: "Grenade",
	TAB: "Tobago",
	AUA: "Aruba",
	BON: "Bonaire",
	CUR: "Curaçao",
	SVD: "St. Vincent",
	SKB: "Saint-Kitts",
	FDF: "Martinique",
	PTP: "Guadeloupe",
	TVSB: "Bequia",
	TQPF: "Petit Martinique",
	GVSV: "Mustique",
	GCM: "Grand Cayman",
	RTB: "Roatan, Honduras",
	NAS: "Nassau, Bahamas",
	FPO: "Freeport, Bahamas",
	CCZ: "Coco Cay, Bahamas",
	BIM: "Bimini, Bahamas",
	GDT: "Grand Turk",
	MBPV: "Providenciales, TCI",
	MBJ: "Montego Bay, Jamaïque",
	EYW: "Key West, FL",
	CAP: "Cap-Haïtien, Haïti",
	LRM: "La Romana, Rép. Dom.",
	MDSD: "Saint-Domingue, Rép. Dom.",
	POP: "Puerto Plata, Rép. Dom.",
	BDA: "Hamilton, Bermudes",
	GIG: "Rio de Janeiro, Brésil",
	SSA: "Salvador, Brésil",
	REC: "Recife, Brésil",
	SBFZ: "Fortaleza, Brésil",
	MCZ: "Maceió, Brésil",
	SBSG: "Natal, Brésil",
	SBMQ: "Macapá, Brésil",
	SBEG: "Manaus, Brésil",
	SBBE: "Belém, Brésil",
	CFB: "Cabo Frio, Brésil",
	SSZ: "Santos, Brésil",
	SDTK: "Itajaí, Brésil",
	MVD: "Montevideo, Uruguay",
	PDP: "Punta del Este, Uruguay",
	EZE: "Buenos Aires, Argentine",
	PMY: "Puerto Madryn, Argentine",
	PSY: "Stanley, Falkland",
	USH: "Ushuaïa, Argentine",
	PUQ: "Punta Arenas, Chili",
	WPU: "Puerto Williams, Chili",
	SCAS: "Puerto Aysén, Chili",
	SCTE: "Puerto Montt, Chili",
	SCSN: "San Antonio, Chili",
	SCSE: "Coquimbo, Chili",
	MEC: "Manta, Équateur",
	SEGU: "Guayaquil, Équateur",
	SLL: "Salinas, Équateur",
	SPSO: "Pisco, Pérou",
	LIM: "Callao/Lima, Pérou",
	YQB: "Québec",
	YBG: "Saguenay",
	YGV: "Havre-Saint-Pierre",
	YBC: "Baie-Comeau",
	CYUL: "Montréal",
	YHZ: "Halifax",
	YDF: "Deer Lake, NL",
	YQY: "Sydney, NS",
	CYSJ: "Saint John, NB",
	CYZV: "Sept-Îles",
	YVR: "Vancouver",
	YYJ: "Victoria, BC",
	BCN: "Barcelone",
	VLC: "Valence",
	AGP: "Malaga",
	SVQ: "Cadiz",
	VGO: "Vigo",
	LCG: "La Corogne",
	MJV: "Carthagène, Espagne",
	ALC: "Alicante",
	PMI: "Palma de Majorque",
	LEMH: "Minorque",
	GRX: "Grenade, Espagne",
	BIO: "Bilbao",
	LEGE: "Palamós",
	SPC: "La Palma, Canaries",
	LPA: "Las Palmas, Canaries",
	TFS: "Tenerife",
	FUE: "Fuerteventura",
	ACE: "Lanzarote",
	LIS: "Lisbonne",
	OPO: "Porto",
	TRPG: "Portimão",
	PDL: "Ponta Delgada, Açores",
	HOR: "Horta, Açores",
	LPLA: "Terceira, Açores",
	FNC: "Funchal, Madère",
	VXE: "São Vicente, Cap-Vert",
	RAI: "Praia, Cap-Vert",
	MRS: "Marseille",
	TLN: "Toulon",
	LFMT: "Sète",
	AJA: "Ajaccio, Corse",
	LFKF: "Figari, Corse",
	LFAK: "Porto-Vecchio, Corse",
	CEQ: "Cannes",
	LFBZ: "Biarritz",
	LFRC: "Cherbourg",
	LFRD: "Saint-Malo",
	LEH: "Le Havre",
	BOD: "Bordeaux",
	FCO: "Rome (Civitavecchia)",
	NAP: "Naples",
	GOA: "Gênes",
	FLR: "Livourne",
	PSA: "Livourne",
	CAG: "Cagliari, Sardaigne",
	LIRJ: "Île d'Elbe",
	TRS: "Trieste",
	MLA: "La Valette, Malte",
	ATH: "Athènes (Pirée)",
	JMK: "Mykonos",
	JTR: "Santorin",
	CHQ: "La Canée, Crète",
	LGML: "Milos",
	DBV: "Dubrovnik",
	SPU: "Split",
	TGD: "Kotor, Monténégro",
	KRS: "Kristiansand",
	OSL: "Oslo",
	HAM: "Hambourg",
	CPH: "Copenhague",
	AAR: "Aarhus",
	RTM: "Rotterdam",
	AMS: "Amsterdam",
	LHR: "Southampton",
	LYX: "Douvres",
	EGDP: "Portland, UK",
	GCI: "Guernesey",
	GIB: "Gibraltar",
	TNG: "Tanger",
	AGA: "Agadir",
	CMN: "Casablanca",
	DTTA: "Tunis",
	DSS: "Dakar",
	BJL: "Banjul",
	CPT: "Le Cap",
	WVB: "Walvis Bay",
	HNL: "Honolulu, Hawaï",
	OGG: "Maui, Hawaï",
	KOA: "Kona, Hawaï",
	LIH: "Kauai, Hawaï",
	ITO: "Hilo, Hawaï",
	FHSH: "Fanning Island",
	FYLZ: "Lautoka, Fidji",
	MHL: "Majuro, Marshall",
};

// ── Utilitaires (fonctions pures, pas de side effects) ────────────────────────
const getMois = (iso) => (iso && iso !== "N/A" ? parseInt(iso.split("-")[1]) : 0);
const getAnnee = (iso) => (iso && iso !== "N/A" ? iso.split("-")[0] : "");
const getJour = (iso) => (iso && iso !== "N/A" ? parseInt(iso.split("-")[2]) : 0);
const getPrixMin = (c) => c["Prix Int."] || c["Prix Ext."] || c["Prix Balcon"] || 0;

function fmtPeriode(dep, ret) {
	if (!dep || dep === "N/A") return "—";
	const [jD, mD, aD] = [getJour(dep), getMois(dep), getAnnee(dep)];
	const [jR, mR, aR] = [getJour(ret), getMois(ret), getAnnee(ret)];
	if (!ret || ret === "N/A") return `${jD} ${MOIS_LONG[mD]} ${aD}`;
	if (mD === mR && aD === aR) return `${jD} au ${jR} ${MOIS_LONG[mR]} ${aD}`;
	if (aD === aR) return `${jD} ${MOIS_LONG[mD]} au ${jR} ${MOIS_LONG[mR]} ${aD}`;
	return `${jD} ${MOIS_LONG[mD]} ${aD} au ${jR} ${MOIS_LONG[mR]} ${aR}`;
}

function decoderPorts(urlCarte) {
	const match = urlCarte?.match(/\/itin\/([^.]+)\.webp/);
	if (!match) return [];
	return match[1]
		.split("-")
		.filter((p) => /^[A-Z]/.test(p))
		.map((p) => PORT_NOMS[p] || (/^[A-Z]{2,4}$/.test(p) ? p : null))
		.filter(Boolean);
}

function getPorts(c) {
	return Array.isArray(c["Ports"]) && c["Ports"].length > 0 ? c["Ports"] : decoderPorts(c["Image Itinéraire"]);
}

function buildMessengerUrl(c) {
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

// Pré-calcul à l'import (une seule fois, pas à chaque render)
const TOUTES = [
	...CroisieresSudData.map((c) => ({ ...c, _dest: "sud" })),
	...CroisieresEuropeData.map((c) => ({ ...c, _dest: "europe" })),
	...CroisieresAlaskaData.map((c) => ({ ...c, _dest: "alaska" })),
	...CroisieresExotiquesData.map((c) => ({ ...c, _dest: "exotiques" })),
].filter((c) => !COMPAGNIES_EXCLUES.has(c["Croisiériste"]));

// Options statiques calculées une fois au module level
const DESTS_ACTIVES = new Set(TOUTES.map((c) => c._dest));
const OPTS_DEST = DESTINATIONS_ORDRE.map((d) => ({
	value: d,
	label: DESTINATION_LABELS[d],
	disabled: !DESTS_ACTIVES.has(d),
}));
const OPTS_COMPAGNIES = [...new Set(TOUTES.map((c) => c["Croisiériste"]))].sort().map((c) => ({ value: c, label: c }));
const OPTS_DUREES = DUREES.map((d, i) => ({ value: String(i), label: d.label }));
const MOIS_DISPOS = [...new Set(TOUTES.map((c) => getMois(c["Date Départ"])).filter(Boolean))].sort((a, b) => a - b);
const OPTS_MOIS = MOIS_DISPOS.map((m) => ({ value: String(m), label: MOIS_LONG[m].charAt(0).toUpperCase() + MOIS_LONG[m].slice(1) }));
const ANNEES_DISPOS = [...new Set(TOUTES.map((c) => getAnnee(c["Date Départ"])).filter(Boolean))].sort();
const OPTS_ANNEES = ANNEES_DISPOS.map((a) => ({ value: a, label: a }));

// ── LogoBadge ─────────────────────────────────────────────────────────────────
function LogoBadge({ compagnie, size = "card" }) {
	const config = LOGOS_CONFIG[compagnie];
	const isModal = size === "modal";

	if (!config)
		return <div className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-white text-[10px] tracking-widest uppercase font-bold">{compagnie}</div>;

	return (
		<div className="px-2.5 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm flex items-center">
			<img
				src={config.src}
				alt={compagnie}
				style={{ height: isModal ? config.maxH * 1.2 : config.maxH * 0.75, width: "auto", objectFit: "contain" }}
				className="drop-shadow-md"
				onError={(e) => {
					e.target.replaceWith(
						Object.assign(document.createElement("span"), {
							textContent: compagnie,
							style: "font-size:10px;color:white;font-weight:700;text-transform:uppercase;letter-spacing:.1em;text-shadow:0 1px 3px rgba(0,0,0,.5)",
						}),
					);
				}}
			/>
		</div>
	);
}

// ── InclPill ──────────────────────────────────────────────────────────────────
const INCL_CLS = {
	Inclus: "bg-emerald-50 text-emerald-700 border-emerald-200",
	Gratuit: "bg-amber-50 text-amber-700 border-amber-200",
	"Non inclus": "bg-stone-50 text-stone-400 border-stone-200",
};
function InclPill({ Icon, label, statut }) {
	return (
		<span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${INCL_CLS[statut] || INCL_CLS["Non inclus"]}`}>
			<Icon className="size-3" />
			{label}
		</span>
	);
}

// ── MultiSelect ───────────────────────────────────────────────────────────────
function MultiSelect({ placeholder, options, selected, onChange }) {
	const [open, setOpen] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		const close = (e) => {
			if (!ref.current?.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", close);
		return () => document.removeEventListener("mousedown", close);
	}, []);

	const toggle = useCallback(
		(val) => {
			const opt = options.find((o) => o.value === val);
			if (opt?.disabled) return;
			onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
		},
		[selected, onChange, options],
	);

	const hasSelection = selected.length > 0;
	const label = !hasSelection
		? placeholder
		: selected.length === 1
			? (options.find((o) => o.value === selected[0])?.label ?? selected[0])
			: `${selected.length} sélectionnés`;

	return (
		<div
			className="relative"
			ref={ref}
		>
			<button
				onClick={() => setOpen((o) => !o)}
				className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border transition-all duration-200 min-w-[125px] justify-between bg-white ${open || hasSelection ? "border-[#B8935C] shadow-sm" : "border-stone-200 hover:border-stone-300"}`}
			>
				<span className={hasSelection ? "text-stone-800 font-medium" : "text-stone-400"}>{label}</span>
				<div className="flex items-center gap-1.5 shrink-0">
					{hasSelection && (
						<span
							onClick={(e) => {
								e.stopPropagation();
								onChange([]);
							}}
							className="size-4 rounded-full flex items-center justify-center hover:opacity-80 cursor-pointer"
							style={{ backgroundColor: GOLD }}
						>
							<X className="size-2.5 text-white" />
						</span>
					)}
					<ChevronDown className={`size-3.5 text-stone-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
				</div>
			</button>

			{open && (
				<div className="absolute top-full left-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl z-40 py-1.5 min-w-full max-h-72 overflow-y-auto">
					{options.map((opt) => {
						const isSel = selected.includes(opt.value);
						const isDisabled = opt.disabled;
						return (
							<button
								key={opt.value}
								onClick={() => toggle(opt.value)}
								disabled={isDisabled}
								className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors gap-3 ${isDisabled ? "opacity-40 cursor-not-allowed" : "hover:bg-stone-50"}`}
							>
								<span className={isSel ? "text-stone-900 font-medium" : "text-stone-600"}>{opt.label}</span>
								{isDisabled ? (
									<span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-md shrink-0">Bientôt</span>
								) : (
									<span
										className={`size-4 rounded border flex items-center justify-center shrink-0 transition-all ${isSel ? "border-[#B8935C]" : "border-stone-300"}`}
										style={isSel ? { backgroundColor: GOLD } : {}}
									>
										{isSel && <Check className="size-2.5 text-white" />}
									</span>
								)}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ c, onClose }) {
	const ports = getPorts(c);
	const msgUrl = buildMessengerUrl(c);

	useEffect(() => {
		const fn = (e) => e.key === "Escape" && onClose();
		document.addEventListener("keydown", fn);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", fn);
			document.body.style.overflow = "";
		};
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<div className="relative w-full sm:max-w-xl bg-white sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
				{/* Image */}
				<div className="relative h-52 overflow-hidden bg-stone-200">
					<img
						src={c["Image Itinéraire"]}
						alt={c["Itinéraire"]}
						className="size-full object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
					<span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-stone-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
						{c["Croisiériste"]}
					</span>
					<span className="absolute top-4 right-12 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
						{c["Nuits"]} nuits
					</span>
					<button
						onClick={onClose}
						className="absolute top-3 right-3 size-8 rounded-full bg-black/35 hover:bg-black/55 flex items-center justify-center text-white transition-colors"
					>
						<X className="size-4" />
					</button>
					<div className="absolute bottom-0 inset-x-0 p-5">
						<h2 className="font-serif text-2xl text-white font-semibold leading-tight">{c["Itinéraire"]}</h2>
						<p className="text-white/70 text-sm mt-1 flex items-center gap-1.5">
							<Ship className="size-3.5" />
							{c["Navire"]}
						</p>
					</div>
				</div>

				{/* Corps */}
				<div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
					{/* Période */}
					<div className="bg-stone-50 rounded-2xl p-3 text-center">
						<p className="text-[10px] text-stone-400 tracking-[0.15em] uppercase mb-1">Période</p>
						<p className="font-semibold text-stone-800 capitalize">{fmtPeriode(c["Date Départ"], c["Date Retour"])}</p>
						{c["Port Départ"] && c["Port Départ"] !== "N/A" && <p className="text-xs text-stone-400 mt-0.5">Port de départ : {c["Port Départ"]}</p>}
					</div>

					{/* Timeline ports */}
					{ports.length > 0 && (
						<div>
							<p className="text-[10px] text-stone-400 tracking-[0.15em] uppercase mb-3">Escales</p>
							<div className="relative pl-1">
								<div className="absolute left-[10px] top-2 bottom-2 w-px bg-stone-200" />
								{ports.map((port, i) => {
									const isFirst = i === 0;
									const isLast = i === ports.length - 1;
									const isRetour = isLast && port === ports[0];
									const isTerminus = isFirst || (isLast && !isRetour);
									return (
										<div
											key={i}
											className="flex items-center gap-3 py-1.5 relative"
										>
											<div
												className={`size-[18px] rounded-full border-2 shrink-0 z-10 flex items-center justify-center ${isTerminus ? "bg-[#B8935C] border-[#B8935C]" : isRetour ? "bg-white border-[#B8935C]" : "bg-white border-stone-300"}`}
											>
												{isTerminus && <div className="size-1.5 rounded-full bg-white" />}
											</div>
											<span
												className={`text-sm leading-tight ${isTerminus ? "text-stone-900 font-semibold" : isRetour ? "text-[#B8935C] font-medium" : "text-stone-600"}`}
											>
												{port}
												{isRetour && <span className="text-xs text-stone-400 ml-2 font-normal">(retour au port de départ)</span>}
											</span>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* Prix */}
					<div>
						<p className="text-[10px] text-stone-400 tracking-[0.15em] uppercase mb-2">Prix par personne</p>
						<div className="flex gap-3 flex-wrap">
							{[
								["Intérieure", c["Prix Int."]],
								["Extérieure", c["Prix Ext."]],
								["Balcon", c["Prix Balcon"]],
							]
								.filter(([, p]) => p > 0)
								.map(([label, p]) => (
									<div
										key={label}
										className="flex-1 min-w-[90px] border border-stone-200 rounded-2xl p-3 text-center"
									>
										<p className="text-[10px] text-stone-400 mb-0.5">{label}</p>
										<p className="font-semibold text-stone-900 text-sm">{p.toLocaleString("fr-CA")} $</p>
									</div>
								))}
						</div>
					</div>

					{/* Navire */}
					{c["Image Navire"] && (
						<div className="flex items-center gap-3 bg-stone-50 rounded-2xl p-3">
							<img
								src={c["Image Navire"]}
								alt={c["Navire"]}
								className="h-14 w-24 object-cover rounded-xl"
								onError={(e) => {
									e.target.parentElement.style.display = "none";
								}}
							/>
							<div>
								<p className="text-[10px] text-stone-400 tracking-[0.1em] uppercase">Navire</p>
								<p className="font-semibold text-stone-800 text-sm">{c["Navire"]}</p>
								<p className="text-xs text-stone-500">{c["Croisiériste"]}</p>
							</div>
						</div>
					)}

					<Separator />

					<a
						href={msgUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="flex w-full items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl font-semibold text-sm text-white bg-[#0084FF] hover:bg-[#006fd6] transition-colors duration-200"
					>
						<MessageCircle className="size-5" />
						Demander de l'information via Messenger
					</a>
					<p className="text-center text-xs text-stone-400 pb-1">Les informations de cette croisière seront pré-remplies dans votre message.</p>
				</div>
			</div>
		</div>
	);
}

// ── CarteCreoisiere (memoïsée — ne re-render que si la croisière change) ──────
const CarteCreoisiere = memo(function CarteCreoisiere({ c, onClick }) {
	const prix = getPrixMin(c);
	return (
		<button
			onClick={() => onClick(c)}
			className="group text-left flex flex-col rounded-2xl overflow-hidden border border-stone-200 bg-white hover:border-stone-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.09)] transition-all duration-400 hover:-translate-y-1 cursor-pointer"
		>
			{/* Image */}
			<div className="relative h-44 overflow-hidden bg-stone-100 shrink-0">
				<img
					src={c["Image Itinéraire"]}
					alt={c["Itinéraire"]}
					className="size-full object-cover group-hover:scale-105 transition-transform duration-700"
					loading="lazy"
					onError={(e) => {
						e.target.style.display = "none";
					}}
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
				<span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-stone-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
					{c["Croisiériste"]}
				</span>
				<span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-stone-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
					{c["Nuits"]} nuits
				</span>
				{c["Image Navire"] && (
					<div className="absolute bottom-3 right-3 h-12 w-20 rounded-xl overflow-hidden border-2 border-white shadow-md bg-stone-200">
						<img
							src={c["Image Navire"]}
							alt={c["Navire"]}
							className="size-full object-cover"
							loading="lazy"
							onError={(e) => {
								e.target.parentElement.style.display = "none";
							}}
						/>
					</div>
				)}
			</div>

			{/* Corps */}
			<div className="flex flex-col flex-1 p-4 gap-3">
				<div>
					<h3 className="font-serif text-lg text-stone-900 leading-tight group-hover:text-[#B8935C] transition-colors duration-300">{c["Itinéraire"]}</h3>
					<p className="flex items-center gap-1.5 text-stone-400 text-xs mt-0.5">
						<Ship className="size-3 shrink-0" />
						{c["Navire"]}
					</p>
				</div>

				<div className="space-y-1">
					{c["Port Départ"] && c["Port Départ"] !== "N/A" && (
						<p className="flex items-center gap-1.5 text-xs text-stone-500">
							<MapPin
								className="size-3 shrink-0"
								style={{ color: GOLD }}
							/>
							{c["Port Départ"]}
						</p>
					)}
					<p className="flex items-center gap-1.5 text-xs text-stone-500 capitalize">
						<Calendar className="size-3 shrink-0 text-stone-400" />
						{fmtPeriode(c["Date Départ"], c["Date Retour"])}
					</p>
				</div>

				<Separator className="bg-stone-100" />

				<div className="flex items-end justify-between gap-2">
					<div>
						<p className="text-[10px] text-stone-400 tracking-[0.15em] uppercase">À partir de</p>
						<div className="flex items-baseline gap-1 mt-0.5">
							<span className="text-xl font-semibold text-stone-900">{prix.toLocaleString("fr-CA")} $</span>
							<span className="text-xs text-stone-400">/ pers.</span>
						</div>
						<div className="flex flex-wrap gap-1 mt-1.5">
							{c["Prix Int."] > 0 && (
								<span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-md">Int. {c["Prix Int."].toLocaleString("fr-CA")} $</span>
							)}
							{c["Prix Ext."] > 0 && (
								<span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-md">Ext. {c["Prix Ext."].toLocaleString("fr-CA")} $</span>
							)}
							{c["Prix Balcon"] > 0 && (
								<span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-md">Bal. {c["Prix Balcon"].toLocaleString("fr-CA")} $</span>
							)}
						</div>
					</div>

					<div className="flex flex-col items-end gap-2 shrink-0">
						<div className="flex gap-1.5">
							{c["WiFi"] === "Inclus" && (
								<Wifi
									className="size-3.5 text-emerald-500"
									title="WiFi inclus"
								/>
							)}
							{c["Boissons"] === "Inclus" && (
								<GlassWater
									className="size-3.5 text-emerald-500"
									title="Boissons incluses"
								/>
							)}
							{c["Pourboires"] === "Inclus" && (
								<BadgeCheck
									className="size-3.5 text-emerald-500"
									title="Pourboires inclus"
								/>
							)}
						</div>
						<div className="size-8 rounded-full border border-[#B8935C]/30 flex items-center justify-center group-hover:bg-[#B8935C] group-hover:border-[#B8935C] transition-all duration-300">
							<ChevronRight className="size-4 text-[#B8935C] group-hover:text-white transition-colors duration-300" />
						</div>
					</div>
				</div>
			</div>
		</button>
	);
});

// ── Comparateurs de tri ───────────────────────────────────────────────────────
const COMPARATEURS = {
	"date-asc": (a, b) => a["Date Départ"].localeCompare(b["Date Départ"]),
	"date-desc": (a, b) => b["Date Départ"].localeCompare(a["Date Départ"]),
	"prix-asc": (a, b) => getPrixMin(a) - getPrixMin(b),
	"prix-desc": (a, b) => getPrixMin(b) - getPrixMin(a),
	"duree-asc": (a, b) => a["Nuits"] - b["Nuits"],
	"duree-desc": (a, b) => b["Nuits"] - a["Nuits"],
};

// ── Section principale ────────────────────────────────────────────────────────
const CroisieresSection = () => {
	const [modalC, setModalC] = useState(null);
	const [page, setPage] = useState(1);
	const [fDests, setFDests] = useState([]);
	const [fComps, setFComps] = useState([]);
	const [fDurees, setFDurees] = useState([]);
	const [fMois, setFMois] = useState([]);
	const [fAnnees, setFAnnees] = useState([]);
	const [tri, setTri] = useState("date-asc");

	const reset = useCallback(() => {
		setFDests([]);
		setFComps([]);
		setFDurees([]);
		setFMois([]);
		setFAnnees([]);
		setPage(1);
	}, []);

	const filtresActifs = fDests.length > 0 || fComps.length > 0 || fDurees.length > 0 || fMois.length > 0 || fAnnees.length > 0;

	const filtrees = useMemo(() => {
		let r = TOUTES;
		if (fDests.length > 0) r = r.filter((c) => fDests.includes(c._dest));
		if (fComps.length > 0) r = r.filter((c) => fComps.includes(c["Croisiériste"]));
		if (fMois.length > 0) r = r.filter((c) => fMois.includes(String(getMois(c["Date Départ"]))));
		if (fAnnees.length > 0) r = r.filter((c) => fAnnees.includes(getAnnee(c["Date Départ"])));
		if (fDurees.length > 0)
			r = r.filter((c) =>
				fDurees.some((i) => {
					const { min, max } = DUREES[+i];
					return c["Nuits"] >= min && c["Nuits"] <= max;
				}),
			);
		return [...r].sort(COMPARATEURS[tri] ?? COMPARATEURS["date-asc"]);
	}, [fDests, fComps, fDurees, fMois, fAnnees, tri]);

	const nbPages = Math.ceil(filtrees.length / ITEMS_PAR_PAGE);
	const affichees = filtrees.slice((page - 1) * ITEMS_PAR_PAGE, page * ITEMS_PAR_PAGE);
	const handleOuvrirModal = useCallback((c) => setModalC(c), []);
	const changer = (setter) => (val) => {
		setter(val);
		setPage(1);
	};
	const allerPage = (p) => {
		setPage(p);
		document.getElementById("croisieres")?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<section
			id="croisieres"
			className="py-20 px-6 bg-white"
		>
			<div className="max-w-7xl mx-auto">
				{/* En-tête */}
				<div className="text-center mb-14">
					<Badge
						variant="outline"
						className="text-xs tracking-[0.4em] uppercase mb-4"
						style={{ borderColor: GOLD, color: GOLD }}
					>
						Dernière Minute
					</Badge>
					<h2 className="font-serif text-4xl lg:text-5xl font-semibold text-stone-900">Croisières de Prestige</h2>
					<p className="text-stone-400 mt-4 text-sm max-w-md mx-auto">Départs imminents sélectionnés — contactez Yvan pour réserver</p>
					<div className="w-20 h-0.5 mx-auto mt-8 bg-gradient-to-r from-transparent via-[#B8935C] to-transparent" />
				</div>

				{/* Filtres */}
				<div className="mb-10 p-5 bg-stone-50 rounded-2xl border border-stone-100">
					<div className="flex flex-wrap gap-3 items-center">
						<MultiSelect
							placeholder="Destination"
							options={OPTS_DEST}
							selected={fDests}
							onChange={changer(setFDests)}
						/>

						<MultiSelect
							placeholder="Durée du séjour"
							options={OPTS_DUREES}
							selected={fDurees}
							onChange={changer(setFDurees)}
						/>

						<MultiSelect
							placeholder="Mois de départ"
							options={OPTS_MOIS}
							selected={fMois}
							onChange={changer(setFMois)}
						/>

						<MultiSelect
							placeholder="Année"
							options={OPTS_ANNEES}
							selected={fAnnees}
							onChange={changer(setFAnnees)}
						/>

						<MultiSelect
							placeholder="Croisiériste"
							options={OPTS_COMPAGNIES}
							selected={fComps}
							onChange={changer(setFComps)}
						/>

						<div className="ml-auto flex items-center gap-4">
							{/* Tri */}
							<div className="relative">
								<select
									value={tri}
									onChange={(e) => {
										setTri(e.target.value);
										setPage(1);
									}}
									className="appearance-none text-sm pl-3 pr-8 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 hover:border-stone-300 focus:outline-none focus:border-[#B8935C] transition-colors duration-200 cursor-pointer"
								>
									{TRI_OPTIONS.map((o) => (
										<option
											key={o.value}
											value={o.value}
										>
											{o.label}
										</option>
									))}
								</select>
								<ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-stone-400 pointer-events-none" />
							</div>

							{filtresActifs && (
								<button
									onClick={reset}
									className="flex items-center gap-1.5 text-xs font-medium hover:opacity-70 transition-opacity"
									style={{ color: GOLD }}
								>
									<X className="size-3" /> Réinitialiser
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Grille */}
				{affichees.length === 0 ? (
					<div className="text-center py-24">
						<Anchor className="size-12 mx-auto mb-4 text-stone-200" />
						<p className="text-stone-400 font-medium text-lg">Aucune croisière pour ces filtres.</p>
						<button
							onClick={reset}
							className="mt-4 text-sm font-medium hover:opacity-70 transition-opacity"
							style={{ color: GOLD }}
						>
							Réinitialiser les filtres
						</button>
					</div>
				) : (
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{affichees.map((c, i) => (
							<CarteCreoisiere
								key={`${c["Date Départ"]}-${c["Navire"]}-${i}`}
								c={c}
								onClick={handleOuvrirModal}
							/>
						))}
					</div>
				)}

				{/* Pagination */}
				{nbPages > 1 && (
					<div className="mt-12">
						<Pagination>
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										onClick={() => page > 1 && allerPage(page - 1)}
										className={page === 1 ? "pointer-events-none opacity-30" : "cursor-pointer bg-charcoal hover:bg-gold w-28"}
									/>
								</PaginationItem>
								<PaginationItem>
									<span className="text-sm text-stone-400 px-3">
										{page} / {nbPages}
									</span>
								</PaginationItem>
								<PaginationItem>
									<PaginationNext
										onClick={() => page < nbPages && allerPage(page + 1)}
										className={page === nbPages ? "pointer-events-none opacity-30" : "cursor-pointer bg-charcoal hover:bg-gold w-28"}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
						<p className="text-center text-stone-400 text-xs mt-3">
							{(page - 1) * ITEMS_PAR_PAGE + 1}–{Math.min(page * ITEMS_PAR_PAGE, filtrees.length)} sur {filtrees.length} croisières
						</p>
					</div>
				)}
			</div>

			{modalC && (
				<Modal
					c={modalC}
					onClose={() => setModalC(null)}
				/>
			)}
		</section>
	);
};

export default CroisieresSection;
