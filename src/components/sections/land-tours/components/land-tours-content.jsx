import { useState, useEffect, useMemo } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VISIBLE_COUNT } from "@/lib/constants/land-tours-constants";
import { FiltresACV, FiltresRegion } from "@/components/sections/land-tours/components/land-tours-filtres";
import LandToursCard from "@/components/sections/land-tours/components/land-tours-card";

const LandToursContent = ({ source }) => {
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
						{visible.map((landTours, i) => (
							<LandToursCard key={landTours.id ?? i} tour={landTours} />
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

export default LandToursContent;