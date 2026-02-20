import { TYPES_VOYAGE, BUDGETS } from "@/lib/data";
import { GOLD } from "@/components/sections/submission-request/constants";
import GoldInput from "@/components/sections/submission-request/GoldInput";
import ChipGroup from "@/components/sections/submission-request/ChipGroup";
import Input from "@/components/sections/submission-request/Input";
import Select from "@/components/sections/submission-request/Select";

export default function StepTrip({ form, setField, errors, focused, setFocused }) {
	return (
		<div className="animate-step">
			<h2 className="text-center font-playfair text-[26px] font-normal text-[#3D2E1E]">L'essence du voyage</h2>
			<p className="text-center mt-2 mb-8 font-raleway text-[13px] font-light text-[#8B7355]">
				Quelques grandes lignes pour cibler les meilleures options pour vous.
			</p>
			<div className="mb-6">
				<Select
					label="Type de voyage"
					value={form.typeVoyage}
					onChange={(e) => setField("typeVoyage", e.target.value)}
					focused={focused}
					setFocused={setFocused}
				>
					<option
						value=""
						disabled
					>
						Sélectionnez un type de voyage
					</option>
					{TYPES_VOYAGE.map((type, index) => (
						<option
							key={index}
							value={type.value}
						>
							{type.label}
						</option>
					))}
				</Select>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
				<Input
					label="Date de départ"
					required
					// Empêche de choisir une date dans le passé
					min={new Date().toISOString().split("T")[0]}
					type="date"
					value={form.dateDepart}
					onChange={(e) => {
						setField("dateDepart", e.target.value);
						// Logique optionnelle : si la date de retour est maintenant avant le départ, on la reset
						if (form.dateRetour && e.target.value > form.dateRetour) {
							setField("dateRetour", "");
						}
					}}
					error={errors.dateDepart}
					focused={focused}
					setFocused={setFocused}
				/>
				<Input
					label="Date de retour"
					type="date"
					// Le "min" de la date de retour est la date de départ (ou aujourd'hui si vide)
					min={form.dateDepart || new Date().toISOString().split("T")[0]}
					value={form.dateRetour}
					onChange={(e) => setField("dateRetour", e.target.value)}
					focused={focused}
					setFocused={setFocused}
					// Désactiver tant que le départ n'est pas choisi (optionnel mais propre)
					disabled={!form.dateDepart}
				/>
			</div>
			<label className="flex items-center gap-3 cursor-pointer font-raleway text-[13px] text-[#8B7355] mb-6">
				<input
					type="checkbox"
					checked={form.datesFlexibles}
					onChange={(e) => setField("datesFlexibles", e.target.checked)}
					className="h-4 w-4 cursor-pointer"
					style={{ accentColor: GOLD }}
				/>
				Mes dates sont flexibles
			</label>

			<div className="mb-6">
				<p className="font-raleway text-[11px] tracking-widest uppercase text-[#8B7355] font-medium mb-3">Nombre de voyageurs</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
					{/* Sélecteur Adultes */}
					<Select
						label="Adultes (18+)"
						value={form.adultes}
						onChange={(e) => setField("adultes", e.target.value)}
						focused={focused}
						setFocused={setFocused}
					>
						{[1, 2, 3, 4, 5, 6].map((n) => (
							<option
								key={n}
								value={n}
							>
								{n === 10 ? "10+" : n}
							</option>
						))}
					</Select>

					{/* Sélecteur Enfants */}
					<Select
						label="Enfants (- 18 ans)"
						value={form.enfants}
						onChange={(e) => setField("enfants", e.target.value)}
						focused={focused}
						setFocused={setFocused}
					>
						{[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
							<option
								key={n}
								value={n}
							>
								{n === 8 ? "8+" : n}
							</option>
						))}
					</Select>
				</div>
				{Number(form.enfants) > 0 && (
					<div className="mt-6 animate-step">
						<p className="font-raleway text-[11px] tracking-widest uppercase text-[#8B7355] font-medium mb-4">Âge de chaque enfant</p>

						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
							{Array.from({ length: Number(form.enfants) }).map((_, index) => (
								<div
									key={index}
									className="animate-in fade-in slide-in-from-top-2 duration-300"
								>
									<Input
										label={`Enfant ${index + 1}`}
										type="number"
										min="0"
										max="17"
										value={form.agesEnfants?.[index] || ""}
										onChange={(e) => {
											// On crée une copie du tableau des âges ou un nouveau tableau
											const nouveauxAges = [...(form.agesEnfants || [])];
											nouveauxAges[index] = e.target.value;
											setField("agesEnfants", nouveauxAges);
										}}
										placeholder="Âge"
										focused={focused}
										setFocused={setFocused}
									/>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
			<div className="mt-6">
				<Select
					label="Budget approximatif par personne"
					required
					value={form.budget}
					onChange={(e) => setField("budget", e.target.value)}
					error={errors.budget}
					focused={focused}
					setFocused={setFocused}
				>
					{/* Option vide par défaut si tu le souhaites */}
					<option
						value=""
						disabled
					>
						Sélectionnez une tranche de budget
					</option>

					{BUDGETS.map((budget, index) => (
						<option
							key={index}
							value={budget.value}
						>
							{budget.label}
						</option>
					))}
				</Select>
			</div>
		</div>
	);
}
