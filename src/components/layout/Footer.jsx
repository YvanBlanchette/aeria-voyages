import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import logoLight from "@/assets/images/aeria-logo-light.svg";

const Footer = () => {
	return (
		<footer className="bg-dark text-white py-16 px-6">
			<div className="max-w-7xl mx-auto">
				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
					{/* Brand */}
					<div>
						<img
							src={logoLight}
							alt="ÆRIA Voyages"
							className="h-10 w-auto mb-3"
						/>
						<p className="text-sm text-muted-foreground leading-relaxed mb-4">
							Votre partenaire de voyage de luxe pour des expériences inoubliables à travers le monde.
						</p>
						<div className="flex gap-4 mt-6">
							{[Instagram, Facebook, Mail].map((Icon, i) => (
								<Button
									key={i}
									variant="outline"
									size="icon"
									className="border-white/20 hover:border-gold text-gold hover:bg-gold hover:text-charcoal"
								>
									<Icon className="size-[18px]" />
								</Button>
							))}
						</div>
					</div>

					{/* Destinations */}
					<div>
						<h4 className="text-sm tracking-[0.2em] uppercase mb-6 font-semibold">Destinations</h4>
						<ul className="space-y-3 text-sm text-muted-foreground">
							{["Europe", "Asie", "Afrique", "Amériques", "Océanie"].map((item) => (
								<li key={item}>
									<a
										href="#"
										className="hover:text-gold transition-colors"
									>
										{item}
									</a>
								</li>
							))}
						</ul>
					</div>

					{/* Services */}
					<div>
						<h4 className="text-sm tracking-[0.2em] uppercase mb-6 font-semibold">Services</h4>
						<ul className="space-y-3 text-sm text-muted-foreground">
							{["Voyages Sur Mesure", "Lunes de Miel", "Voyages en Groupe", "Conciergerie", "Vols Privés"].map((item) => (
								<li key={item}>
									<a
										href="#"
										className="hover:text-gold transition-colors"
									>
										{item}
									</a>
								</li>
							))}
						</ul>
					</div>

					{/* Contact */}
					<div>
						<h4 className="text-sm tracking-[0.2em] uppercase mb-6 font-semibold">Contact</h4>
						<ul className="space-y-3 text-sm text-muted-foreground">
							<li className="flex items-start gap-2">
								<MapPin className="size-4 mt-1 shrink-0" />
								<span>
									1385 chemin Val des Lacs
									<br />
									Sainte-Sophie, QC J5J 2S8
								</span>
							</li>
							<li className="flex items-center gap-2">
								<Phone className="size-4" />
								<a
									href="tel:+15141234567"
									className="hover:text-gold transition-colors"
								>
									+1 (450) 820-9720
								</a>
							</li>
							<li className="flex items-center gap-2">
								<Mail className="size-4" />
								<a
									href="mailto:contact@aeriavoyages.com"
									className="hover:text-gold transition-colors"
								>
									contact@aeriavoyages.com
								</a>
							</li>
						</ul>
					</div>
				</div>

				<Separator className="opacity-10" />

				<div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
					<p>© {new Date().getFullYear()} ÆRIA Voyages. Tous droits réservés.</p>
					<div className="flex gap-6">
						{["Mentions Légales", "Confidentialité", "CGV"].map((item) => (
							<a
								key={item}
								href="#"
								className="hover:text-gold transition-colors"
							>
								{item}
							</a>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
