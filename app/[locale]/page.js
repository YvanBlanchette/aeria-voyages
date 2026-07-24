import HeroSection from "@/components/sections/HeroSection";
import CircuitsSection from "@/components/sections/land-tours";
import CroisieresSection from "@/components/sections/cruises";
import MainLayout from "@/components/layout/MainLayout";
import AllInclusivesSection from "@/components/sections/all-inclusive";
import TransfersSection from "@/components/sections/transfers";
import ESimSection from "@/components/sections/esim";
import { getCroisieresPage, getCroisieresMeta } from "@/lib/data/croisieres";
import { ITEMS_PAR_PAGE } from "@/lib/constants/cruises-config";
import { getExoticcaCircuits } from "@/lib/data/circuits";
import { searchAllInclusive, getStaticData } from "@/lib/data/all-inclusive";

export function generateMetadata() {
	return {
		title: "ÆRIA Voyages | Croisières, circuits et forfaits tout inclus",
		description: "Agence de voyages spécialisée en croisières, circuits terrestres et forfaits tout inclus. Voyages sur mesure conçus par votre conseiller ÆRIA Voyages.",
		openGraph: {
			title: "ÆRIA Voyages | Croisières, circuits et forfaits tout inclus",
			description: "Agence de voyages spécialisée en croisières, circuits terrestres et forfaits tout inclus. Voyages sur mesure conçus par votre conseiller ÆRIA Voyages.",
		},
	};
}

export default async function HomePage() {
	const [croisieresInitiales, croisieresMeta, circuitsInitiaux, allInclusiveInitial] = await Promise.all([
		getCroisieresPage({ tri: "date-asc", limit: ITEMS_PAR_PAGE, offset: 0 }),
		getCroisieresMeta(),
		getExoticcaCircuits(),
		searchAllInclusive().catch(() => null), // scrape live — ne doit jamais faire échouer le rendu de la page
	]);
	const allInclusiveStatic = getStaticData();

	return (
		<MainLayout navbarVariant={"dynamic"}>
			<HeroSection />
			<CroisieresSection
				initialData={croisieresInitiales}
				initialMeta={croisieresMeta}
			/>
			<TransfersSection />
			<CircuitsSection initialCircuits={circuitsInitiaux} />
			<ESimSection />
			<AllInclusivesSection
				initialSearch={allInclusiveInitial}
				initialStatic={allInclusiveStatic}
			/>
		</MainLayout>
	);
}
