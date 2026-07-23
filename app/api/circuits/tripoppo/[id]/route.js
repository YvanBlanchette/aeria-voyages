import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJSON } from "@/lib/api-utils";

export async function GET(request, { params }) {
	try {
		const { id } = await params;
		const circuit = await prisma.circuits_tripoppo.findUnique({ where: { id: parseInt(id, 10) } });
		if (!circuit) return NextResponse.json({ error: "Circuit introuvable" }, { status: 404 });

		const [itineraireRows, datesPrixRows, hotels] = await Promise.all([
			prisma.tripoppo_itineraire.findMany({ where: { url_circuit: circuit.url_circuit }, orderBy: { id: "asc" } }),
			prisma.tripoppo_dates_prix.findMany({ where: { url_circuit: circuit.url_circuit }, orderBy: { date_depart: "asc" } }),
			prisma.tripoppo_hotels.findMany({ where: { url_circuit: circuit.url_circuit } }),
		]);

		const itineraire = itineraireRows.map((j) => ({ ...j, images: parseJSON(j.images) }));
		const dates_prix = datesPrixRows.map((d) => ({ ...d, liens_resa: parseJSON(d.liens_resa) }));

		return NextResponse.json({
			...circuit,
			source: "tripoppo",
			prixPromo: parseFloat(circuit.prix_promo) || 0,
			prixRegulier: parseFloat(circuit.prix_regulier) || null,
			lienAgent: circuit.lien_agent ?? circuit.url_circuit,
			image: circuit.image_url,
			infos_rapides: parseJSON(circuit.infos_rapides),
			images_carousel: parseJSON(circuit.images_carousel),
			inclus: parseJSON(circuit.inclus),
			non_inclus: parseJSON(circuit.non_inclus),
			itineraire,
			dates_prix,
			hotels,
		});
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
