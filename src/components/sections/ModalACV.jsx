import { useEffect } from "react";
import { X, ExternalLink, Plane } from "lucide-react";
import { GOLD } from "@/components/sections/croisieres/constants";

export default function ModalACV({ circuit, onClose }) {
	// Bloquer le scroll du body
	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "";
		};
	}, []);

	// Fermer avec Escape
	useEffect(() => {
		const handler = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 z-50 flex flex-col"
			style={{ background: "rgba(0,0,0,0.7)" }}
		>
			{/* ── Navbar Aeria ── */}
			<div
				className="flex items-center justify-between px-6 py-3 shrink-0"
				style={{ backgroundColor: "#1a1a2e", borderBottom: `2px solid ${GOLD}` }}
			>
				{/* Logo / titre */}
				<div className="flex items-center gap-3">
					<Plane
						className="size-5 text-gold"
						style={{ color: GOLD }}
					/>
					<div>
						<p className="text-white font-serif text-sm font-semibold leading-tight">{circuit.titre}</p>
						<p
							className="text-xs"
							style={{ color: `${GOLD}99` }}
						>
							Vacances Air Canada · {circuit.jours} jours · Depuis {circuit.villeDepart}
						</p>
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-3">
					{/* Prix */}
					<div className="text-right hidden sm:block">
						<p
							className="text-[10px] uppercase tracking-widest"
							style={{ color: `${GOLD}80` }}
						>
							À partir de
						</p>
						<p className="text-white font-bold text-lg leading-tight">{circuit.prixPromo?.toLocaleString("fr-CA")} $</p>
					</div>

					{/* Ouvrir sur ACV */}
					<a
						href={circuit.lienAgent}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded transition-opacity hover:opacity-80"
						style={{ backgroundColor: GOLD, color: "white" }}
					>
						<ExternalLink className="size-3.5" />
						<span className="hidden sm:inline">Réserver sur ACV</span>
					</a>

					{/* Fermer */}
					<button
						onClick={onClose}
						className="cursor-pointer size-9 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
					>
						<X className="size-5 text-white" />
					</button>
				</div>
			</div>

			{/* ── Iframe ACV ── */}
			<div className="flex-1 bg-white overflow-hidden">
				<iframe
					src={circuit.lienAgent}
					className="w-full h-full border-0"
					title={circuit.titre}
					loading="lazy"
					sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
				/>
			</div>
		</div>
	);
}
