import { GOLD, GOLD_LIGHT } from "@/components/sections/submission-request/constants";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function WizardNav({ step, status, onPrev, onNext, onSubmit, showError }) {
	const gradient = GOLD_LIGHT ? `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` : `linear-gradient(135deg, ${GOLD}, #D1A96E)`;

	return (
		<div className="mt-8 pt-8 border-t border-[rgba(184,147,92,0.15)]">
			<div className="flex items-center justify-between">
				{step === 1 ? (
					<button
						aschild
						className="lg:w-[165px] cursor-pointer px-8 py-3 font-raleway text-xs tracking-widest uppercase text-white rounded-sm shadow transition hover:brightness-110"
						style={{ background: GOLD }}
					>
						<a
							href="/"
							className="flex items-center justify-center gap-1"
						>
							<ArrowLeft className="w-4 h-4" />
							<span className="hidden lg:inline-block pt-1 font-medium">Retour</span>
						</a>
					</button>
				) : (
					<button
						type="button"
						onClick={onPrev}
						disabled={step === 1}
						className={[
							"lg:w-[165px] cursor-pointer px-7 py-3 font-raleway text-xs tracking-widest uppercase transition rounded-sm flex items-center justify-center gap-1",
							step === 1 ? "opacity-0 pointer-events-none" : "border border-[rgba(184,147,92,0.4)] text-[#8B7355] hover:bg-[rgba(184,147,92,0.08)]",
						].join(" ")}
					>
						<ArrowLeft className="w-4 h-4" />
						<span className="hidden lg:inline-block pt-1 font-medium">Retour</span>
					</button>
				)}

				<span className="font-raleway text-[14px] font-medium tracking-widest text-[#C4A882]">{step} / 4</span>

				{step < 4 ? (
					<button
						type="button"
						onClick={onNext}
						className="lg:w-[165px] cursor-pointer px-8 py-3 font-raleway text-xs tracking-widest uppercase text-white rounded-sm shadow transition hover:brightness-110 flex items-center justify-center gap-1"
						style={{ background: GOLD }}
					>
						<span className="hidden lg:inline-block pt-1 font-medium">Continuer</span>
						<ArrowRight className="w-4 h-4" />
					</button>
				) : (
					<button
						type="button"
						onClick={onSubmit}
						disabled={status === "loading"}
						className={[
							"lg:w-[165px] cursor-pointer px-8 py-3 font-raleway text-xs tracking-widest uppercase text-white rounded-sm shadow transition",
							status === "loading" ? "cursor-wait opacity-80" : "hover:brightness-110",
						].join(" ")}
						style={{ background: status === "loading" ? "#C4A882" : gradient }}
					>
						{status === "loading" ? "Envoi en cours..." : "✦ Préparer mon évasion"}
					</button>
				)}
			</div>

			{showError && (
				<p className="mt-4 text-center font-raleway text-sm text-[#C0392B]">Une erreur s'est produite. Veuillez réessayer ou me contacter directement.</p>
			)}
		</div>
	);
}
