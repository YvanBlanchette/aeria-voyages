"use client";

import { useEffect, useMemo, useState } from "react";
import { REGION_LABELS, TRI_OPTIONS } from "@/lib/constants/land-tours-constants";
import Select from "@/components/select"
import { X } from "lucide-react";


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

export const FiltresRegion = ({ data, activeRegion, onRegionChange, setShowAll }) => {
	const regions = ["all", ...uniq(data.map(c => c.region))];
	if (regions.length <= 2) return null;
	return (
		<div className="flex flex-wrap justify-center gap-2 mb-10">
			{regions.map(r => (
				<FilterBtn key={r} active={activeRegion === r} onClick={() => { onRegionChange(r); setShowAll(false); }}>
					{r === "all" ? "Toutes" : (REGION_LABELS[r] ?? r)}
				</FilterBtn>
			))}
		</div>
	);
};

export const FiltresACV = ({ data, onFilter }) => {
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
	