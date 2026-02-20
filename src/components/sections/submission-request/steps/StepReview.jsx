import { TYPES_VOYAGE, BUDGETS, TYPES_CROISIERE, TYPES_CABINE, CATEGORIES_HOTEL, EXPERIENCES } from "@/lib/data";

export default function StepReview({ form }) {
	// Fonction pour récupérer le label propre
	const getLabel = (list, val) => list.find((item) => item.value === val)?.label || val;

	// Composant interne pour les badges (couleurs ajustées pour fond sombre)
	const RenderBadges = ({ values, options = [] }) => {
		if (!values || values.length === 0) return <span className="text-white/30 italic text-[12px]">Aucune sélection</span>;

		return (
			<div className="flex flex-wrap justify-center gap-2 mt-2">
				{values.map((v) => {
					const label = options.find((opt) => opt.value === v)?.label || v;
					return (
						<span
							key={v}
							className="px-3 py-1 border border-[#B8935C]/50 text-[#B8935C] text-[10px] uppercase tracking-widest rounded-full bg-[#B8935C]/10"
						>
							{label}
						</span>
					);
				})}
			</div>
		);
	};

	return (
		<div className="animate-step flex flex-col items-center text-center max-w-2xl mx-auto">
			<h2 className="font-playfair text-[28px] font-normal text-white">Récapitulatif de votre projet</h2>
			<p className="mt-2 mb-10 font-raleway text-[14px] font-light text-[#B8935C]/80 uppercase tracking-widest">Vérifiez vos détails avant l'envol</p>

			<div className="w-full space-y-10">
				{/* SECTION 1 : QUI & QUOI */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-white/10">
					<div>
						<p className="text-[10px] uppercase tracking-[0.3em] text-[#B8935C] mb-2">Voyageur</p>
						<p className="font-raleway text-[16px] text-white font-light lowercase first-letter:uppercase">
							{form.prenom} {form.nom}
						</p>
					</div>
					<div>
						<p className="text-[10px] uppercase tracking-[0.3em] text-[#B8935C] mb-2">Type de séjour</p>
						<p className="font-raleway text-[16px] text-white font-light">{getLabel(TYPES_VOYAGE, form.typeVoyage)}</p>
					</div>
				</div>

				{/* SECTION 2 : LOGISTIQUE */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b border-white/10">
					<div>
						<p className="text-[10px] uppercase tracking-[0.3em] text-[#B8935C] mb-2">Dates & Budget</p>
						<p className="font-raleway text-[15px] text-white font-light">
							{form.dateDepart} — {form.dateRetour || "Flexible"}
						</p>
						<p className="text-[13px] text-white/60 mt-1">{getLabel(BUDGETS, form.budget)}</p>
					</div>
					<div>
						<p className="text-[10px] uppercase tracking-[0.3em] text-[#B8935C] mb-2">Passagers</p>
						<p className="font-raleway text-[15px] text-white font-light">
							{form.adultes} Adulte(s) {form.enfants > 0 && `& ${form.enfants} Enfant(s)`}
						</p>
					</div>
				</div>

				{/* SECTION 3 : PRÉFÉRENCES (MULTI-SELECTS) */}
				<div className="py-2">
					<p className="text-[10px] uppercase tracking-[0.3em] text-[#B8935C] mb-4">Vos préférences</p>

					<div className="space-y-6">
						{form.typeVoyage === "croisiere" && (
							<>
								<div>
									<p className="text-[12px] text-white/50 mb-2">Navires & Cabines</p>
									<RenderBadges
										values={[...form.typeCroisiere, ...form.typeCabine]}
										options={[...TYPES_CROISIERE, ...TYPES_CABINE]}
									/>
								</div>
								<div>
									<p className="text-[12px] text-white/50 mb-2">Durées envisagées</p>
									<RenderBadges values={form.dureeCroisiere} />
								</div>
							</>
						)}

						{form.typeVoyage === "tout-inclus" && (
							<div>
								<p className="text-[12px] text-white/50 mb-2">Style de Resort & Catégorie</p>
								<RenderBadges
									values={[...form.styleResort, ...form.categorieHotel]}
									options={[...CATEGORIES_HOTEL]}
								/>
							</div>
						)}

						<div>
							<p className="text-[12px] text-white/50 mb-2">Expériences souhaitées</p>
							<RenderBadges
								values={form.experiences}
								options={EXPERIENCES}
							/>
						</div>
					</div>
				</div>

				{/* SECTION 4 : DESTINATIONS */}
				{form.destinations && (
					<div className="pt-6 border-t border-white/10">
						<p className="text-[10px] uppercase tracking-[0.3em] text-[#B8935C] mb-3">Destinations de rêve</p>
						<p className="font-raleway text-[14px] text-white/90 leading-relaxed italic">"{form.destinations}"</p>
					</div>
				)}
			</div>
		</div>
	);
}
