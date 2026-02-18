import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import heroVideo from "@/assets/videos/hero.webm";

const HeroSection = () => {
	return (
		<div className="relative h-screen overflow-hidden">
			<video
				className="hero-video"
				src={heroVideo}
				autoPlay
				muted
				loop
				playsInline
			/>

			<div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-10" />

			<div className="absolute inset-0 z-20 flex items-center justify-center text-white px-6">
				<div className="max-w-5xl text-center">
					<Badge
						variant="outline"
						className="text-xs tracking-[0.4em] uppercase mb-6 fade-in delay-200 border-gold text-white bg-transparent"
					>
						L'Art du Voyage d'Exception
					</Badge>
					<h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 fade-in delay-400 leading-tight">Voyages à Votre Image</h1>
					<Separator className="w-20 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-10 fade-in delay-600" />
					<p className="text-lg sm:text-xl md:text-2xl font-light leading-relaxed mb-12 fade-in delay-800 max-w-3xl mx-auto">
						Des expériences de voyage exceptionnelles conçues pour les voyageurs qui veulent vivre l'extraordinaire.
					</p>
					<Button
						size="lg"
						className="bg-gold hover:bg-white hover:text-charcoal text-white text-sm tracking-[0.2em] uppercase font-semibold fade-in delay-800"
					>
						Découvrir Nos Voyages
					</Button>
				</div>
			</div>

			<div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 hidden md:flex flex-col items-center gap-2 text-white/70 animate-bounce">
				<span className="text-xs tracking-[0.2em] uppercase">Découvrir</span>
				<ChevronRight className="rotate-90 size-5" />
			</div>
		</div>
	);
};

export default HeroSection;
