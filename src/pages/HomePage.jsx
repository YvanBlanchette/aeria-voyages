import HeroSection from "@/components/sections/HeroSection";
import CircuitsSection from "@/components/sections/CircuitsSection";
import CroisieresSection from "@/components/sections/croisieres";
import CtaSection from "@/components/sections/CtaSection";
import MainLayout from "@/layouts/MainLayout";

const HomePage = () => {
	return (
		<MainLayout navbarVariant={"dynamic"}>
			<HeroSection />
			<CroisieresSection />
			<CircuitsSection />
			<CtaSection />
		</MainLayout>
	);
};

export default HomePage;
