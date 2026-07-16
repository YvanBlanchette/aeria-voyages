import HeroSection from "@/components/sections/HeroSection";
import CircuitsSection from "@/components/sections/land-tours";
import CroisieresSection from "@/components/sections/cruises";
import CtaSection from "@/components/sections/CtaSection";
import MainLayout from "@/layouts/MainLayout";
import AllInclusivesSection from "@/components/sections/all-inclusive";
import TransfersSection from "@/components/sections/transfers";
import FlightsSection from "@/components/sections/flights";
import ESimSection from "@/components/sections/esim";

const HomePage = () => {
	return (
		<MainLayout navbarVariant={"dynamic"}>
			<HeroSection />
			<CroisieresSection />
			<TransfersSection />
			<CircuitsSection />
			<ESimSection />
			{/* <FlightsSection /> */}
			<AllInclusivesSection />
			{/* <CtaSection /> */}
		</MainLayout>
	);
};

export default HomePage;
