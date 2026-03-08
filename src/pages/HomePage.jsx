import HeroSection from "@/components/sections/HeroSection";
import CircuitsSection from "@/components/sections/land-tours";
import CroisieresSection from "@/components/sections/cruises";
import CtaSection from "@/components/sections/CtaSection";
import MainLayout from "@/layouts/MainLayout";
import AllInclusivesSection from "@/components/sections/all-inclusive";

const HomePage = () => {
	return (
		<MainLayout navbarVariant={"dynamic"}>
			<HeroSection />
			<CroisieresSection />
			<CircuitsSection />
			<AllInclusivesSection/>
			{/* <CtaSection /> */}
		</MainLayout>
	);
};

export default HomePage;
