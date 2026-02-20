import { TYPES_CROISIERE, TYPES_CABINE, CATEGORIES_HOTEL } from "@/lib/data";
import Select from "@/components/sections/submission-request/Select";
import { MultiSelect } from "@/components/sections/submission-request/MultiSelect";

export default function StepDetails({ form, setField, focused, setFocused }) {
	const title =
		form.typeVoyage === "croisiere"
			? "Votre croisière idéale"
			: form.typeVoyage === "tout-inclus"
				? "Votre resort de rêve"
				: form.typeVoyage === "circuit"
					? "Votre circuit parfait"
					: form.typeVoyage === "sur-mesure"
						? "Votre voyage sur mesure"
						: "Détails du voyage";

	return (
		<div className="animate-step">
			<h2 className="font-playfair text-[26px] font-normal text-[#3D2E1E]">{title}</h2>
			<p className="mt-2 mb-8 font-raleway text-[13px] font-light text-[#8B7355]">
				Ces précisions me permettront de vous proposer des options vraiment adaptées.
			</p>

			<div className="flex flex-col gap-6">
				{/* SECTION CROISIÈRE */}
				{form.typeVoyage === "croisiere" && (
					<>
						<MultiSelect
							label="Types de croisière souhaités"
							options={TYPES_CROISIERE}
							selected={form.typeCroisiere || []}
							onChange={(val) => setField("typeCroisiere", val)}
							placeholder="Sélectionner vos types de navires"
						/>

						<MultiSelect
							label="Types de cabine souhaités"
							options={TYPES_CABINE}
							selected={form.typeCabine || []}
							onChange={(val) => setField("typeCabine", val)}
							placeholder="Sélectionner vos préférences"
						/>

						<MultiSelect
							label="Durées envisagées"
							options={[
								{ value: "3-5", label: "3 à 5 nuits - Escapade" },
								{ value: "6-9", label: "6 à 9 nuits - Découverte" },
								{ value: "10-14", label: "10 à 14 nuits - Immersion" },
								{ value: "15+", label: "15 nuits et plus - Grand voyage" },
							]}
							selected={form.dureeCroisiere || []}
							onChange={(val) => setField("dureeCroisiere", val)}
							placeholder="Sélectionner une ou plusieurs durées"
						/>
					</>
				)}

				{/* SECTION TOUT-INCLUS */}
				{form.typeVoyage === "tout-inclus" && (
					<>
						<MultiSelect
							label="Catégories d'hôtel"
							options={CATEGORIES_HOTEL}
							selected={form.categorieHotel || []}
							onChange={(val) => setField("categorieHotel", val)}
							placeholder="Standard, Luxe, Boutique..."
						/>

						<MultiSelect
							label="Proximité de la plage"
							options={[
								{ value: "plage-privee", label: "Plage privée" },
								{ value: "bord-mer", label: "Bord de mer" },
								{ value: "peu-importe", label: "Peu importe" },
							]}
							selected={form.proximitePlage || []}
							onChange={(val) => setField("proximitePlage", val)}
						/>

						<MultiSelect
							label="Styles de resort"
							options={[
								{ value: "familial", label: "Familial et animé" },
								{ value: "adultes", label: "Adultes seulement" },
								{ value: "romantique", label: "Romantique et intime" },
								{ value: "sportif", label: "Sportif et actif" },
							]}
							selected={form.styleResort || []}
							onChange={(val) => setField("styleResort", val)}
						/>
					</>
				)}

				{/* SECTION CIRCUIT */}
				{form.typeVoyage === "circuit" && (
					<>
						<MultiSelect
							label="Styles de circuit"
							options={[
								{ value: "guide", label: "Guidé en groupe" },
								{ value: "semi-guide", label: "Semi-guidé" },
								{ value: "autonome", label: "Autonome" },
								{ value: "prive", label: "Circuit privé" },
							]}
							selected={form.typeCircuit || []}
							onChange={(val) => setField("typeCircuit", val)}
						/>

						<MultiSelect
							label="Rythmes acceptés"
							options={[
								{ value: "detente", label: "Détente - 1 destination/jour" },
								{ value: "equilibre", label: "Équilibré" },
								{ value: "intensif", label: "Intensif - Voir beaucoup" },
							]}
							selected={form.rythmeCircuit || []}
							onChange={(val) => setField("rythmeCircuit", val)}
						/>
					</>
				)}

				{/* SECTION SUR MESURE */}
				{form.typeVoyage === "sur-mesure" && (
					<MultiSelect
						label="Niveaux de confort souhaités"
						options={[
							{ value: "comfort", label: "Confort" },
							{ value: "premium", label: "Premium" },
							{ value: "luxe", label: "Luxe" },
							{ value: "ultra-luxe", label: "Ultra-luxe" },
						]}
						selected={form.niveauConfort || []}
						onChange={(val) => setField("niveauConfort", val)}
					/>
				)}

				{/* VILLE DE DÉPART (Toujours Choix Unique) */}
				<Select
					label="Depuis quelle ville partez-vous ?"
					value={form.villeDepart}
					onChange={(e) => setField("villeDepart", e.target.value)}
					focused={focused}
					setFocused={setFocused}
				>
					<option value="">Sélectionner une ville</option>
					<option value="YUL">Montréal (YUL)</option>
					<option value="YQB">Québec (YQB)</option>
					<option value="YOW">Ottawa (YOW)</option>
					<option value="YYZ">Toronto (YYZ)</option>
					<option value="autre">Autre ville</option>
				</Select>
			</div>
		</div>
	);
}
