import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import LandToursContent from "./components/land-tours-content";
import { SOURCES } from "@/lib/constants/land-tours-constants";

const CircuitsSection = () => {
	const [activeSource, setActiveSource] = useState("exoticca");
	const source = SOURCES.find((s) => s.id === activeSource);

	return (
		<section
			id="circuits"
			className="py-20 px-6 bg-charcoal"
		>
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-12">
					<Badge
						variant="outline"
						className="text-xs tracking-[0.4em] uppercase mb-4 border-gold text-gold rounded-full px-3 py-1"
					>
						Nos Circuits terrestres
					</Badge>
					<h2 className="font-serif text-4xl lg:text-5xl font-semibold">Circuits d'Exception</h2>
					<p className="text-stone-400 tracking-wide mt-4 text-xs max-w-lg mx-auto">
						Tarifs à{" "}
						<b>
							<u>titre indicatif seulement</u>
						</b>
						, par personne en occupation double, taxes incluses. Option solo disponible sur certains circuits. Sauf mention contraire, les vols sont inclus.
						Contactez-moi pour connaître le prix exact et planifier votre prochain voyage.
					</p>
					<Separator className="w-20 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-10" />
				</div>

				<div className="flex flex-wrap justify-center gap-3 mb-12">
					{SOURCES.map((s) => {
						const Icon = s.icon;
						return (
							<button
								key={s.id}
								onClick={() => setActiveSource(s.id)}
								className={`flex items-center gap-2 px-6 py-3 text-sm tracking-[0.1em] uppercase font-medium transition-all duration-300 rounded-md border ${
									activeSource === s.id
										? "bg-gold text-white border-gold"
										: "cursor-pointer bg-transparent text-white border-white/40 hover:border-gold hover:text-gold"
								}`}
							>
								<Icon className="size-4" />
								{s.label}
							</button>
						);
					})}
				</div>
				<LandToursContent
					key={activeSource}
					source={source}
				/>
			</div>
		</section>
	);
};

export default CircuitsSection;
