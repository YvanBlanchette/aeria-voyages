"use client";

import { useEffect, useState } from "react";

const FLLogo = "/assets/images/flylooper.svg";
const FlightsBackground = "/assets/images/flight.jpg";

const FlightsSection = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		const container = document.getElementById("flights-container");

		if (!container) return;

		container.innerHTML = "";

		const params = new URLSearchParams({
			currency: "cad",
			trs: "550981",
			shmarker: "751591",
			show_hotels: "false",
			searchUrl: "www.aviasales.fr",
			locale: "fr",
			default_origin: "YUL",
			stops: "any",
			powered_by: "false",
			border_radius: "0",
			plain: "true",
			color_button: "#C99543",
			color_button_text: "#FFFFFF",
			color_focused: "#C99543",
			color_icons: "#C99543",
			primary_override: "#C99543",
			secondary: "#FFFFFF",
			dark: "#262626",
			light: "#FFFFFF",
			special: "#FFFFFF",
			no_labels: "true",
			promo_id: "7879",
			campaign_id: "100",
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
			id="flights"
			className="relative isolate overflow-hidden bg-stone-950"
		>
			{/* Image de fond */}
			<img
				src={FlightsBackground}
				alt=""
				aria-hidden="true"
				className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
			/>

			{/* Overlays pour la lisibilité */}
			<div className="absolute inset-0 -z-10 bg-stone-950/30" />
			<div className="absolute inset-0 -z-10 bg-gradient-to-r from-stone-950/90 via-stone-950/55 to-stone-950/20" />
			<div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-stone-950/45 to-transparent" />

			<div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_1.05fr] lg:px-8">
				{/* Contenu éditorial */}
				<div className="max-w-xl text-center lg:text-left">
					<img
						src={FLLogo}
						alt="FlyLooper"
						className="mx-auto mb-8 h-auto w-72 object-contain lg:mx-0"
					/>

					<p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#F6A707]">Comparateur de vols</p>

					<h2 className="text-balance text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-6xl">
						Voyagez plus.
						<span className="mt-1 block text-[#F6A707]">Payez moins.</span>
					</h2>

					<p className="mt-6 max-w-lg text-lg leading-8 text-white/85 sm:text-xl">
						Comparez les itinéraires, les horaires et les tarifs pour trouver le vol qui correspond réellement à votre voyage.
					</p>

					<div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium text-white/90 lg:justify-start">
						<span>✓ Comparaison rapide</span>
						<span>✓ Vols internationaux</span>
						<span>✓ Meilleurs prix</span>
					</div>
				</div>

				{/* Widget de recherche */}
				<div className="w-full lg:justify-self-end">
					<div className="mx-auto w-full max-w-[620px] rounded-2xl border border-white/20 bg-white/95 p-4 shadow-2xl shadow-black/35 backdrop-blur-md sm:p-6">
						<div className="mb-5 border-b border-stone-200 pb-4">
							<p className="text-sm font-semibold uppercase tracking-wider text-[#B47828]">Rechercher un vol</p>
							<p className="mt-1 text-sm text-stone-500">Comparez les options disponibles pour votre prochaine destination.</p>
						</div>

						<div className="relative min-h-[310px] w-full">
							<div
								id="flights-container"
								className="min-h-[310px] w-full"
							/>

							{isLoading && (
								<div className="absolute inset-0 z-10 rounded-xl bg-white/90 p-4">
									<div className="h-full animate-pulse">
										<div className="mb-4 h-3 w-32 rounded-full bg-stone-200" />
										<div className="mb-3 h-10 w-full rounded-md bg-stone-200" />
										<div className="mb-3 h-10 w-full rounded-md bg-stone-200" />
										<div className="mb-4 h-10 w-2/3 rounded-md bg-stone-200" />
										<div className="h-9 w-40 rounded-md bg-amber-200" />
									</div>
									<p className="mt-4 text-sm font-medium text-stone-600">Chargement du widget de vols...</p>
								</div>
							)}

							{hasError && !isLoading && (
								<div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/90 px-4 text-center text-sm text-red-600">
									Impossible de charger le widget pour le moment.
								</div>
							)}
						</div>

						<p className="mt-4 text-xs text-center leading-5 text-stone-500">
							Les tarifs et disponibilités sont fournis par nos partenaires de réservation et peuvent varier au moment de l’achat.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};

export default FlightsSection;
