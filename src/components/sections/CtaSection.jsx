import { Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const CtaSection = () => {
	return (
		<section className="py-24 px-6 bg-gradient-to-br from-charcoal to-dark text-white">
			<div className="max-w-4xl mx-auto text-center">
				<h2 className="font-serif text-4xl lg:text-5xl font-semibold mb-6">Prêt à Vivre l'Extraordinaire ?</h2>
				<p className="text-lg lg:text-xl font-light leading-relaxed mb-12 opacity-90">
					Contactez nos conseillers voyage pour créer ensemble le voyage de vos rêves. Une consultation personnalisée et sans engagement vous attend.
				</p>

				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
					<Button
						size="lg"
						className="bg-gold hover:bg-white hover:text-charcoal text-white"
					>
						<Phone className="size-[18px] me-2" />
						Nous Appeler
					</Button>
					<Button
						size="lg"
						variant="outline"
						className="border-white text-white hover:bg-white hover:text-charcoal"
					>
						<Mail className="size-[18px] me-2" />
						Nous Écrire
					</Button>
				</div>

				<Card className="max-w-md mx-auto bg-white/10 border-white/20">
					<CardHeader>
						<CardTitle className="text-white text-center">Newsletter</CardTitle>
						<CardDescription className="text-white/80 text-center">Recevez nos offres exclusives</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex gap-2">
							<Input
								type="email"
								placeholder="Votre email"
								className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
							/>
							<Button className="bg-gold hover:bg-gold/90">S'abonner</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	);
};

export default CtaSection;
