import { motion } from "framer-motion";
import { GOLD } from "@/components/sections/submission-request/constants";
import { Check } from "lucide-react";
import submissionBg from "@/assets/videos/submission-bg.webm";

export default function SuccessScreen({ prenom }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8 }}
			// h-full ou min-h-[70vh] pour bien centrer dans le conteneur du formulaire
			className="relative w-screen h-screen min-h-[60vh] flex flex-col items-center justify-center text-center px-6"
		>
			<div className="bg-black/10 absolute inset-0 z-15" />
			<video
				className="absolute inset-0 w-full h-full object-cover"
				autoPlay
				muted
				loop
				playsInline
			>
				<source
					src={submissionBg}
					type="video/webm"
				/>
			</video>
			{/* L'icône Check - On garde le cercle mais on booste la visibilité */}
			<div className="relative flex flex-col items-center justify-center aspect-square bg-black/20 z-30 p-12 rounded-full backdrop-blur-xl shadow-2xl border-16 border-white/50">
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.2, type: "spring" }}
					className="relative mb-8 z-20"
				>
					<div
						className="w-20 h-20 rounded-full border-2 border-gold flex items-center justify-center"
						style={{
							background: "rgba(255,255,255,0.1)",
						}}
					>
						<Check className="w-8 h-8 text-white/80" />
					</div>
					<motion.span
						animate={{ opacity: [0, 1, 0] }}
						transition={{ repeat: Infinity, duration: 2 }}
						className="absolute -top-2 -right-2 text-xl text-white"
					>
						✦
					</motion.span>
				</motion.div>

				{/* Titre en blanc cassé pour ressortir sur le noir */}
				<h2 className="font-playfair text-3xl md:text-5xl font-light text-white leading-tight">L'évasion se dessine</h2>

				{/* Texte plus clair (Gris perle / Ivoire) */}
				<p className="mt-6 font-raleway text-[15px] font-medium text-[#ffffff] leading-relaxed max-w-[500px]">
					Merci <span className="font-semibold text-gold">{prenom}</span>. Votre demande a été transmise avec succès.
					<br /> Je vais prendre le temps d'analyser vos besoins et je vais vous revenir dans <span className="italic">les plus bref délais</span> pour donner
					vie à ce projet unique.
				</p>

				{/* Séparateur et signature */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.8 }}
					className="mt-12 flex flex-col items-center gap-6"
				>
					<div className="h-[1px] w-16 bg-gold" />
					<p className="text-[18px] tracking-[0.21em] uppercase text-white/80 font-light">À très bientôt</p>

					{/* Bouton retour plus visible */}
					<button
						onClick={() => (window.location.href = "/")}
						className="cursor-pointer mt-4 text-[12px] uppercase tracking-widest text-black hover:bg-gold transition-all duration-300 px-6 py-3 font-medium rounded-full bg-white shadow-sm"
					>
						Retour à l'accueil
					</button>
				</motion.div>
			</div>
		</motion.div>
	);
}
