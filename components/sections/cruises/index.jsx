"use client";

// Ligne des imports React — retire useMemo
import { useState, useCallback } from "react";
import { motion } from "framer-motion";

// Ligne des imports constants — ajoute useNavires
import {
	ITEMS_PAR_PAGE,
	DUREES,
	TRI_OPTIONS,
	DESTINATION_LABELS,
	DESTINATION_GROUPES,
	useCroisieres,
	useCroisieresMeta,
	useNavires,
} from "@/lib/constants/cruises-constants";
import { X, Anchor, ChevronDown, Loader2 } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

import MultiSelect from "@/components/sections/cruises/components/multi-select";
import CruiseCard from "@/components/sections/cruises/components/cruises-card";
import Modal from "@/components/sections/cruises/components/cruises-modal";
import SectionHeader from "@/components/sections/SectionHeader";

export default function CroisieresSection({ initialData, initialMeta }) {
	const [modalC, setModalC] = useState(null);
	const [page, setPage] = useState(1);
	const [fDests, setFDests] = useState([]);
	const [fComps, setFComps] = useState([]);
	const [fNavires, setFNavires] = useState([]);
	const [fDurees, setFDurees] = useState([]);
	const [fMois, setFMois] = useState([]);
	const [fAnnees, setFAnnees] = useState([]);
	const [tri, setTri] = useState("date-asc");
	const [excludeUSA, setExcludeUSA] = useState(false);

	// Options de filtres — chargées une seule fois
	const { OPTS_DEST, OPTS_COMPAGNIES, OPTS_DUREES, OPTS_MOIS, OPTS_ANNEES } = useCroisieresMeta(initialMeta);

	// Données paginées — rechargées à chaque changement de filtre/page
	const {
		croisieres: affichees,
		total,
		chargement,
	} = useCroisieres({
		excludeUSA,
		fDests,
		fComps,
		fNavires,
		fDurees,
		fMois,
		fAnnees,
		tri,
		page,
		limit: ITEMS_PAR_PAGE,
		initialData,
	});

	const nbPages = Math.ceil(total / ITEMS_PAR_PAGE);

	// Navires filtrés selon compagnie sélectionnée
	const OPTS_NAVIRES = useNavires(fComps);

	const reset = useCallback(() => {
		setFDests([]);
		setFComps([]);
		setFNavires([]);
		setFDurees([]);
		setFMois([]);
		setFAnnees([]);
		setExcludeUSA(false);
		setPage(1);
	}, []);

	const handleCompsChange = useCallback((val) => {
		setFComps(val);
		if (val.length === 0) setFNavires([]);
		setPage(1);
	}, []);

	const filtresActifs =
		fDests.length > 0 || fComps.length > 0 || fNavires.length > 0 || fDurees.length > 0 || fMois.length > 0 || fAnnees.length > 0 || excludeUSA;

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
			className="py-20 bg-[#F5F2EB]"
		>
			<div className="max-w-7xl mx-auto">
				{/* En-tête */}
				<div className="px-4 lg:px-0">
					<SectionHeader
						eyebrow="Des offres incroyables"
						title="Croisières Maritimes"
						description={
							<>
								Prix à{" "}
								<b>
									<u>titre indicatif seulement</u>
								</b>
								, par personne, occupation double, taxes incluses. Communiquez avec moi pour le tarif exact et pour réserver.
							</>
						}
					/>
				</div>

				{/* Filtres */}
				<div className="px-4 lg:px-0 mb-8">
					<div className="bg-white rounded-2xl border border-stone-200/70 shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-4 lg:p-5 space-y-3">
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
						<MultiSelect
							placeholder="Destination"
							options={OPTS_DEST}
							selected={fDests}
							onChange={changer(setFDests)}
							groups={DESTINATION_GROUPES}
						/>
						<MultiSelect
							placeholder="Durée"
							options={OPTS_DUREES}
							selected={fDurees}
							onChange={changer(setFDurees)}
						/>
						<MultiSelect
							placeholder="Mois"
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
							onChange={handleCompsChange}
						/>
						<div className={fComps.length === 0 ? "opacity-40 pointer-events-none" : ""}>
							<MultiSelect
								placeholder="Navire"
								options={OPTS_NAVIRES}
								selected={fNavires}
								onChange={changer(setFNavires)}
							/>
						</div>
					</div>

					{/* Ligne 2 */}
					<div className="flex items-center justify-between gap-4">
						<label className="flex items-center gap-2 cursor-pointer select-none group">
							<input
								type="checkbox"
								checked={excludeUSA}
								onChange={(e) => {
									setExcludeUSA(e.target.checked);
									setPage(1);
								}}
								className="sr-only"
							/>
							<div
								className={`w-4 h-4 border flex items-center justify-center transition-colors
								${excludeUSA ? "border-gold bg-gold" : "border-stone-300 bg-white group-hover:border-gold"}`}
							>
								{excludeUSA && (
									<svg
										className="w-2.5 h-2.5 text-white"
										viewBox="0 0 10 10"
										fill="none"
									>
										<path
											d="M1.5 5L4 7.5L8.5 2.5"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								)}
							</div>
							<span className="text-xs text-stone-600 group-hover:text-stone-900 transition-colors">Exclure les ports américains</span>
						</label>

						<div className="flex items-center gap-4">
							{filtresActifs && (
								<button
									onClick={reset}
									className="cursor-pointer flex items-center gap-1.5 text-xs font-medium text-gold hover:opacity-70 transition-opacity"
								>
									<X className="size-3" /> Réinitialiser
								</button>
							)}

							{/* Compteur total */}
							{!chargement && <span className="text-xs text-stone-400">{total.toLocaleString("fr-CA")} croisières</span>}

							<div className="relative">
								<select
									value={tri}
									onChange={(e) => {
										setTri(e.target.value);
										setPage(1);
									}}
									className="appearance-none text-sm pl-3 w-[160px] pr-8 py-2.5 border border-stone-200 bg-white text-stone-700 hover:border-stone-300 focus:outline-none focus:border-gold transition-colors duration-200 cursor-pointer"
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
						</div>
					</div>

					{/* Badge destination active */}
					{fDests.length > 0 && (
						<div className="flex flex-wrap gap-2 pt-1">
							{fDests.map((d) => (
								<span
									key={d}
									className="inline-flex items-center gap-1.5 text-xs px-3 py-1 border border-gold text-gold rounded-full"
								>
									{DESTINATION_LABELS[d]}
									<button
										onClick={() => {
											setFDests((prev) => prev.filter((x) => x !== d));
											setPage(1);
										}}
										className="hover:opacity-70"
									>
										<X className="size-2.5" />
									</button>
								</span>
							))}
						</div>
					)}
				</div>
				</div>

				{/* Contenu */}
				{chargement ? (
					<div className="text-center py-24 flex flex-col items-center gap-3">
						<Loader2 className="size-8 animate-spin text-stone-300" />
						<p className="text-stone-400 text-sm">Chargement des croisières...</p>
					</div>
				) : affichees.length === 0 ? (
					<div className="text-center py-24">
						<Anchor className="size-12 mx-auto mb-4 text-stone-200" />
						<p className="text-stone-400 font-medium text-lg">Aucune croisière pour ces filtres.</p>
						<button
							onClick={reset}
							className="mt-4 text-sm font-medium text-gold hover:opacity-70 transition-opacity"
						>
							Réinitialiser les filtres
						</button>
					</div>
				) : (
					<motion.div
						key={page}
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, ease: "easeOut" }}
						className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
					>
						{affichees.map((c, i) => (
							<CruiseCard
								key={`${c["Date Départ"]}-${c["Navire"]}-${i}`}
								c={c}
								onClick={setModalC}
							/>
						))}
					</motion.div>
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
}
