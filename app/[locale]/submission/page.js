import SubmissionWizard from "./SubmissionWizard";

export function generateMetadata() {
	return {
		title: "Planifier un voyage | ÆRIA Voyages",
		description: "Partagez vos envies de voyage et recevez une proposition personnalisée de votre conseiller ÆRIA Voyages — croisières, circuits et forfaits sur mesure.",
		openGraph: {
			title: "Planifier un voyage | ÆRIA Voyages",
			description: "Partagez vos envies de voyage et recevez une proposition personnalisée de votre conseiller ÆRIA Voyages.",
		},
	};
}

export default function SubmissionRequestPage() {
	return <SubmissionWizard />;
}
