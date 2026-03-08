import { Mail, Phone, MapPin, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import logoLight from "@/assets/images/aeria-logo-light.svg";
import { socialLinks } from "@/lib/data";
import acta from "@/assets/images/partner-logo/acta-light.svg"
import aavq from "@/assets/images/partner-logo/aavq-light.svg"
import clia from "@/assets/images/partner-logo/clia-light.svg"
import ensemble from "@/assets/images/partner-logo/ensemble-logo-light.svg"
import iataTids from "@/assets/images/partner-logo/iata-tids-light.svg"
import opc from "@/assets/images/partner-logo/opc-light.svg"
import { FaFacebook, FaFacebookMessenger, FaTiktok, FaYoutube, FaXTwitter  } from "react-icons/fa6";
import { AiFillInstagram } from "react-icons/ai";

// Mapping des icônes
const iconMap = {
	facebook: FaFacebook,
	instagram: AiFillInstagram,
	youtube: FaYoutube,
	messenger: FaFacebookMessenger,
	tiktok: FaTiktok,
	x: FaXTwitter
};



const Footer = () => {
	return (
		<footer className="bg-dark text-white py-16 px-6">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12 mb-12">
					{/* Brand */}
					<div className="flex flex-col items-center md:items-start">
						<img
							src={logoLight}
							alt="ÆRIA Voyages"
							className="h-10 w-auto mb-3"
						/>
						<p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-lg text-center md:text-left">
							Croisières, aventures et découvertes aux quatre coins du monde. Parce que les plus beaux voyages se mesurent en connexions humaines. Explorez,
							rêvez… laissez-vous porter vers de nouveaux horizons.
						</p>
						<div className="flex gap-4 mt-4 items-center md:items-start">
							{socialLinks.map((social) => {
								const Icon = iconMap[social.icon];
								return (
										<a
											href={social.href}
											target="_blank"
											rel="noopener noreferrer"
										aria-label={social.label}
										className="cursor-pointer group"
										>
											{Icon && <Icon className="size-[20px] text-white opacity-80 group-hover:opacity-100" />}
										</a>
								);
							})}
						</div>
					</div>

					{/* Contact */}
					<div>
						<h4 className="text-sm tracking-[0.2em] uppercase mb-2 font-semibold">Contact</h4>
						<ul className="space-y-3 text-sm text-muted-foreground">
							<li className="flex items-start gap-2">
								<MapPin className="size-4 mt-1 shrink-0" />
								<span>
									400 - 3 Place Ville-Marie
									<br />
									Montréal (Québec) H3B 2E3, Canada
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
							<li className="flex items-center gap-2">
								<IdCard className="size-4" />
								<span text-xs>
									Détenteur d'un Permis du Québec
									<br />
									#703666
								</span>
							</li>
						</ul>
					</div>
				</div>


				<div className="flex justify-between items-center gap-4 w-[90%] mx-auto">
					<img className="block h-16 lg:h-10 w-full opacity-70" src={opc} alt="OPC logo" />
					<img className="hidden lg:block h-10 w-full opacity-70" src={aavq} alt="AAVQ logo" />
					<img className="hidden lg:block h-8 w-full opacity-70 ml-4" src={ensemble} alt="Ensemble logo" />
					<img className="hidden lg:block h-10 w-full opacity-70" src={acta} alt="ACTA logo" />
					<img className="hidden lg:block h-10 w-full opacity-70" src={clia} alt="CLIA logo" />
					<img className="hidden lg:block h-10 w-full opacity-70" src={iataTids} alt="IATA logo | TIDS logo" />
				</div>

				<Separator className="opacity-10 mt-10" />

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
