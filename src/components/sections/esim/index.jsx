import { useEffect, useState } from "react";
import AiraloLogo from "@/assets/images/airalo_logo.svg";
import AiraloBackground from "@/assets/images/airalo.jpg";

const ESimSection = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		const container = document.getElementById("esim-container");

		if (!container) return;

		// Évite que le widget soit ajouté deux fois en développement
		container.innerHTML = "";

		const script = document.createElement("script");

		const params = new URLSearchParams({
			trs: "550981",
			shmarker: "751591",
			locale: "fr",
			powered_by: "false",
			color_button: "#C99543",
			color_focused: "#C99543",
			secondary: "#FFFFFF",
			dark: "#11100F",
			light: "#FFFFFF",
			special: "##fafaf9",
			border_radius: "8",
			plain: "true",
			no_labels: "true",
			promo_id: "8588",
			campaign_id: "541",
		});

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
			id="esim"
			className="relative isolate overflow-hidden bg-stone-950"
		>
			{/* Image de fond */}
			<img
				src={AiraloBackground}
				alt=""
				aria-hidden="true"
				className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
			/>

			{/* Superpositions pour améliorer la lisibilité */}
			<div className="absolute inset-0 -z-10 bg-black/35" />
			<div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/45 to-black/20" />
			<div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-black/35 to-transparent" />

			<div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
				{/* Contenu */}
				<div className="max-w-xl text-center lg:text-left">
					<img
						src={AiraloLogo}
						alt="Airalo"
						className="mx-auto mb-8 h-auto w-72 object-contain lg:mx-0"
					/>
					<p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#E1B96F]">Internet à l’étranger</p>

					<h2 className="text-balance text-3xl font-bold leading-tight text-white sm:text-4xl">Restez connecté partout où vos voyages vous mènent</h2>

					<p className="mt-5 max-w-lg text-lg leading-8 text-white/85 sm:text-xl">
						Choisissez une eSIM locale, régionale ou mondiale et profitez d’une connexion fiable à un tarif avantageux.
					</p>

					<div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium text-white/90 lg:justify-start">
						<span>✓ Installation rapide</span>
						<span>✓ Plus de 200 destinations</span>
						<span>✓ Sans carte SIM physique</span>
					</div>
				</div>

				{/* Formulaire */}
				<div className="w-full lg:justify-self-end">
					<div className="mx-auto w-full max-w-[520px] rounded-2xl border border-white/20 bg-stone-50 p-6 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-8">
						<div className="mb-6 flex items-center justify-between gap-5">
							<div>
								<p className="text-sm font-semibold uppercase tracking-wider text-[#B47828]">Trouvez votre forfait</p>
								<p className="mt-1 text-sm text-stone-500">Recherchez votre prochaine destination</p>
							</div>
						</div>

						<label
							htmlFor="esim-container"
							className="mb-2 block text-sm font-semibold text-stone-800"
						>
							Destination
						</label>

						<div className="relative min-h-[100px] w-full">
							<div
								id="esim-container"
								className="min-h-[100px] w-full bg-stone-50"
							/>

							{isLoading && (
								<div className="absolute inset-0 z-10 rounded-xl bg-white/90 p-4">
									<div className="h-full animate-pulse">
										<div className="mb-3 h-10 w-full rounded-md bg-stone-200" />
										<div className="mb-3 h-10 w-full rounded-md bg-stone-200" />
										<div className="h-10 w-1/2 rounded-md bg-amber-200" />
									</div>
									<p className="mt-4 text-sm font-medium text-stone-600">Chargement du widget eSIM...</p>
								</div>
							)}

							{hasError && !isLoading && (
								<div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-stone-50 px-4 text-center text-sm text-red-600">
									Impossible de charger le widget pour le moment.
								</div>
							)}
						</div>

						<p className="mt-4 text-xs text-center leading-5 text-stone-500">Vous serez redirigé vers Airalo pour compléter votre achat.</p>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ESimSection;
