import { MapPin, Calendar, Tag, ChevronRight } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function CircuitCard({ circuit, regionLabels }) {
	return (
		<Card className="destination-card group relative overflow-hidden border-none h-[450px] w-full bg-charcoal">
			{/* 1. L'IMAGE DE FOND (Remplit tout, sans bandes) */}
			<div className="absolute inset-0 z-0">
				<img
					src={circuit.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"}
					alt={circuit.titre}
					className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
				/>
				{/* 2. L'OVERLAY (Dégradé pour la lisibilité) */}
				<div className="destination-overlay absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-100" />
			</div>

			{/* 3. LE CONTENU (Par-dessus l'image) */}
			<div className="relative z-10 h-full p-6 flex flex-col justify-between text-white">
				{/* Haut de la carte */}
				<div className="flex justify-between items-start">
					<Badge className="bg-gold hover:bg-gold text-white border-none font-semibold">-{circuit.rabais}</Badge>
				</div>

				{/* Bas de la carte */}
				<div className="destination-info transition-transform duration-500">
					<div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase mb-2 text-gold">
						<MapPin className="size-3.5" />
						{circuit.destination}
					</div>

					<CardTitle className="font-serif text-2xl text-white mb-3 leading-tight">{circuit.titre}</CardTitle>

					<div className="flex items-center gap-4 text-sm mb-3 opacity-90">
						<span className="flex items-center gap-1.5">
							<Calendar className="size-4" />
							{circuit.jours} jours
						</span>
						<span className="flex items-center gap-1.5">
							<Tag className="size-4" />
							{regionLabels[circuit.region] ?? circuit.region}
						</span>
					</div>

					<Separator className="my-3 opacity-30 bg-white" />

					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs opacity-60 line-through">{circuit.prixRegulier?.toLocaleString("fr-CA")} $</p>
							<p className="text-xl font-bold text-gold">{circuit.prixPromo?.toLocaleString("fr-CA")} $</p>
						</div>

						<a
							href={circuit.lienAgent}
							target="_blank"
							rel="noopener noreferrer"
						>
							<Button
								variant="ghost"
								size="sm"
								className="text-white hover:text-gold hover:bg-white/10 p-0 h-auto"
							>
								Voir le circuit
								<ChevronRight className="size-4 ms-1 transition-transform group-hover:translate-x-1" />
							</Button>
						</a>
					</div>
				</div>
			</div>
		</Card>
	);
}
