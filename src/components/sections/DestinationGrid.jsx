import { ChevronRight, MapPin, Calendar, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

/**
 * Composant réutilisable pour afficher une grille de destinations
 * @param {string}   badge      - Label du badge (ex: "Nos Circuits")
 * @param {string}   title      - Titre de la section
 * @param {string}   btnLabel   - Label du bouton "Voir tout"
 * @param {array}    items      - Tableau de destinations (circuits ou croisières)
 * @param {string}   bg         - Classe de fond Tailwind (ex: "bg-white" ou "bg-cream")
 * @param {string}   id         - ID HTML pour l'ancre de navigation
 */
const DestinationGrid = ({ badge, title, btnLabel, items, bg = "bg-charcoal", id }) => {
	return (
		<section
			id={id}
			className={`py-20 px-6 ${bg}`}
		>
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-16">
					<Badge
						variant="outline"
						className="text-xs tracking-[0.4em] uppercase mb-4 border-gold text-gold"
					>
						{badge}
					</Badge>
					<h2 className="font-serif text-4xl lg:text-5xl font-semibold">{title}</h2>
					<Separator className="w-20 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-10" />
				</div>

				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
					{items.map((item, index) => (
						<Card
							key={index}
							className="destination-card group overflow-hidden border-none transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)]"
						>
							<div className="relative h-80 overflow-hidden">
								<img
									src={item.image}
									alt={item.title}
									className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
								/>
								<div className="destination-overlay" />

								{/* Rating */}
								<div className="absolute top-4 end-4 z-10">
									<Badge className="bg-white/95 text-charcoal hover:bg-white">
										<Star className="size-3 me-1 fill-gold text-gold" />
										{item.rating}
									</Badge>
								</div>

								{/* Info overlay */}
								<div className="absolute bottom-0 inset-x-0 p-6 z-10 text-white destination-info">
									<div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase mb-2 text-gold">
										<MapPin className="size-3.5" />
										{item.location}
									</div>
									<CardTitle className="font-serif text-3xl text-white mb-3">{item.title}</CardTitle>
									<div className="flex items-center justify-between text-sm mb-2">
										<span className="flex items-center gap-2">
											<Calendar className="size-4" />
											{item.duration}
										</span>
										<span className="text-xs opacity-75">{item.reviews} avis</span>
									</div>
									<Separator className="my-3 opacity-30" />
									<div className="flex items-center justify-between">
										<span className="font-semibold">{item.price}</span>
										<Button
											variant="ghost"
											size="sm"
											className="text-white hover:text-gold hover:bg-transparent p-0"
										>
											En savoir plus
											<ChevronRight className="size-4 ms-1 group-hover:translate-x-1 transition-transform" />
										</Button>
									</div>
								</div>
							</div>
						</Card>
					))}
				</div>

				<div className="text-center mt-16">
					<Button
						size="lg"
						className="bg-charcoal hover:bg-gold text-white text-sm tracking-[0.2em] uppercase font-semibold"
					>
						{btnLabel}
						<ChevronRight className="size-5 ms-2" />
					</Button>
				</div>
			</div>
		</section>
	);
};

export default DestinationGrid;
