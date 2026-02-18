import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const IntroSection = () => {
	return (
		<section className="py-24 lg:py-32 px-6">
			<div className="max-w-5xl mx-auto text-center">
				<Badge
					variant="outline"
					className="text-xs tracking-[0.4em] uppercase mb-6 border-gold text-gold"
				>
					ÆRIA Voyages
				</Badge>
				<h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold mb-8 leading-tight">L'Excellence au Service de Vos Rêves</h2>
				<Separator className="w-20 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-10" />
				<p className="text-lg lg:text-xl leading-relaxed text-muted-foreground font-light max-w-3xl mx-auto">
					Depuis plus de 15 ans, ÆRIA Voyages crée des expériences de voyage exceptionnelles pour une clientèle exigeante. Chaque destination, chaque moment est
					soigneusement orchestré pour dépasser vos attentes et créer des souvenirs impérissables.
				</p>
			</div>
		</section>
	);
};

export default IntroSection;
