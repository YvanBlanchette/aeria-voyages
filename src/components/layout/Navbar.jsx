import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/lib/data";
import logoDark from "@/assets/images/aeria-logo.svg"; // dark
import logoLight from "@/assets/images/aeria-logo-light.svg"; // light

const Navbar = () => {
	const [menuOpen, setMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 50);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<nav
			className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/98 backdrop-blur-lg shadow-lg py-4 text-charcoal" : "bg-transparent py-6 text-white"}`}
		>
			<div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
				{/* Logo */}
				{/* <div className="font-serif text-3xl lg:text-4xl font-semibold tracking-wide">
					<span className="text-gold">Æ</span>RIA
					<span className="text-sm font-light ms-3 tracking-[0.3em] uppercase hidden sm:inline">Voyages</span>
				</div> */}
				<div>
					<a href="/">
						<img
							src={scrolled ? logoDark : logoLight}
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
							target={link.target}
							rel={link.rel}
							className="nav-link text-sm tracking-[0.15em] pt-2 uppercase font-medium hover:text-gold"
						>
							{link.label}
						</a>
					))}
					<Button className="cursor-pointer bg-charcoal hover:bg-gold text-white text-sm tracking-[0.15em] uppercase font-medium">
						<a
							href="https://go.aeriavoyages.com/questionnaire-consultation"
							target="_blank"
							rel="noopener noreferrer"
						>
							Planifier un Voyage
						</a>
					</Button>
				</div>

				{/* Burger */}
				<button
					onClick={() => setMenuOpen(!menuOpen)}
					className="lg:hidden z-50 relative"
				>
					{menuOpen ? <X className="size-7" /> : <Menu className="size-7" />}
				</button>
			</div>

			{/* Mobile menu */}
			{menuOpen && (
				<div className="fixed inset-0 z-40 bg-white text-charcoal lg:hidden">
					<div className="flex flex-col items-center justify-center h-full gap-8">
						{navLinks.map((link) => (
							<a
								key={link.href}
								href={link.href}
								target={link.target}
								rel={link.rel}
								onClick={() => setMenuOpen(false)}
								className="font-serif text-3xl hover:text-gold transition-colors"
							>
								{link.label}
							</a>
						))}
						<Button className="bg-charcoal text-white text-sm tracking-[0.15em] uppercase font-medium mt-6">
							<a
								href="https://go.aeriavoyages.com/questionnaire-consultation"
								target="_blank"
								rel="noopener noreferrer"
							>
								Planifier un Voyage
							</a>
						</Button>
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
