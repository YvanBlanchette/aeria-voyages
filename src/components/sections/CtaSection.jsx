import { useState } from "react";
import { Phone, Mail, Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import emailjs from "@emailjs/browser";
import icon from "@/assets/images/icon.svg";

const EMAILJS_SERVICE_ID = "service_u5ahpfh";
const EMAILJS_TEMPLATE_ID = "template_ezt63ms";
const EMAILJS_PUBLIC_KEY = "MXXt8SFDIKy19OMit";

const CtaSection = () => {
	const [nom, setNom] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [statut, setStatut] = useState(null); // "sending" | "success" | "error"

	async function handleEnvoyer() {
		if (!nom.trim() || !email.trim() || !message.trim()) return;
		setStatut("sending");
		try {
			await emailjs.send(
				EMAILJS_SERVICE_ID,
				EMAILJS_TEMPLATE_ID,
				{
					nom_client: nom,
					email_client: email,
					message,
					itineraire: "Demande générale",
					navire: "—",
					croisieriste: "—",
					periode: "—",
					nuits: "—",
					port: "—",
					prix: "—",
				},
				EMAILJS_PUBLIC_KEY,
			);
			setStatut("success");
		} catch {
			setStatut("error");
		}
	}

	return (
		<section
			id="cta"
			className="relative py-24 px-6 bg-[#F5F2EB] text-charcoal overflow-hidden"
		>
			<img
				src={icon}
				className="hidden lg:block absolute -top-[15%] left-[15%] w-auto h-[200vh] opacity-3 z-0"
			/>
			<div className="relative z-20 max-w-4xl mx-auto text-center">
				<h2 className="font-serif text-4xl lg:text-5xl font-semibold mb-6">Prêt à Vivre l'Extraordinaire ?</h2>
				<p className="text-lg lg:text-xl font-light leading-relaxed mb-12 opacity-90">
					Contactez nos conseillers voyage pour créer ensemble le voyage de vos rêves.
				</p>

				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
					<Button
						asChild
						size="lg"
						className="bg-gold border-gold hover:bg-white hover:border-white hover:text-charcoal text-white w-36"
					>
						<a href="tel:+14508209720">
							<Phone className="size-[18px] me-2" />
							Nous Appeler
						</a>
					</Button>
					<Button
						asChild
						size="lg"
						variant="outline"
						className="border-charcoal bg-charcoal text-white hover:bg-gold hover:border-gold hover:text-white w-36"
					>
						<a href="mailto:info@aeriavoyages.com">
							<Mail className="size-[18px] me-2" />
							Nous Écrire
						</a>
					</Button>
				</div>

				<Card className="max-w-lg mx-auto bg-white border-stone-200 shadow-md p-4 py-6">
					<CardHeader>
						<CardTitle className="text-charcoal tracking-wider text-center font-serif text-2xl">Envoyez-nous un message</CardTitle>
						<CardDescription className="text-stone-500 text-center">Nous vous répondrons dans les plus brefs délais.</CardDescription>
					</CardHeader>
					<CardContent>
						{statut === "success" ? (
							<div className="py-8 text-center space-y-3">
								<div className="size-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
									<CheckCircle className="size-7 text-green-600" />
								</div>
								<p className="font-semibold text-stone-800">Message envoyé !</p>
								<p className="text-sm text-stone-500">Nous vous contacterons très bientôt.</p>
								<button
									onClick={() => {
										setStatut(null);
										setNom("");
										setEmail("");
										setMessage("");
									}}
									className="text-sm text-gold font-medium mt-2"
								>
									Envoyer un autre message
								</button>
							</div>
						) : (
							<div className="space-y-3 text-left">
								<div>
									<label className="text-[10px] text-stone-400 tracking-[0.15em] uppercase mb-1.5 block">Votre nom *</label>
									<Input
										type="text"
										value={nom}
										onChange={(e) => setNom(e.target.value)}
										placeholder="Jean Tremblay"
										className="bg-stone-50 border-stone-200 text-stone-800 placeholder:text-stone-300"
									/>
								</div>
								<div>
									<label className="text-[10px] text-stone-400 tracking-[0.15em] uppercase mb-1.5 block">Votre courriel *</label>
									<Input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="jean@exemple.com"
										className="bg-stone-50 border-stone-200 text-stone-800 placeholder:text-stone-300"
									/>
								</div>
								<div>
									<label className="text-[10px] text-stone-400 tracking-[0.15em] uppercase mb-1.5 block">Votre message *</label>
									<textarea
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										placeholder="Parlez-nous de votre projet de voyage..."
										rows={4}
										className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none"
									/>
								</div>

								{statut === "error" && <p className="text-xs text-red-500 text-center">Une erreur est survenue. Veuillez réessayer.</p>}

								<Button
									onClick={handleEnvoyer}
									disabled={!nom.trim() || !email.trim() || !message.trim() || statut === "sending"}
									className="w-full bg-gold hover:bg-gold/90 text-white disabled:opacity-50"
								>
									{statut === "sending" ? <Loader2 className="size-4 animate-spin me-2" /> : <Send className="size-4 me-2" />}
									{statut === "sending" ? "Envoi en cours..." : "Envoyer le message"}
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</section>
	);
};

export default CtaSection;
