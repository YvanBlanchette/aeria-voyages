import { EXPERIENCES } from "@/lib/data";
import { MultiSelect } from "@/components/sections/submission-request/MultiSelect";
import Textarea from "@/components/sections/submission-request/TextArea";
import Select from "@/components/sections/submission-request/Select";

export default function StepDreams({ form, setField, focused, setFocused }) {
	return (
		<div className="animate-step">
			<h2 className="text-center font-playfair text-[26px] font-normal text-[#3D2E1E]">Vos rêves de voyage</h2>
			<p className="text-center mt-2 mb-8 font-raleway text-[13px] font-light text-[#8B7355]">
				C'est la partie la plus importante. Décrivez-moi l'expérience que vous souhaitez vivre.
			</p>

			<div className="mb-6">
				<Textarea
					label="Destinations et lieux de rêve"
					value={form.destinations}
					onChange={(e) => setField("destinations", e.target.value)}
					placeholder="Ex : Islande pour les aurores boréales, fjords norvégiens..."
				/>
			</div>

			<div className="mb-6">
				<MultiSelect
					label="Expériences recherchées"
					options={EXPERIENCES}
					selected={form.experiences || []}
					onChange={(val) => setField("experiences", val)}
					placeholder="Choisir les expériences que vous recherchez"
				/>
			</div>

			<div className="mb-6">
				<Textarea
					label="Demandes spéciales ou besoins particuliers"
					value={form.requestsSpeciales}
					onChange={(e) => setField("requestsSpeciales", e.target.value)}
					placeholder="Ex : alimentation, mobilité, anniversaire, première croisière..."
				/>
			</div>

			<Select
				label="Comment avez-vous entendu parler d'Aeria Voyages ?"
				value={form.commentDecouvert}
				onChange={(e) => setField("commentDecouvert", e.target.value)}
				focused={focused}
				setFocused={setFocused}
			>
				<option value="">Sélectionner</option>
				<option value="bouche-oreille">Bouche à oreille</option>
				<option value="facebook">Facebook</option>
				<option value="instagram">Instagram</option>
				<option value="google">Google</option>
				<option value="client-fidele">Je suis déjà client(e)</option>
				<option value="autre">Autre</option>
			</Select>
		</div>
	);
}
