import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { testimonials } from "@/lib/data";

const TestimonialsSection = () => {
	return (
		<section className="py-24 px-6 bg-charcoal">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-16">
					<Badge
						variant="outline"
						className="text-xs tracking-[0.4em] uppercase mb-4 border-gold text-gold"
					>
						Témoignages
					</Badge>
					<h2 className="font-serif text-4xl lg:text-5xl font-semibold">Ils Nous Font Confiance</h2>
					<Separator className="w-20 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-10" />
				</div>

				<div className="grid md:grid-cols-3 gap-8">
					{testimonials.map((testimonial, index) => (
						<Card
							key={index}
							className="bg-cream border-none"
						>
							<CardHeader>
								<div className="text-gold text-5xl opacity-40">"</div>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground leading-relaxed italic">{testimonial.text}</p>
							</CardContent>
							<CardFooter className="flex-col items-start border-t border-gold/30 pt-4">
								<p className="font-semibold text-charcoal">{testimonial.name}</p>
								<p className="text-sm text-muted-foreground">{testimonial.trip}</p>
							</CardFooter>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
};

export default TestimonialsSection;
