import { useState, useEffect, useMemo } from "react";
import { ChevronRight, MapPin, Calendar, Tag, ChevronDown, Loader2, Plane, Globe, Mountain, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

const regionLabels = {
	africa:  "Afrique",
	america: "Amériques",
	asia:    "Asie",
	europe:  "Europe",
	oceania: "Océanie",
};

const VISIBLE_COUNT = 6;

const SOURCES = [
	{ id: "exoticca", label: "Exoticca",           icon: Globe,    endpoint: "/api/circuits/exoticca" },
	{ id: "acv",      label: "Air Canada Vacances", icon: Plane,    endpoint: "/api/circuits/acv"      },
	{ id: "tripoppo", label: "Tripoppo",            icon: Mountain, endpoint: "/api/circuits/tripoppo" },
];

const TRI_OPTIONS = [
	{ value: "prix-asc",   label: "Prix croissant"     },
	{ value: "prix-desc",  label: "Prix décroissant"   },
	{ value: "mois-asc",   label: "Date croissante"    },
	{ value: "mois-desc",  label: "Date décroissante"  },
	{ value: "duree-asc",  label: "Durée croissante"   },
	{ value: "duree-desc", label: "Durée décroissante" },
];

const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort();

const FilterBtn = ({ active, onClick, children }) => (
	<button
		onClick={onClick}
		className={`px-4 py-1.5 text-xs tracking-[0.1em] uppercase font-medium transition-all duration-200 rounded border ${
			active
				? "bg-gold text-white border-gold"
				: "cursor-pointer bg-transparent text-white/70 border-white/30 hover:border-gold hover:text-gold"
		}`}
	>
		{children}
	</button>
);

const Select = ({ value, onChange, options, placeholder }) => (
	<div className="relative">
		<select
			value={value}
			onChange={e => onChange(e.target.value)}
			className="appearance-none w-full pl-3 pr-8 py-2 text-sm bg-stone-800 border border-white/20 text-white rounded hover:border-gold/60 focus:outline-none focus:border-gold transition-colors cursor-pointer [&>option]:bg-stone-800 [&>option]:text-white"
		>
			<option value="">{placeholder}</option>
			{options.map(o => (
				<option key={o.value} value={o.value}>{o.label}</option>
			))}
		</select>
		<ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-white/40 pointer-events-none" />
	</div>
);

const CarteCircuit = ({ circuit }) => {
	const image        = circuit.image_url   ?? circuit.image ?? "";
	const titre        = circuit.titre       ?? circuit.nom   ?? "";
	const dest         = circuit.destination ?? "";
	const jours        = circuit.jours       ?? "";
	const region       = circuit.region      ?? "";
	const lien         = circuit.lienAgent   ?? circuit.url_circuit ?? "#";
	const prixPromo    = circuit.prixPromo   ?? circuit.prix  ?? null;
	const prixRegulier = circuit.prixRegulier ?? null;
	const rabais       = circuit.rabais      ?? circuit.rabais_pct ?? null;

	return (
		<a href={lien} target="_blank" rel="noopener noreferrer"
			className="destination-card group block overflow-hidden transition-all duration-700 hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)]"
		>
			<Card className="overflow-hidden border-none h-full rounded-md aspect-square">
				<div className="relative overflow-hidden min-h-84 h-full w-auto">
					<img src={image} alt={titre}
						className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
					/>
					<div className="destination-overlay" />
					{rabais && (
						<div className="absolute top-4 start-4 z-10">
							<Badge className="bg-gold text-white font-medium text-base px-3">{rabais} rabais</Badge>
						</div>
					)}
					<div className="absolute bottom-0 inset-x-0 p-6 z-10 text-white destination-info">
						{dest && (
							<div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase mb-2">
								<MapPin className="size-3.5" />{dest}
							</div>
						)}
						<CardTitle className="font-serif text-2xl text-white mb-3 leading-tight">{titre}</CardTitle>
						<div className="flex items-center gap-4 text-sm mb-3">
    {jours && <span className="flex items-center gap-1.5"><Calendar className="size-4" />{jours} jours</span>}
    {circuit.mois && (
        <span className="flex items-center gap-1.5">
            <Calendar className="size-4" />
            {new Date(circuit.mois + "-02").toLocaleDateString("fr-CA", { month: "long", year: "numeric" })}
        </span>
    )}
    {region && <span className="flex items-center gap-1.5"><Tag className="size-4" />{regionLabels[region] ?? region}</span>}
</div>
						{(prixPromo || prixRegulier) && (
							<>
								<Separator className="my-3 opacity-30" />
								<div className="flex items-center justify-between">
									<div>
										{prixRegulier && <p className="text-sm opacity-60 line-through">{Number(prixRegulier).toLocaleString("fr-CA")} $</p>}
										{prixPromo    && <p className="text-xl font-bold">{Number(prixPromo).toLocaleString("fr-CA")} $</p>}
									</div>
									<Button variant="ghost" size="sm" className="text-white hover:text-gold hover:bg-transparent p-0">
										Voir le circuit <ChevronRight className="size-4 ms-1 group-hover:translate-x-1 transition-transform" />
									</Button>
								</div>
							</>
						)}
					</div>
				</div>
			</Card>
		</a>
	);
};

const FiltresRegion = ({ data, activeRegion, onRegionChange, setShowAll }) => {
	const regions = ["all", ...uniq(data.map(c => c.region))];
	if (regions.length <= 2) return null;
	return (
		<div className="flex flex-wrap justify-center gap-2 mb-10">
			{regions.map(r => (
				<FilterBtn key={r} active={activeRegion === r} onClick={() => { onRegionChange(r); setShowAll(false); }}>
					{r === "all" ? "Toutes" : (regionLabels[r] ?? r)}
				</FilterBtn>
			))}
		</div>
	);
};

const FiltresACV = ({ data, onFilter }) => {
	const d = new Date();
	d.setMonth(d.getMonth() + 1);
	const moisSuivant = d.toISOString().slice(0, 7);
	const [dest,  setDest]  = useState("");
	const [ville, setVille] = useState("Montréal");
	const [mois,  setMois]  = useState(moisSuivant);
	const [duree, setDuree] = useState("");
	const [tri,   setTri]   = useState("prix-asc");

	const destinations = useMemo(() => uniq(data.map(c => c.destinationNom ?? c.destination))
		.map(d => ({ value: d, label: d })), [data]);

	const villes = useMemo(() => uniq(data.map(c => c.villeDepart ?? c.ville_depart))
		.map(v => ({ value: v, label: v })), [data]);

	const moisOpts = useMemo(() => uniq(data.map(c => c.mois))
		.map(m => ({
			value: m,
			label: new Date(m + "-02").toLocaleDateString("fr-CA", { month: "long", year: "numeric" }),
		})), [data]);

	const durees = useMemo(() => uniq(data.map(c => c.categorie_duree))
		.map(d => ({ value: d, label: `${d} jours` })), [data]);

	useEffect(() => { onFilter({ dest, ville, mois, duree, tri }); }, [dest, ville, mois, duree, tri]);

	const hasFilters = dest || ville !== "Montréal" || mois !== moisSuivant || duree;
	const reset = () => { setDest(""); setVille("Montréal"); setMois(moisSuivant); setDuree(""); setTri("prix-asc"); };

	return (
		<div className="mb-10 space-y-3">
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				<Select value={dest}  onChange={setDest}  options={destinations} placeholder="Destination" />
				<Select value={ville} onChange={setVille} options={villes}       placeholder="Ville de départ" />
				<Select value={mois}  onChange={setMois}  options={moisOpts}     placeholder="Mois" />
				<Select value={duree} onChange={setDuree} options={durees}       placeholder="Durée" />
			</div>
			<div className="flex items-center justify-between gap-3">
				<div className="w-52">
					<Select value={tri} onChange={setTri} options={TRI_OPTIONS} placeholder="Trier par" />
				</div>
				{hasFilters && (
					<button onClick={reset} className="flex items-center gap-1.5 text-xs text-gold hover:opacity-70 transition-opacity">
						<X className="size-3" /> Réinitialiser les filtres
					</button>
				)}
			</div>
		</div>
	);
};

const ContenuSource = ({ source }) => {
	const [data, setData]                 = useState([]);
	const [chargement, setChargement]     = useState(true);
	const [activeRegion, setActiveRegion] = useState("all");
	const [acvFilters, setAcvFilters]     = useState({});
	const [showAll, setShowAll]           = useState(false);

	useEffect(() => {
		setChargement(true);
		setData([]);
		setActiveRegion("all");
		setShowAll(false);
		setAcvFilters({});
		fetch(source.endpoint)
			.then(r => r.json())
			.then(d => setData(Array.isArray(d) ? d : []))
			.catch(() => setData([]))
			.finally(() => setChargement(false));
	}, [source.endpoint]);

	const filtered = useMemo(() => {
		let r = data;
		if (source.id === "acv") {
			const { dest, ville, mois, duree, tri } = acvFilters;
			if (dest)  r = r.filter(c => (c.destinationNom ?? c.destination) === dest);
			if (ville) r = r.filter(c => (c.villeDepart ?? c.ville_depart) === ville);
			if (mois)  r = r.filter(c => c.mois === mois);
			if (duree) r = r.filter(c => c.categorie_duree === duree);
			r = [...r].sort((a, b) => {
				switch (tri) {
					case "prix-asc":   return (a.prixPromo ?? 0) - (b.prixPromo ?? 0);
					case "prix-desc":  return (b.prixPromo ?? 0) - (a.prixPromo ?? 0);
					case "mois-asc":   return (a.mois ?? "").localeCompare(b.mois ?? "");
					case "mois-desc":  return (b.mois ?? "").localeCompare(a.mois ?? "");
					case "duree-asc":  return (a.jours ?? 0) - (b.jours ?? 0);
					case "duree-desc": return (b.jours ?? 0) - (a.jours ?? 0);
					default:           return 0;
				}
			});
		} else {
			if (activeRegion !== "all") r = r.filter(c => c.region === activeRegion);
		}
		return r;
	}, [data, source.id, activeRegion, acvFilters]);

	const visible = showAll ? filtered : filtered.slice(0, VISIBLE_COUNT);

	if (chargement) return (
		<div className="text-center py-24 flex flex-col items-center gap-3">
			<Loader2 className="size-8 animate-spin text-stone-500" />
			<p className="text-stone-400 text-sm">Chargement des circuits...</p>
		</div>
	);

	if (data.length === 0) return (
		<div className="text-center py-24">
			<p className="text-stone-400 text-sm">Aucun circuit disponible pour le moment.</p>
		</div>
	);

	return (
		<>
			{source.id === "acv" ? (
				<FiltresACV data={data} onFilter={setAcvFilters} />
			) : (
				<FiltresRegion
					data={data}
					activeRegion={activeRegion}
					onRegionChange={setActiveRegion}
					setShowAll={setShowAll}
				/>
			)}

			{filtered.length === 0 ? (
				<div className="text-center py-16">
					<p className="text-stone-400 text-sm">Aucun circuit pour ces filtres.</p>
				</div>
			) : (
				<>
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
						{visible.map((circuit, i) => (
							<CarteCircuit key={circuit.id ?? i} circuit={circuit} />
						))}
					</div>
					{filtered.length > VISIBLE_COUNT && (
						<div className="text-center mt-12">
							<Button size="lg" variant="outline" onClick={() => setShowAll(!showAll)}
								className="cursor-pointer border-gold text-charcoal hover:bg-gold hover:text-white text-sm tracking-[0.15em] uppercase font-medium"
							>
								{showAll ? "Afficher moins" : `Afficher les ${filtered.length - VISIBLE_COUNT} autres circuits`}
								<ChevronDown className={`size-5 ms-2 transition-transform ${showAll ? "rotate-180" : ""}`} />
							</Button>
						</div>
					)}
				</>
			)}
		</>
	);
};

const CircuitsSection = () => {
	const [activeSource, setActiveSource] = useState("exoticca");
	const source = SOURCES.find(s => s.id === activeSource);

	return (
		<section id="circuits" className="py-20 px-6 bg-charcoal">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-12">
					<Badge variant="outline" className="text-xs tracking-[0.4em] uppercase mb-4 border-gold text-gold rounded-none px-3 py-1">
						Nos Circuits terrestres
					</Badge>
					<h2 className="font-serif text-4xl lg:text-5xl font-semibold">Circuits d'Exception</h2>
					<p className="text-stone-400 tracking-wide mt-4 text-xs max-w-lg mx-auto">
						Tarifs à <b><u>titre indicatif seulement</u></b>, par personne en occupation double,
						taxes incluses. Option solo disponible sur certains circuits. Sauf mention contraire,
						les vols sont inclus. Contactez-moi pour connaître le prix exact et planifier votre prochain voyage.
					</p>
					<Separator className="w-20 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-10" />
				</div>

				<div className="flex flex-wrap justify-center gap-3 mb-12">
					{SOURCES.map(s => {
						const Icon = s.icon;
						return (
							<button key={s.id} onClick={() => setActiveSource(s.id)}
								className={`flex items-center gap-2 px-6 py-3 text-sm tracking-[0.1em] uppercase font-medium transition-all duration-300 rounded-md border ${
									activeSource === s.id
										? "bg-gold text-white border-gold"
										: "cursor-pointer bg-transparent text-white border-white/40 hover:border-gold hover:text-gold"
								}`}
							>
								<Icon className="size-4" />{s.label}
							</button>
						);
					})}
				</div>

				<ContenuSource key={activeSource} source={source} />
			</div>
		</section>
	);
};

export default CircuitsSection;