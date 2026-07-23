"use client";

import { useEffect, useState } from "react";

const WPLogo = "/assets/images/welcome_pickups-logo.png";
const TransfersBackground = "/assets/images/welcome_pickups.jpg";

const TransfersSection = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		const container = document.getElementById("welcomepickups-container");

		if (!container) return;

		container.innerHTML = "";

		const params = new URLSearchParams({
			trs: "550981",
			shmarker: "751591",
			locale: "fr",
			show_header: "true",
			powered_by: "false",
			campaign_id: "627",
			promo_id: "8951",
		});

		const script = document.createElement("script");

		script.src = `https://tpwdg.com/content?${params.toString()}`;
		script.async = true;
		script.charset = "utf-8";
		script.onload = () => {
			setIsLoading(false);
		};
		script.onerror = () => {
			setIsLoading(false);
			setHasError(true);
		};

		container.appendChild(script);

		return () => {
			container.innerHTML = "";
		};
	}, []);

	return (
		<section
			id="transports"
			className="relative isolate overflow-hidden bg-stone-950"
		>
			{/* Image de fond */}
			<img
				src={TransfersBackground}
				alt=""
				aria-hidden="true"
				className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
			/>

			{/* Superpositions */}
			<div className="absolute inset-0 -z-10 bg-stone-950/30" />
			<div className="absolute inset-0 -z-10 bg-gradient-to-r from-stone-950/90 via-stone-950/55 to-stone-950/20" />
			<div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-stone-950/40 to-transparent" />

			<div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_0.7fr] lg:px-8">
				{/* Zone éditoriale */}
				<div className="max-w-3xl text-center lg:text-left">
					<img
						src={WPLogo}
						alt="Welcome Pickups"
						className="mx-auto mb-8 h-auto w-72 object-contain lg:mx-0"
					/>

					<p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">Transferts privés</p>

					<h2 className="text-balance text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
						Arrivez.
						<br />
						<span className="text-emerald-300">Découvrez.</span>
						<br />
						Profitez.
					</h2>

					<p className="mt-6 max-w-xl text-lg leading-8 text-white/85 sm:text-xl">
						Réservez votre transfert entre l&apos;aéroport, le port, votre hôtel ou toute autre adresse et commencez votre voyage sans stress.
					</p>

					<div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium text-white/90 lg:justify-start">
						<span>✓ Chauffeur privé</span>
						<span>✓ Accueil personnalisé</span>
						<span>✓ Prix connu à l&apos;avance</span>
					</div>
				</div>

				{/* Widget */}
				<div className="w-full lg:justify-self-end">
					<div className="relative min-h-[500px] w-full overflow-hidden">
						<div
							id="welcomepickups-container"
							className="min-h-[500px] w-full overflow-hidden"
						/>

						{isLoading && (
							<div className="absolute inset-0 z-10 rounded-xl bg-white/90 p-4">
								<div className="h-full animate-pulse">
									<div className="mb-4 h-3 w-32 rounded-full bg-stone-200" />
									<div className="mb-3 h-12 w-full rounded-md bg-stone-200" />
									<div className="mb-3 h-28 w-full rounded-md bg-stone-200" />
									<div className="h-10 w-44 rounded-md bg-emerald-200" />
								</div>
								<p className="mt-4 text-sm font-medium text-stone-600">Chargement du widget de transferts...</p>
							</div>
						)}

						{hasError && !isLoading && (
							<div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/90 px-4 text-center text-sm text-red-600">
								Impossible de charger le widget pour le moment.
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};

export default TransfersSection;
