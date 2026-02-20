import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/lib/data";
import logoDark from "@/assets/images/aeria-logo.svg";
import logoLight from "@/assets/images/aeria-logo-light.svg";

// On ajoute la prop 'variant'. Par défaut, on peut mettre 'dynamic'
const Navbar = ({ variant = "dynamic" }) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		// Si la variant est "white", on ne s'embête pas avec le scroll
		if (variant !== "dynamic") return;

		const handleScroll = () => setScrolled(window.scrollY > 50);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [variant]);

	// Logique pour déterminer l'apparence
	// Si variant === "white", on force l'état "scrolled" visuellement
	const isWhite = variant === "white" || scrolled;

	return (
		<nav
			className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
				isWhite ? "bg-white/98 backdrop-blur-lg shadow-lg py-4 text-charcoal" : "bg-transparent py-6 text-white"
			}`}
		>
			<div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
				<div>
					<a href="/">
						<img
							src={isWhite ? logoDark : logoLight}
							alt="ÆRIA Voyages"
							className="h-9 w-auto"
						/>
					</a>
				</div>

				{/* Desktop links */}
				<div className="hidden lg:flex items-center gap-10 xl:gap-12">
					{navLinks.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className="nav-link text-sm tracking-[0.15em] pt-2 uppercase font-medium hover:text-gold"
						>
							{link.label}
						</a>
					))}
					<Button className="cursor-pointer bg-charcoal hover:bg-gold text-white text-sm tracking-[0.15em] uppercase font-medium">
						<a href="/submission">Planifier un Voyage</a>
					</Button>
				</div>

				{/* Burger - Ajout d'une couleur dynamique pour le bouton menu */}
				<button
					onClick={() => setMenuOpen(!menuOpen)}
					className={`lg:hidden z-50 relative ${isWhite ? "text-charcoal" : "text-white"}`}
				>
					{menuOpen ? <X className="size-7" /> : <Menu className="size-7" />}
				</button>
			</div>

			{/* Mobile menu (reste en blanc) */}
			{menuOpen && (
				<div className="fixed inset-0 z-40 bg-white text-charcoal lg:hidden">
					<div className="flex flex-col items-center justify-center h-full gap-8">
						{navLinks.map((link) => (
							<a
								key={link.href}
								href={link.href}
								onClick={() => setMenuOpen(false)}
								className="font-serif text-3xl hover:text-gold transition-colors"
							>
								{link.label}
							</a>
						))}
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
