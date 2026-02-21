import { useState, useEffect } from "react";
import MultiSelect from "./croisieres/MultiSelect";
import { ChevronRight, MapPin, Calendar, Tag, ChevronDown, Loader2, Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

const MOIS_FR = {
	"2026-01": "Janvier 2026",
	"2026-02": "Février 2026",
	"2026-03": "Mars 2026",
	"2026-04": "Avril 2026",
	"2026-05": "Mai 2026",
	"2026-06": "Juin 2026",
	"2026-07": "Juillet 2026",
	"2026-08": "Août 2026",
	"2026-09": "Septembre 2026",
	"2026-10": "Octobre 2026",
	"2026-11": "Novembre 2026",
	"2026-12": "Décembre 2026",
};

const regionLabels = {
	africa: "Afrique",
	america: "Amériques",
	asia: "Asie",
	europe: "Europe",
	oceania: "Océanie",
};

const VISIBLE_COUNT = 6;

const SOURCES = [
	{ id: "exoticca", label: "Exoticca", endpoint: "/api/circuits/exoticca", accent: "#F8D446", badgeClass: "bg-[#F8D446] text-white" },
	{ id: "acv", label: "Vacances Air Canada", endpoint: "/api/circuits/acv", accent: "#C41E3A", badgeClass: "bg-[#C41E3A] text-white" },
	{ id: "tripoppo", label: "Tripoppo", endpoint: "/api/circuits/tripoppo", accent: "#2693BF", badgeClass: "bg-[#2693BF] text-white" },
];

// ─── Carte circuit ────────────────────────────────────────────────────────────
function CarteCircuit({ circuit, accent, badgeClass }) {
	const isACV = circuit.source === "acv";

	return (
		<a
			href={circuit.lienAgent}
			target="_blank"
			rel="noopener noreferrer"
			className="destination-card group block overflow-hidden transition-all duration-700 hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)]"
		>
			<Card className="overflow-hidden border-none h-full rounded-md aspect-square">
				<div className="relative overflow-hidden min-h-84 h-full w-auto">
					<img
						src={circuit.image}
						alt={circuit.titre}
						className="absolute inset-0 size-full object-cover transition-transform duration-700"
						onError={(e) => {
							e.target.parentElement.style.background = "#1a1a2e";
							e.target.style.display = "none";
						}}
					/>
					<div className="destination-overlay" />

					{/* Badge rabais ou ACV */}
					<div className="absolute top-4 start-4 z-10 flex gap-2">
						{circuit.rabais && <Badge className={`${badgeClass} font-medium text-base px-3`}>{circuit.rabais} rabais</Badge>}
						{isACV && (
							<Badge className="bg-white/20 backdrop-blur text-white border border-white/30 font-medium px-3 flex items-center gap-1.5">
								<Plane className="size-3" />
								Vols inclus
							</Badge>
						)}
					</div>

					<div className="absolute bottom-0 inset-x-0 p-6 z-10 text-white destination-info">
						<div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase mb-2 text-white/80">
							<MapPin className="size-3.5" />
							{circuit.destination}
						</div>
						<CardTitle className="font-serif text-2xl text-white mb-3 leading-tight">{circuit.titre}</CardTitle>
						<div className="flex flex-wrap items-center gap-4 text-sm mb-3">
							<span className="flex items-center gap-1.5">
								<Calendar className="size-4" />
								{circuit.jours} jours
							</span>
							{isACV && circuit.villeDepart && (
								<span className="flex items-center gap-1.5 text-white/80">
									<Plane className="size-4" />
									Depuis {circuit.villeDepart}
								</span>
							)}
							{!isACV && circuit.region && (
								<span className="flex items-center gap-1.5">
									<Tag className="size-4" />
									{regionLabels[circuit.region] ?? circuit.region}
								</span>
							)}
						</div>

						{/* Lieux visités ACV */}
						{isACV && circuit.lieux?.length > 0 && (
							<p className="text-xs text-white/60 mb-3 line-clamp-1">
								{circuit.lieux.slice(0, 4).join(" · ")}
								{circuit.lieux.length > 4 ? ` +${circuit.lieux.length - 4}` : ""}
							</p>
						)}

						<Separator className="my-3 opacity-30" />
						<div className="flex items-center justify-between">
							<div>
								{circuit.prixRegulier && <p className="text-sm opacity-60 line-through">{circuit.prixRegulier.toLocaleString("fr-CA")} $</p>}
								<p className="text-xl font-bold text-white">{circuit.prixPromo.toLocaleString("fr-CA")} $</p>
								<p className="text-[10px] text-white/50">/ pers.</p>
							</div>
							<Button
								variant="ghost"
								size="sm"
								className="text-white hover:text-gold hover:bg-transparent p-0"
							>
								Voir le circuit
								<ChevronRight className="size-4 ms-1 group-hover:translate-x-1 transition-transform" />
							</Button>
						</div>
					</div>
				</div>
			</Card>
		</a>
	);
}

// ─── Filtres ACV ──────────────────────────────────────────────────────────────
function FiltresACV({ meta, filtres, onChange }) {
	if (!meta) return null;

	const optsVilles = meta.villes.map((v) => ({ value: v.code, label: v.nom }));
	const optsDests = meta.destinations.map((d) => ({ value: d.code, label: d.label }));
	const optsMois = meta.mois.map((m) => ({ value: m, label: MOIS_FR[m] ?? m }));

	return (
		<div className="flex flex-wrap gap-3 justify-center mb-10">
			<MultiSelect
				placeholder="Ville de départ"
				options={optsVilles}
				selected={filtres.villeDepart ? [filtres.villeDepart] : []}
				onChange={(vals) => onChange("villeDepart", vals[vals.length - 1] ?? null)}
			/>
			<MultiSelect
				placeholder="Destination"
				options={optsDests}
				selected={filtres.destination ? [filtres.destination] : []}
				onChange={(vals) => onChange("destination", vals[vals.length - 1] ?? null)}
			/>
			<MultiSelect
				placeholder="Mois"
				options={optsMois}
				selected={filtres.mois ? [filtres.mois] : []}
				onChange={(vals) => onChange("mois", vals[vals.length - 1] ?? null)}
			/>
		</div>
	);
}

// ─── Section principale ───────────────────────────────────────────────────────
const CircuitsSection = () => {
	const [sourceId, setSourceId] = useState("exoticca");
	const [dataCache, setDataCache] = useState({});
	const [acvMeta, setAcvMeta] = useState(null);
	const [chargement, setChargement] = useState(true);
	const [activeRegion, setActiveRegion] = useState("all");
	const [acvFiltres, setAcvFiltres] = useState({ destination: null, villeDepart: null, mois: null });
	const [showAll, setShowAll] = useState(false);

	const source = SOURCES.find((s) => s.id === sourceId);
	const isACV = sourceId === "acv";

	// Charger les meta ACV une seule fois
	useEffect(() => {
		fetch("/api/circuits/acv/meta")
			.then((r) => r.json())
			.then(setAcvMeta)
			.catch(() => {});
	}, []);

	// Charger les données selon la source + filtres ACV
	useEffect(() => {
		if (!isACV && dataCache[sourceId]) {
			setChargement(false);
			return;
		}

		setChargement(true);
		let url = source.endpoint;

		if (isACV) {
			const params = new URLSearchParams();
			if (acvFiltres.destination) params.append("destination", acvFiltres.destination);
			if (acvFiltres.villeDepart) params.append("ville_depart", acvFiltres.villeDepart);
			if (acvFiltres.mois) params.append("mois", acvFiltres.mois);
			if (params.toString()) url += "?" + params.toString();
		}

		fetch(url)
			.then((r) => r.json())
			.then((data) => {
				if (isACV) {
					setDataCache((prev) => ({ ...prev, acv_filtered: data }));
				} else {
					setDataCache((prev) => ({ ...prev, [sourceId]: data }));
				}
			})
			.finally(() => setChargement(false));
	}, [sourceId, acvFiltres]);

	const handleSource = (id) => {
		setSourceId(id);
		setActiveRegion("all");
		setShowAll(false);
		setAcvFiltres({ destination: null, villeDepart: null, mois: null });
	};

	const handleAcvFiltre = (key, val) => {
		setAcvFiltres((prev) => ({ ...prev, [key]: val }));
		setShowAll(false);
	};

	const circuitsData = isACV ? (dataCache["acv_filtered"] ?? []) : (dataCache[sourceId] ?? []);
	const regions = ["all", ...new Set(circuitsData.map((c) => c.region).filter(Boolean))];
	const filtered = !isACV && activeRegion !== "all" ? circuitsData.filter((c) => c.region === activeRegion) : circuitsData;
	const visible = showAll ? filtered : filtered.slice(0, VISIBLE_COUNT);

	return (
		<section
			id="circuits"
			className="py-20 px-6 bg-charcoal"
		>
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="text-center mb-12">
					<Badge
						variant="outline"
						className="text-xs tracking-[0.4em] uppercase mb-4 border-gold text-gold rounded-none px-3 py-1"
					>
						Nos Circuits terrestres
					</Badge>
					<h2 className="font-serif text-4xl lg:text-5xl font-semibold">Circuits & Voyages</h2>
					<p className="text-stone-400 tracking-wide mt-4 text-xs max-w-lg mx-auto">
						Tarifs à{" "}
						<b>
							<u>titre indicatif seulement</u>
						</b>
						, par personne en occupation double, taxes incluses. Contactez-moi pour connaître le prix exact et planifier votre prochain voyage.
					</p>
					<Separator className="w-20 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-10" />
				</div>

				{/* Tabs sources */}
				<div className="flex justify-center mb-10">
					<div className="flex border border-white/10 rounded-lg overflow-hidden">
						{SOURCES.map((s, i) => {
							const active = s.id === sourceId;
							return (
								<button
									key={s.id}
									onClick={() => handleSource(s.id)}
									className={`cursor-pointer px-6 py-3 text-sm font-medium tracking-wide transition-all duration-300 ${i > 0 ? "border-l border-white/10" : ""} ${active ? "text-white" : "text-stone-400 hover:text-white hover:bg-white/5"}`}
									style={active ? { backgroundColor: s.accent } : {}}
								>
									{s.label}
								</button>
							);
						})}
					</div>
				</div>

				{/* Filtres ACV */}
				{isACV && (
					<FiltresACV
						meta={acvMeta}
						filtres={acvFiltres}
						onChange={handleAcvFiltre}
						accent={source.accent}
					/>
				)}

				{/* Filtres région (Exoticca / Tripoppo) */}
				{!isACV && regions.length > 2 && (
					<div className="flex flex-wrap justify-center gap-3 mb-12">
						{regions.map((region) => {
							const active = activeRegion === region;
							return (
								<button
									key={region}
									onClick={() => {
										setActiveRegion(region);
										setShowAll(false);
									}}
									className={`px-5 py-2 text-sm tracking-[0.1em] uppercase font-medium transition-all duration-300 rounded-md border cursor-pointer ${active ? "text-white border-transparent" : "bg-transparent text-white border-white/80"}`}
									style={active ? { backgroundColor: source.accent } : {}}
									onMouseEnter={(e) => {
										if (!active) {
											e.currentTarget.style.borderColor = source.accent;
											e.currentTarget.style.color = source.accent;
										}
									}}
									onMouseLeave={(e) => {
										if (!active) {
											e.currentTarget.style.borderColor = "rgba(255,255,255,0.8)";
											e.currentTarget.style.color = "white";
										}
									}}
								>
									{region === "all" ? "Toutes" : (regionLabels[region] ?? region)}
								</button>
							);
						})}
					</div>
				)}

				{chargement ? (
					<div className="text-center py-24 flex flex-col items-center gap-3">
						<Loader2 className="size-8 animate-spin text-stone-500" />
						<p className="text-stone-400 text-sm">Chargement des circuits...</p>
					</div>
				) : visible.length === 0 ? (
					<div className="text-center py-24 text-stone-400">Aucun circuit disponible pour cette sélection.</div>
				) : (
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
						{visible.map((circuit) => (
							<CarteCircuit
								key={circuit.id}
								circuit={circuit}
								accent={source.accent}
								badgeClass={source.badgeClass}
							/>
						))}
					</div>
				)}

				{filtered.length > VISIBLE_COUNT && (
					<div className="text-center mt-12">
						<Button
							size="lg"
							variant="outline"
							onClick={() => setShowAll(!showAll)}
							className="cursor-pointer text-white text-sm tracking-[0.15em] uppercase font-medium"
							style={{ borderColor: source.accent }}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = source.accent;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = "transparent";
							}}
						>
							{showAll ? "Afficher moins" : `Afficher les ${filtered.length - VISIBLE_COUNT} autres circuits`}
							<ChevronDown className={`size-5 ms-2 transition-transform ${showAll ? "rotate-180" : ""}`} />
						</Button>
					</div>
				)}
			</div>
		</section>
	);
};

export default CircuitsSection;
