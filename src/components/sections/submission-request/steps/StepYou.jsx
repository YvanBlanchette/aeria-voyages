import Input from "@/components/sections/submission-request/Input";

export default function StepYou({ form, setField, errors, focused, setFocused }) {
	return (
		<div className="animate-step">
			<h2 className=" text-center text-[26px] font-normal text-[#3D2E1E]">Faisons connaissance</h2>
			<p className="mt-2 text-center mb-6 font-montserrat text-[13px] font-light text-[#8B7355]">
				Ces informations me permettront de vous contacter avec votre proposition personnalisée.
			</p>

			<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-5">
				<Input
					label="Prénom"
					required
					value={form.prenom}
					onChange={(e) => setField("prenom", e.target.value)}
					error={errors.prenom}
					placeholder="Marie"
					focused={focused}
					setFocused={setFocused}
				/>
				<Input
					label="Nom"
					required
					value={form.nom}
					onChange={(e) => setField("nom", e.target.value)}
					error={errors.nom}
					placeholder="Tremblay"
					focused={focused}
					setFocused={setFocused}
				/>
			</div>

			<div className="mb-5">
				<Input
					label="Adresse courriel"
					required
					type="email"
					value={form.email}
					onChange={(e) => setField("email", e.target.value)}
					error={errors.email}
					placeholder="marie@exemple.com"
					focused={focused}
					setFocused={setFocused}
				/>
			</div>

			<div className="mb-5">
				<Input
					label="Téléphone"
					required
					type="tel"
					value={form.telephone}
					onChange={(e) => setField("telephone", e.target.value)}
					error={errors.telephone}
					placeholder="514 000-0000"
					focused={focused}
					setFocused={setFocused}
				/>
			</div>
		</div>
	);
}
