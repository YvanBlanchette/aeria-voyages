import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  CarteItineraire.jsx
//  Affiche l'itinéraire de croisière sur une carte Leaflet (OpenStreetMap)
//  Remplace les images statiques de Voyages Constellation
//
//  Props:
//    ports     : string[]  — liste des codes de ports (ex: ["MIA","CZM","GCM","MIA"])
//    height    : string    — hauteur CSS de la carte (défaut: "240px")
//    className : string    — classes Tailwind additionnelles
// ─────────────────────────────────────────────────────────────────────────────

// Import des coordonnées — à placer dans src/data/ports_coords.json
import COORDS from "@/data/ports_coords.json";

const GOLD = "#B8935C";
const DARK = "#1a1a2e";
const RADIUS = 6;

export default function CarteItineraire({ ports = [], height = "240px", className = "" }) {
	const containerRef = useRef(null);
	const mapRef = useRef(null);

	useEffect(() => {
		if (!containerRef.current || ports.length === 0) return;

		// Charger Leaflet dynamiquement (pas de SSR issues)
		let L;
		let map;

		const init = async () => {
			// Import dynamique de Leaflet
			L = (await import("leaflet")).default;
			await import("leaflet/dist/leaflet.css");

			// Éviter double-init si le composant re-render
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
			}

			// Résoudre les coordonnées des ports
			const points = ports
				.map((code) => {
					const c = COORDS[code];
					if (!c || c.lat === null) return null;
					return { code, lat: c.lat, lng: c.lng, nom: c.nom };
				})
				.filter(Boolean);

			if (points.length < 2) return;

			// Initialiser la carte
			map = L.map(containerRef.current, {
				zoomControl: false,
				attributionControl: false,
				scrollWheelZoom: false,
				dragging: false,
				doubleClickZoom: false,
				touchZoom: false,
			});
			mapRef.current = map;

			// Tuiles OpenStreetMap — style CartoDB Positron (clair, épuré)
			L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
				subdomains: "abcd",
				maxZoom: 19,
			}).addTo(map);

			// Ligne de l'itinéraire
			const latlngs = points.map((p) => [p.lat, p.lng]);
			L.polyline(latlngs, {
				color: GOLD,
				weight: 2,
				opacity: 0.85,
				dashArray: "6 4",
			}).addTo(map);

			// Marqueurs personnalisés
			points.forEach((p, i) => {
				const isFirst = i === 0;
				const isLast = i === points.length - 1;
				const isRetour = isLast && p.code === points[0].code;

				// SVG du marqueur
				const color = isFirst || (isLast && !isRetour) ? GOLD : "#888";
				const size = isFirst || (isLast && !isRetour) ? 12 : 8;
				const svg = `
					<svg xmlns="http://www.w3.org/2000/svg" width="${size * 2}" height="${size * 2}">
						<circle cx="${size}" cy="${size}" r="${size - 2}"
							fill="${isRetour ? "white" : color}"
							stroke="${GOLD}"
							stroke-width="2"
						/>
						${!isRetour && (isFirst || isLast) ? `<circle cx="${size}" cy="${size}" r="${size / 3}" fill="white"/>` : ""}
					</svg>`;

				const icon = L.divIcon({
					html: svg,
					className: "",
					iconSize: [size * 2, size * 2],
					iconAnchor: [size, size],
				});

				const marker = L.marker([p.lat, p.lng], { icon }).addTo(map);

				// Tooltip avec le nom du port
				marker.bindTooltip(p.nom.split(",")[0], {
					permanent: false,
					direction: "top",
					offset: [0, -size],
					className: "leaflet-tooltip-aeria",
				});
			});

			// Ajuster le zoom pour englober tous les points
			const bounds = L.latLngBounds(latlngs);
			map.fitBounds(bounds, { padding: [24, 24] });
		};

		init().catch(console.error);

		return () => {
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
			}
		};
	}, [ports.join(",")]);

	if (ports.length === 0) return null;

	return (
		<>
			<style>{`
				.leaflet-tooltip-aeria {
					background: ${DARK};
					border: 1px solid ${GOLD};
					color: #e8dcc8;
					font-size: 11px;
					font-weight: 600;
					letter-spacing: 0.05em;
					padding: 3px 7px;
					border-radius: 2px;
					box-shadow: 0 2px 8px rgba(0,0,0,0.4);
					white-space: nowrap;
				}
				.leaflet-tooltip-aeria::before {
					border-top-color: ${GOLD} !important;
				}
			`}</style>
			<div
				ref={containerRef}
				className={`w-full rounded-sm overflow-hidden ${className}`}
				style={{ height }}
			/>
		</>
	);
}
