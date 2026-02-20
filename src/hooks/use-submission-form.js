import { useState } from "react";
import { validateStep } from "@/lib/submission-request/validation";
import { sendSubmissionEmail } from "@/lib/submission-request/email";

const initialForm = {
	prenom: "",
	nom: "",
	email: "",
	telephone: "",

	typeVoyage: "",
	dateDepart: "",
	dateRetour: "",
	datesFlexibles: false,
	adultes: 2,
	enfants: 0,
	agesEnfants: [],
	budget: "",

	// SECTION CROISIÈRE (Multi-sélection)
	typeCroisiere: [],
	typeCabine: [],
	dureeCroisiere: [],

	// SECTION TOUT-INCLUS
	categorieHotel: [],
	proximitePlage: [],
	styleResort: [],

	// SECTION CIRCUIT
	typeCircuit: [],
	rythmeCircuit: [],

	// SECTION SUR MESURE
	niveauConfort: [],
	villeDepart: "",

	destinations: "",
	experiences: [],
	requestsSpeciales: "",
	commentDecouvert: "",
};

export default function useSubmissionForm() {
	const [focused, setFocused] = useState(false);
	const [step, setStep] = useState(1);
	const [status, setStatus] = useState("idle");
	const [errors, setErrors] = useState({});
	const [form, setForm] = useState(initialForm);

	const setField = (key, val) => {
		setForm((f) => ({ ...f, [key]: val }));
		// Nettoie l'erreur dès que l'utilisateur modifie le champ
		if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
	};

	const validateCurrent = () => {
		const errs = validateStep(step, form);
		setErrors(errs);
		return Object.keys(errs).length === 0;
	};

	const next = () => {
		if (validateCurrent()) setStep((s) => Math.min(4, s + 1));
	};

	const prev = () => setStep((s) => Math.max(1, s - 1));

	const submit = async () => {
		if (!validateCurrent()) return;
		setStatus("loading");
		try {
			await sendSubmissionEmail(form);
			setStatus("success");
		} catch (error) {
			console.error("Erreur soumission:", error);
			setStatus("error");
		}
	};

	return { focused, setFocused, step, next, prev, status, submit, form, setField, errors };
}
