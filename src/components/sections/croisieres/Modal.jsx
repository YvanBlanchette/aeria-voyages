import { useEffect, useState } from "react";
import { X, Ship, MessageCircle, Mail, Send, Loader2, ShipIcon, MapPin, Calendar, Building2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import emailjs from "@emailjs/browser";
import { getPorts, fmtPeriode, buildMessengerUrl, getPrixMin } from "./constants";
import CarteItineraire from "@/components/CarteItinéraire";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export default function Modal({ c, onClose }) {
	const ports = getPorts(c);
	const msgUrl = buildMessengerUrl(c);

	const [showForm, setShowForm] = useState(false);
	const [nom, setNom] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [statut, setStatut] = useState(null); // "sending" | "success" | "error"

	useEffect(() => {
		const fn = (e) => e.key === "Escape" && (showForm ? setShowForm(false) : onClose());
		document.addEventListener("keydown", fn);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", fn);
			document.body.style.overflow = "";
		};
	}, [onClose, showForm]);

	async function handleEnvoyer() {
		if (!nom.trim() || !email.trim()) return;
		setStatut("sending");
		try {
			await emailjs.send(
				EMAILJS_SERVICE_ID,
				EMAILJS_TEMPLATE_ID,
				{
					nom_client: nom,
					email_client: email,
					message: message || "Aucun message supplémentaire.",
					itineraire: c["Itinéraire"],
					navire: c["Navire"],
					croisieriste: c["Croisiériste"],
					periode: fmtPeriode(c["Date Départ"], c["Date Retour"]),
					nuits: c["Nuits"],
					port: c["Port Départ"],
					prix: getPrixMin(c).toLocaleString("fr-CA"),
				},
				EMAILJS_PUBLIC_KEY,
			);
			setStatut("success");
		} catch {
			setStatut("error");
		}
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#E6DBC1]/50 backdrop-blur-sm"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<div className="relative w-full sm:max-w-xl bg-white overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 rounded-sm">
				{!showForm ? (
					<>
						{/* ───── VUE DÉTAIL (inchangée) ─────*/}
						<div className="relative h-60 overflow-hidden bg-stone-200">
							<CarteItineraire
								ports={c["Ports"]}
								height="240px"
							/>
							<div
								className="absolute inset-0"
								style={{
									background: "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.08) 15%, transparent 100%)",
								}}
							/>

							<button
								onClick={onClose}
								className="z-50 cursor-pointer absolute top-4 right-3 size-8 rounded-sm  hover:bg-white/20 flex items-center justify-center text-white transition-colors"
							>
								<X className="size-5" />
							</button>
							{/* <div className="absolute top-0 inset-x-0 p-5">
								<h2 className="font-serif tracking-wide text-2xl text-white font-semibold leading-tight">{c["Itinéraire"]}</h2>
							</div> */}
						</div>

						<div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
							<div className="flex flex-col sm:flex-row justify-between gap-4">
								<div className="flex-1">
									<p className="text-[10px] text-stone-400 tracking-[0.15em] uppercase mb-1.5">Détails de la Croisière</p>
									<div className=" flex flex-col ml-2 gap-0.5">
										{/* DATES */}
										<p className="flex items-center gap-2 text-sm text-stone-500 ">
											<Calendar className="size-3.5 shrink-0 mb-1 text-stone-400" />
											<span>{fmtPeriode(c["Date Départ"], c["Date Retour"])}</span>
										</p>

										{/* Croisiériste */}
										<p className="flex items-center gap-2 text-sm text-stone-500">
											<Building2 className="size-3.5 mb-1 shrink-0" />
											{c["Croisiériste"]}
										</p>

										{/* NAVIRE */}
										<p className="flex items-center gap-2 text-sm text-stone-500">
											<ShipIcon className="size-3.5 mb-1 shrink-0" />
											{c["Navire"]}
										</p>
										{/* PORT DE DÉPART */}
										{c["Port Départ"] && c["Port Départ"] !== "N/A" && (
											<p className="flex items-center gap-2 text-sm text-stone-500">
												<MapPin className="size-3.5 mb-0.5 shrink-0" />
												<span>{c["Port Départ"]}</span>
											</p>
										)}
									</div>
								</div>

								{/* BOUTONS CTA */}
								<div className="flex flex-col gap-2">
									{/* MESSENGER */}
									<a
										href={msgUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="rounded-sm flex w-full items-center justify-center gap-2.5 py-3.5 px-6 font-semibold text-sm text-white bg-[#0070da] hover:bg-[#0084ff] transition-colors duration-200"
									>
										<MessageCircle className="size-5" />
										Demande via Messenger
									</a>

									{/* DEMANDE D'INFORMATION */}
									<button
										onClick={() => setShowForm(true)}
										className="rounded-sm cursor-pointer flex w-full items-center justify-center gap-2.5 py-3.5 px-6 font-semibold text-sm text-white bg-charcoal hover:bg-gold transition-colors duration-200"
									>
										<Mail className="size-5" />
										Demande d'informations
									</button>
								</div>
							</div>

							<Separator />

							{c["Image Navire"] && (
								<div className="flex items-center gap-3 ">
									<img
										src={c["Image Navire"]}
										alt={c["Navire"]}
										className="h-14 w-24 object-cover rounded-sm"
										onError={(e) => {
											e.target.parentElement.style.display = "none";
										}}
									/>
									<div className="flex-1">
										<p className="text-[10px] text-stone-400 tracking-[0.1em] uppercase">Navire</p>
										<p className="font-semibold text-stone-800 text-sm">{c["Navire"]}</p>
										<p className="text-xs text-stone-500">{c["Croisiériste"]}</p>
									</div>

									{/* BOUTON SEG */}
									{c["LienSEG"] && (
										<a
											href={c["LienSEG"]}
											target="_blank"
											rel="noopener noreferrer"
											className="cursor-pointer shrink-0 flex flex-col items-center gap-1 text-gold hover:text-[#9a7a4a] transition-colors duration-200 group pr-10"
										>
											<MapPin className="size-6 animate-bounce group-hover:scale-105 transition-all duration-400" />
											<span className="text-[12px] font-semibold tracking-wide uppercase whitespace-nowrap text-center leading-tight group-hover:scale-105 transition-all duration-400">
												Réservez vos <br />
												Excursions
											</span>
										</a>
									)}
								</div>
							)}

							<Separator />

							<div className="flex justify-between">
								{ports.length > 0 && (
									<div>
										<p className="text-[10px] text-stone-400 tracking-[0.15em] uppercase mb-1">Itinéraire de croisière</p>
										<div className="relative pl-1">
											<div className="absolute left-[10px] top-2 bottom-2 w-px bg-stone-200" />
											{ports.map((port, i) => {
												const isFirst = i === 0;
												const isLast = i === ports.length - 1;
												const isRetour = isLast && port === ports[0];
												const isTerminus = isFirst || (isLast && !isRetour);
												return (
													<div
														key={i}
														className="flex items-center gap-3 py-1.5 relative"
													>
														<div
															className={`size-[14px] rounded-full border-2 shrink-0 z-10 flex items-center justify-center ${isTerminus ? "bg-[#B8935C] border-[#B8935C]" : isRetour ? "bg-white border-[#B8935C]" : "bg-white border-stone-300"}`}
														>
															{isTerminus && <div className="size-1.5 rounded-full bg-white" />}
														</div>
														<span
															className={`text-sm leading-tight ${isTerminus ? "text-stone-900 font-semibold" : isRetour ? "text-[#B8935C] font-medium" : "text-stone-600"}`}
														>
															{port}
														</span>
													</div>
												);
											})}
										</div>
									</div>
								)}

								<div>
									<p className="text-[10px] text-stone-400 tracking-[0.15em] uppercase mb-1">Prix par personne</p>
									<div className="flex flex-col gap-3 flex-wrap">
										<ul>
											{[
												["Intérieure", c["Prix Int."]],
												["Extérieure", c["Prix Ext."]],
												["Balcon", c["Prix Balcon"]],
											]
												.filter(([, p]) => p > 0)
												.map(([label, p]) => (
													<li
														key={label}
														className="flex-1 min-w-[90px] py-0.5 px-3 flex justify-between items-center gap-2"
													>
														<span className="text-[14px] font-medium text-stone-400 mb-0.5">{label}:</span>
														<span className="font-semibold text-stone-900 text-sm">{p.toLocaleString("fr-CA")} $</span>
													</li>
												))}
										</ul>
									</div>
									<p className="text-[10px] font-medium text-stone-400 mb-0.5">*Basé sur une occupation double.</p>
								</div>
							</div>
						</div>
					</>
				) : (
					<>
						{/* ───── VUE FORMULAIRE ─────*/}
						<div className="relative h-24 overflow-hidden bg-stone-800 flex items-end">
							<div className="absolute inset-0 bg-gradient-to-r from-charcoal to-charcoal/50" />
							<button
								onClick={onClose}
								className="cursor-pointer  absolute top-3 right-3 size-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
							>
								<X className="size-4" />
							</button>
							<div className="relative p-5">
								<p className="text-white/60 text-xs mb-0.5">Demande d'information</p>
								<h2 className="font-serif text-lg text-white font-semibold leading-tight">{c["Itinéraire"]}</h2>
							</div>
						</div>

						<div className="p-5 space-y-4">
							{statut === "success" ? (
								<div className="py-10 text-center space-y-3">
									<div className="size-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
										<Send className="size-6 text-green-600" />
									</div>
									<p className="font-semibold text-stone-800">Demande envoyée !</p>
									<p className="text-sm text-stone-500">Nous vous répondrons dans les plus brefs délais.</p>
									<button
										onClick={onClose}
										className="cursor-pointer mt-4 text-sm text-gold hover:text-charcoal/50 font-medium transition-all duration-300"
									>
										Fermer
									</button>
								</div>
							) : (
								<>
									<div className="bg-stone-200 p-3 flex items-center gap-3">
										<Ship className="size-4 text-stone-500 shrink-0" />
										<p className="text-sm text-stone-700">
											{c["Navire"]} · {c["Croisiériste"]} · {c["Nuits"]} nuits
										</p>
									</div>

									<div className="space-y-3">
										<div>
											<label className="text-[10px] text-stone-400 tracking-[0.15em] uppercase mb-1.5 block">Votre nom*</label>
											<input
												type="text"
												value={nom}
												onChange={(e) => setNom(e.target.value)}
												placeholder="Jean Tremblay"
												className="w-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
											/>
										</div>
										<div>
											<label className="text-[10px] text-stone-400 tracking-[0.15em] uppercase mb-1.5 block">Votre courriel*</label>
											<input
												type="email"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												placeholder="jean@exemple.com"
												className="w-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
											/>
										</div>
										<div>
											<label className="text-[10px] text-stone-400 tracking-[0.15em] uppercase mb-1.5 block">Message (optionnel)</label>
											<textarea
												value={message}
												onChange={(e) => setMessage(e.target.value)}
												placeholder="Questions, nombre de passagers, type de cabine..."
												rows={3}
												className="w-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none"
											/>
										</div>
									</div>

									{statut === "error" && <p className="text-xs text-red-500 text-center">Une erreur est survenue. Veuillez réessayer.</p>}

									<button
										onClick={handleEnvoyer}
										disabled={!nom.trim() || !email.trim() || statut === "sending"}
										className="flex w-full items-center justify-center gap-2.5 py-3.5 px-6 font-semibold text-sm text-white bg-charcoal hover:bg-gold disabled:opacity-50 disabled:bg-charcoal disabled:cursor-not-allowed transition-colors duration-200"
									>
										{statut === "sending" ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
										{statut === "sending" ? "Envoi en cours..." : "Envoyer la demande"}
									</button>
								</>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
