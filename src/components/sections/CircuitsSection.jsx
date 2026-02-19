import { useState, useEffect } from "react";
import { ChevronRight, MapPin, Calendar, Tag, ChevronDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

const regionLabels = {
	africa: "Afrique",
	america: "Amériques",
	asia: "Asie",
	europe: "Europe",
	oceania: "Océanie",
};

const VISIBLE_COUNT = 6;

const CircuitsSection = () => {
	const [circuitsData, setCircuitsData] = useState([]);
	const [chargement, setChargement] = useState(true);
	const [activeRegion, setActiveRegion] = useState("all");
	const [showAll, setShowAll] = useState(false);

	useEffect(() => {
		fetch("/api/circuits/exoticca")
    .then(r => r.json())
    .then(data => setCircuitsData(data))
    .finally(() => setChargement(false));
	}, []);

	const regions = ["all", ...new Set(circuitsData.map((c) => c.region))];
	const filtered = activeRegion === "all" ? circuitsData : circuitsData.filter((c) => c.region === activeRegion);
	const visible = showAll ? filtered : filtered.slice(0, VISIBLE_COUNT);

	const handleRegion = (region) => {
		setActiveRegion(region);
		setShowAll(false);
	};

	return (
		<section
			id="circuits"
			className="py-20 px-6 bg-charcoal"
		>
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="text-center mb-12">
					<Badge
						variant="outline"
						className="text-xs tracking-[0.4em] uppercase mb-4 border-gold text-gold rounded-none px-3 py-1"
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

				{chargement ? (
					<div className="text-center py-24 flex flex-col items-center gap-3">
						<Loader2 className="size-8 animate-spin text-stone-500" />
						<p className="text-stone-400 text-sm">Chargement des circuits...</p>
					</div>
				) : (
					<>
						{/* Filtres par région */}
						<div className="flex flex-wrap justify-center gap-3 mb-12">
							{regions.map((region) => (
								<button
									key={region}
									onClick={() => handleRegion(region)}
									className={`px-5 py-2 text-sm tracking-[0.1em] uppercase font-medium transition-all duration-300 rounded-md border ${
										activeRegion === region
											? "bg-gold text-white border-gold"
											: "cursor-pointer bg-transparent text-white border-white/80 hover:border-gold hover:text-gold"
									}`}
								>
									{region === "all" ? "Toutes" : (regionLabels[region] ?? region)}
								</button>
							))}
						</div>

						{/* Grille */}
						<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
							{visible.map((circuit) => (
								<a
									key={circuit.id}
									href={circuit.lienAgent}
									target="_blank"
									rel="noopener noreferrer"
									className="destination-card group block overflow-hidden transition-all duration-700 hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)]"
								>
									<Card className="overflow-hidden border-none h-full rounded-md aspect-square">
										<div className="relative overflow-hidden min-h-84 h-full w-auto">
											<img
												src={circuit.image}
												alt={circuit.titre}
												className="absolute inset-0 size-full object-cover transition-transform duration-700"
											/>
											<div className="destination-overlay" />
											<div className="absolute top-4 start-4 z-10">
												<Badge className="bg-gold text-white font-medium text-base px-3">{circuit.rabais} rabais</Badge>
											</div>
											<div className="absolute bottom-0 inset-x-0 p-6 z-10 text-white destination-info">
												<div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase mb-2 text-white">
													<MapPin className="size-3.5" />
													{circuit.destination}
												</div>
												<CardTitle className="font-serif text-2xl text-white mb-3 leading-tight">{circuit.titre}</CardTitle>
												<div className="flex items-center gap-4 text-sm mb-3">
													<span className="flex items-center gap-1.5">
														<Calendar className="size-4" />
														{circuit.jours} jours
													</span>
													<span className="flex items-center gap-1.5">
														<Tag className="size-4" />
														{regionLabels[circuit.region] ?? circuit.region}
													</span>
												</div>
												<Separator className="my-3 opacity-30" />
												<div className="flex items-center justify-between">
													<div>
														<p className="text-sm opacity-60 line-through">{circuit.prixRegulier.toLocaleString("fr-CA")} $</p>
														<p className="text-xl font-bold text-white">{circuit.prixPromo.toLocaleString("fr-CA")} $</p>
													</div>
													<Button
														variant="ghost"
														size="sm"
														className="text-white hover:text-gold hover:bg-transparent p-0"
													>
														Voir le circuit
														<ChevronRight className="size-4 ms-1 group-hover:translate-x-1 transition-transform" />
													</Button>
												</div>
											</div>
										</div>
									</Card>
								</a>
							))}
						</div>

						{/* Voir plus / moins */}
						{filtered.length > VISIBLE_COUNT && (
							<div className="text-center mt-12">
								<Button
									size="lg"
									variant="outline"
									onClick={() => setShowAll(!showAll)}
									className="cursor-pointer border-gold text-charcoal hover:bg-gold hover:text-white text-sm tracking-[0.15em] uppercase font-medium"
								>
									{showAll ? `Afficher moins` : `Afficher les ${filtered.length - VISIBLE_COUNT} autres circuits`}
									<ChevronDown className={`size-5 ms-2 transition-transform ${showAll ? "rotate-180" : ""}`} />
								</Button>
							</div>
						)}
					</>
				)}
			</div>
		</section>
	);
};

export default CircuitsSection;
