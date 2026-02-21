import React, { useState, useEffect } from "react";

const TourSearch = () => {
	const [tours, setTours] = useState([]);
	const [dest, setDest] = useState("AMS");
	const [month, setMonth] = useState("2026-03");

	const fetchTours = async () => {
		try {
			const response = await fetch(`http://localhost:5001/api/search-tours?dest=${dest}&month=${month}`);

			if (!response.ok) {
				// Si Python renvoie une erreur (403, 500, etc.)
				const errorData = await response.json();
				console.error("Erreur du Proxy Python:", errorData);
				return;
			}

			const data = await response.json();
			console.log("Données reçues d'ACV:", data); // Pour voir la structure dans la console F12

			// L'API d'ACV met les résultats dans "products"
			if (data && data.products) {
				setTours(data.products);
			} else {
				setTours([]);
				console.warn("Aucun circuit trouvé pour cette sélection.");
			}
		} catch (error) {
			console.error("Erreur réseau (vérifie si Python tourne):", error);
		}
	};

	useEffect(() => {
		fetchTours();
	}, [dest, month]);

	return (
		<div style={{ padding: "20px" }}>
			<h2>Mes Circuits Europe</h2>

			{/* Sélecteurs */}
			<select
				onChange={(e) => setMonth(e.target.value)}
				value={month}
			>
				<option value="2026-03">Mars 2026</option>
				<option value="2026-04">Avril 2026</option>
			</select>

			<select
				onChange={(e) => setDest(e.target.value)}
				value={dest}
			>
				<option value="AMS">Amsterdam</option>
				<option value="CDG">Paris</option>
				<option value="ROM">Rome</option>
			</select>

			{/* Grille de résultats */}
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
				{tours.map((tour) => (
					<div
						key={tour.acv_tour_id}
						style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}
					>
						<img
							src={tour.images[0]?.link_large}
							alt={tour.tour_name}
							style={{ width: "100%" }}
						/>
						<div style={{ padding: "15px" }}>
							<h3>{tour.tour_name}</h3>
							<p>
								<strong>{tour.price} $ CAD</strong>
							</p>
							<p>
								{tour.nb_days} jours | {tour.tour_type}
							</p>
							<a
								href={tour.tour_static_pdp_url}
								target="_blank"
							>
								Voir le détail
							</a>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default TourSearch;
