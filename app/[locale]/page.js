import HeroSection from "@/components/sections/HeroSection";
import CircuitsSection from "@/components/sections/land-tours";
import CroisieresSection from "@/components/sections/cruises";
import MainLayout from "@/components/layout/MainLayout";
import AllInclusivesSection from "@/components/sections/all-inclusive";
import TransfersSection from "@/components/sections/transfers";
import ESimSection from "@/components/sections/esim";

export default function HomePage() {
	return (
		<MainLayout navbarVariant={"dynamic"}>
			<HeroSection />
			<CroisieresSection />
			<TransfersSection />
			<CircuitsSection />
			<ESimSection />
			<AllInclusivesSection />
		</MainLayout>
	);
}
