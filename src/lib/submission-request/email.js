import emailjs from "@emailjs/browser";
import { TYPES_VOYAGE, BUDGETS, TYPES_CROISIERE, TYPES_CABINE, CATEGORIES_HOTEL } from "@/lib/data";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = "template_h1057ap";
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Fonction utilitaire pour gérer les labels (Simple ou Tableau)
function labelFrom(list, value) {
	if (Array.isArray(value)) {
		return value.map((v) => list.find((x) => x.value === v)?.label || v).join(", ");
	}
	return list.find((x) => x.value === value)?.label || value;
}

export function buildTemplateParams(form) {
	return {
		// Infos Client
		prenom: form.prenom,
		nom: form.nom,
		email: form.email,
		telephone: form.telephone,

		// Logistique
		type_voyage: labelFrom(TYPES_VOYAGE, form.typeVoyage),
		date_depart: form.dateDepart,
		date_retour: form.dateRetour || "Non précisée",
		dates_flexibles: form.datesFlexibles ? "Oui" : "Non",
		adultes: form.adultes,
		enfants: form.enfants,
		// On joint les âges des enfants (ex: "4, 8 ans")
		ages_enfants: Array.isArray(form.agesEnfants) ? form.agesEnfants.join(", ") : form.agesEnfants || "N/A",
		budget: labelFrom(BUDGETS, form.budget),

		// Détails Spécifiques (Multi-Select gérés par labelFrom)
		type_croisiere: labelFrom(TYPES_CROISIERE, form.typeCroisiere) || "N/A",
		type_cabine: labelFrom(TYPES_CABINE, form.typeCabine) || "N/A",
		categorie_hotel: labelFrom(CATEGORIES_HOTEL, form.categorieHotel) || "N/A",
		proximite_plage: form.proximitePlage && Array.isArray(form.proximitePlage) ? form.proximitePlage.join(", ") : form.proximitePlage || "N/A",
		style_resort: Array.isArray(form.styleResort) ? form.styleResort.join(", ") : form.styleResort || "N/A",

		// Destinations et Extras
		destinations: form.destinations || "Non précisées",
		ville_depart: form.villeDepart || "Non précisée",
		experiences: (form.experiences || []).join(", ") || "Non précisées",
		requests_speciales: form.requestsSpeciales || "Aucune",
		comment_decouvert: form.commentDecouvert || "Non précisé",
	};
}

export async function sendSubmissionEmail(form) {
	const params = buildTemplateParams(form);
	return emailjs.send(SERVICE_ID, TEMPLATE_ID, params, PUBLIC_KEY);
}
