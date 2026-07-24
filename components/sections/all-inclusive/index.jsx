"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, Hotel } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { AI_ITEMS_PER_PAGE as ITEMS_PER_PAGE } from "@/lib/constants/all-inclusive-constants";
import CarteAllInclusive from "@/components/sections/all-inclusive/components/carte-all-inclusive";
import ModalAllInclusive from "@/components/sections/all-inclusive/components/modal-all-inclusive";
import SectionHeader from "@/components/sections/SectionHeader";
import { useSearch, useStaticData } from "@/lib/hooks/all-inclusive-hooks";
import { defaultDateInput, triPackages } from "@/lib/helpers/all-inclusive-helpers";
import SearchMenu from "./components/search-menu";

export default function AllInclusivesSection({ initialSearch, initialStatic }) {
	const { destinations, origines } = useStaticData(initialStatic);
	const { data: tous, loading, error, fetched, execute } = useSearch(initialSearch);
	const hasFetched = useRef(false);

	// ── Paramètres de fetch ──
	const [orig, setOrig] = useState("montreal");
	const [dest, setDest] = useState(["tout-le-sud"]);
	const [dep, setDep] = useState(defaultDateInput());
	const [flex, setFlex] = useState("3");
	const [n, setN] = useState(["7"]);

	// ── Filtres côté client ──
	const [destFilter, setDestFilter] = useState([]);
	const [etoiles, setEtoiles] = useState([]);
	const [prix, setPrix] = useState("");

	// ── Tri + pagination ──
	const [tri, setTri] = useState("prix-asc");
	const [page, setPage] = useState(1);

	// ── Modal ──
	const [modalForfait, setModalForfait] = useState(null);

	// ── Filtrage + tri côté client ──
	const tries = useMemo(() => {
		let r = tous;

		// Filtre destination
		if (destFilter.length) r = r.filter((f) => destFilter.includes(f.destination));

		// Filtre étoiles
		if (etoiles.length) {
			r = r.filter((f) => {
				const nb = f.etoiles === "grandluxe" ? 5 : Math.floor(f.etoiles || 0);
				return etoiles.map(Number).includes(nb);
			});
		}

		// Filtre tranche de prix
		if (prix) {
			const [min, max] = prix.split("-").map(Number);
			r = r.filter((f) => f.prix >= min && f.prix <= max);
		}

		return triPackages(r, tri);
	}, [tous, destFilter, etoiles, prix, tri]);

	const nbPages = Math.ceil(tries.length / ITEMS_PER_PAGE);
	const affichees = tries.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

	// ── Fetch ──
	const handleSearch = () => {
		execute({
			orig,
			dest: dest[0] || "tout-le-sud",
			dep,
			flex,
			n: n[0] || "7",
		});
		setPage(1);
	};

	// Requête initiale au montage — sautée si déjà pré-remplie côté serveur
	useEffect(() => {
		if (!hasFetched.current && initialSearch) {
			hasFetched.current = true;
			return;
		}
		hasFetched.current = true;
		execute({
			orig,
			dest: dest[0] || "tout-le-sud",
			dep,
			flex,
			n: n[0] || "7",
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const allerPage = (p) => {
		setPage(p);
		document.getElementById("all-inclusives")?.scrollIntoView({ behavior: "smooth" });
	};

	const filtresActifs = destFilter.length > 0 || etoiles.length > 0 || !!prix;
	const reset = () => {
		setDestFilter([]);
		setEtoiles([]);
		setPrix("");
		setPage(1);
	};

	return (
		<section
			id="all-inclusives"
			className="py-20 bg-white"
		>
			<div className="max-w-7xl mx-auto px-4 lg:px-0">
				{/* En-tête */}
				<SectionHeader
					eyebrow="Forfaits tout inclus"
					title="Forfaits Tout Inclus"
					description="Des centaines d'hôtels tout inclus dans les Caraïbes et en Amérique centrale. Prix par personne, occupation double, taxes incluses."
				/>

				{/* ── Panneau de recherche ── */}
				<SearchMenu
					orig={orig}
					setOrig={setOrig}
					dest={dest}
					setDest={setDest}
					dep={dep}
					setDep={setDep}
					flex={flex}
					setFlex={setFlex}
					n={n}
					setN={setN}
					destFilter={destFilter}
					setDestFilter={setDestFilter}
					etoiles={etoiles}
					setEtoiles={setEtoiles}
					prix={prix}
					setPrix={setPrix}
					tri={tri}
					setTri={setTri}
					filtresActifs={filtresActifs}
					reset={reset}
					handleSearch={handleSearch}
					loading={loading}
					destinations={destinations}
					origines={origines}
					setPage={setPage}
					tous={tous}
				/>

				{/* ── Contenu ── */}
				{loading && (
					<div className="text-center py-24 flex flex-col items-center gap-3">
						<Loader2 className="size-8 animate-spin text-stone-300" />
						<p className="text-stone-400 text-sm">Chargement des forfaits...</p>
					</div>
				)}

				{error && !loading && (
					<div className="text-center py-24">
						<p className="text-red-400 text-sm">{error}</p>
					</div>
				)}

				{fetched && !loading && affichees.length === 0 && (
					<div className="text-center py-24">
						<Hotel className="size-12 mx-auto mb-4 text-stone-200" />
						<p className="text-stone-400 font-medium text-lg">Aucun forfait pour ces critères.</p>
						<button
							onClick={reset}
							className="mt-4 text-sm font-medium text-gold hover:opacity-70 transition-opacity"
						>
							Réinitialiser les filtres
						</button>
					</div>
				)}

				{fetched && !loading && affichees.length > 0 && (
					<>
						{/* Compteur + page */}
						<div className="flex items-center justify-between mb-4">
							<span className="text-xs text-stone-400">
								{tries.length.toLocaleString("fr-CA")} forfait{tries.length > 1 ? "s" : ""}
							</span>
							{nbPages > 1 && (
								<span className="text-xs text-stone-400">
									Page {page} / {nbPages}
								</span>
							)}
						</div>

						{/* Grille */}
						<motion.div
							key={page}
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, ease: "easeOut" }}
							className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
						>
							{affichees.map((f, i) => (
								<CarteAllInclusive
									key={`${f.id}-${i}`}
									forfait={f}
									onClick={setModalForfait}
								/>
							))}
						</motion.div>

						{/* Pagination */}
						{nbPages > 1 && (
							<div className="mt-10">
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
					</>
				)}
			</div>

			{/* Modal */}
			{modalForfait && (
				<ModalAllInclusive
					forfait={modalForfait}
					onClose={() => setModalForfait(null)}
				/>
			)}
		</section>
	);
}
