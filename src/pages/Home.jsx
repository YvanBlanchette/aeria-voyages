import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import IntroSection from "@/components/sections/IntroSection";
import CircuitsSection from "@/components/sections/CircuitsSection";
import CroisieresSection from "@/components/sections/croisieres";
import QuoteSection from "@/components/sections/QuoteSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CtaSection from "@/components/sections/CtaSection";

const HomePage = () => {
	return (
		<>
			<Navbar />
			<main>
				<HeroSection />
				{/* <IntroSection /> */}
				<CroisieresSection />
				<CircuitsSection />
				{/* <QuoteSection /> */}
				{/* <TestimonialsSection /> */}
				<CtaSection />
			</main>
			<Footer />
		</>
	);
};

export default HomePage;
