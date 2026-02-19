import { useState, useMemo, useCallback } from "react";
import { X, Anchor, ChevronDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

import MultiSelect from "./MultiSelect";
import CarteCroisiere from "./CarteCroisiere";
import Modal from "./Modal";

import { GOLD, ITEMS_PAR_PAGE, DUREES, TRI_OPTIONS, COMPARATEURS, getMois, getAnnee, useCroisieres } from "./constants";
import { Separator } from "@/components/ui/separator";

export default function CroisieresSection() {
	const { toutes: TOUTES, chargement, OPTS_DEST, OPTS_COMPAGNIES, OPTS_DUREES, OPTS_MOIS, OPTS_ANNEES } = useCroisieres();

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
	}, [TOUTES, fDests, fComps, fDurees, fMois, fAnnees, tri]);

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
			className="py-20 bg-[#F5F2EB]"
		>
			<div className="max-w-7xl mx-auto">
				{/* En-tête */}
				<div className="text-center mb-14 px-4 lg:px-0">
					<Badge
						variant="outline"
						className="text-xs tracking-[0.4em] uppercase mb-4 rounded-xs"
						style={{ borderColor: GOLD, color: GOLD }}
					>
						DES OFFRES INCROYABLES
					</Badge>
					<h2 className="font-serif text-4xl lg:text-5xl font-semibold text-stone-900">Croisières Maritimes</h2>
					<p className="text-stone-400 tracking-wide mt-4 text-xs max-w-lg mx-auto">
						Les prix sont à{" "}
						<b>
							<u>titre indicatif seulement</u>
						</b>
						, par personne basé sur une occupation double et les taxes sont incluses. Communiquez avec moi pour obtenir le tarif exact et à jour ainsi que pour
						réserver votre prochaine croisière.
					</p>
					<Separator className="w-20 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-10" />
				</div>

				{/* Filtres */}
				<div className="px-4 lg:px-0 mb-8">
					<div className="flex flex-wrap gap-3 items-start">
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

						<div className="ml-auto flex flex-col items-center gap-4">
							<div className="relative">
								<select
									value={tri}
									onChange={(e) => {
										setTri(e.target.value);
										setPage(1);
									}}
									className="appearance-none text-sm pl-3 w-[120px] pr-8 py-2.5 border border-stone-200 bg-white text-stone-700 hover:border-stone-300 focus:outline-none focus:border-[#B8935C] transition-colors duration-200 cursor-pointer"
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
									className="cursor-pointer flex items-center gap-1.5 text-xs font-medium hover:opacity-70 transition-opacity"
									style={{ color: GOLD }}
								>
									<X className="size-3" /> Réinitialiser
								</button>
							)}
						</div>
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
							className="mt-4 text-sm font-medium hover:opacity-70 transition-opacity"
							style={{ color: GOLD }}
						>
							Réinitialiser les filtres
						</button>
					</div>
				) : (
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{affichees.map((c, i) => (
							<CarteCroisiere
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
