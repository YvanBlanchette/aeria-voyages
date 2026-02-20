const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d\s\-+()]{10,}$/;

export function validateStep(step, form) {
	const errs = {};

	// ÉTAPE 1 : Informations personnelles
	if (step === 1) {
		if (!form.prenom?.trim()) errs.prenom = "Requis";
		if (!form.nom?.trim()) errs.nom = "Requis";
		if (!form.email || !emailRegex.test(form.email)) errs.email = "Format invalide";
		if (!form.telephone || !phoneRegex.test(form.telephone)) errs.telephone = "Format invalide";
	}

	// ÉTAPE 2 : Logistique de base
	if (step === 2) {
		if (!form.typeVoyage) errs.typeVoyage = "Veuillez choisir un type de voyage";
		if (!form.dateDepart) errs.dateDepart = "Requis";
		if (!form.budget) errs.budget = "Requis";

		// Validation des âges des enfants si enfants > 0
		if (Number(form.enfants) > 0) {
			const nbAgesRemplis = form.agesEnfants?.filter((age) => age !== "").length;
			if (nbAgesRemplis < Number(form.enfants)) {
				errs.agesEnfants = "Veuillez préciser l'âge de chaque enfant";
			}
		}
	}

	// ÉTAPE 3 : Détails spécifiques (Multi-sélections)
	if (step === 3) {
		// Validation CROISIÈRE
		if (form.typeVoyage === "croisiere") {
			if (!form.typeCroisiere || form.typeCroisiere.length === 0) errs.typeCroisiere = "Sélectionnez au moins un type";
			if (!form.typeCabine || form.typeCabine.length === 0) errs.typeCabine = "Sélectionnez au moins une cabine";
			if (!form.dureeCroisiere || form.dureeCroisiere.length === 0) errs.dureeCroisiere = "Sélectionnez au moins une durée";
		}

		// Validation TOUT-INCLUS
		if (form.typeVoyage === "tout-inclus") {
			if (!form.categorieHotel || form.categorieHotel.length === 0) errs.categorieHotel = "Sélectionnez au moins une catégorie";
			if (!form.styleResort || form.styleResort.length === 0) errs.styleResort = "Sélectionnez au moins un style";
			if (!form.proximitePlage || form.proximitePlage.length === 0) errs.proximitePlage = "Sélectionnez au moins une option";
		}

		// Validation CIRCUIT
		if (form.typeVoyage === "circuit") {
			if (!form.typeCircuit || form.typeCircuit.length === 0) errs.typeCircuit = "Sélectionnez au moins un style";
			if (!form.rythmeCircuit || form.rythmeCircuit.length === 0) errs.rythmeCircuit = "Sélectionnez au moins un rythme";
		}

		// Validation SUR MESURE
		if (form.typeVoyage === "sur-mesure") {
			if (!form.niveauConfort || form.niveauConfort.length === 0) errs.niveauConfort = "Sélectionnez au moins un niveau de confort";
		}

		// Toujours requis peu importe le voyage
		if (!form.villeDepart) errs.villeDepart = "Requis";
	}

	return errs;
}
