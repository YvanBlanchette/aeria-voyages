"use client";

import { useState } from "react";
import LandToursContent from "./components/land-tours-content";
import SectionHeader from "@/components/sections/SectionHeader";
import { SOURCES } from "@/lib/constants/land-tours-constants";

const CircuitsSection = ({ initialCircuits }) => {
	const [activeSource, setActiveSource] = useState("exoticca");
	const source = SOURCES.find((s) => s.id === activeSource);

	return (
		<section
			id="circuits"
			className="py-20 px-6 bg-charcoal"
		>
			<div className="max-w-7xl mx-auto">
				<SectionHeader
					dark
					eyebrow="Nos circuits terrestres"
					title="Circuits d'Exception"
					description={
						<>
							Tarifs à{" "}
							<b>
								<u>titre indicatif seulement</u>
							</b>
							, par personne en occupation double, taxes incluses. Option solo disponible sur certains circuits. Sauf mention contraire, les vols sont inclus.
						</>
					}
				/>

				<div className="flex flex-wrap justify-center gap-2 mb-12 p-1.5 bg-white/5 border border-white/10 rounded-full w-fit mx-auto">
					{SOURCES.map((s) => {
						const Icon = s.icon;
						return (
							<button
								key={s.id}
								onClick={() => setActiveSource(s.id)}
								className={`flex items-center gap-2 px-5 py-2.5 text-sm tracking-[0.08em] uppercase font-medium transition-all duration-300 rounded-full ${
									activeSource === s.id
										? "bg-gold text-white shadow-[0_4px_16px_rgba(184,147,92,0.35)]"
										: "cursor-pointer bg-transparent text-white/70 hover:text-white"
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
					initialData={activeSource === "exoticca" ? initialCircuits : undefined}
				/>
			</div>
		</section>
	);
};

export default CircuitsSection;
