import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJSON, cachedJson } from "@/lib/api-utils";
import { ACV_DESTINATIONS, ACV_VILLES } from "@/lib/acv";

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const destination = searchParams.get("destination");
		const ville_depart = searchParams.get("ville_depart");
		const mois = searchParams.get("mois");
		const duree = searchParams.get("duree");

		const where = {};
		if (destination) where.destination = destination;
		if (ville_depart) where.ville_depart = ville_depart;
		if (mois) where.mois = mois;
		if (duree) where.categorie_duree = duree;

		const rows = await prisma.circuits_acv.findMany({
			where,
			orderBy: { prix: "asc" },
		});

		return cachedJson(rows.map((r) => ({
			...r,
			source: "acv",
			titre: r.nom,
			prixPromo: r.prix,
			prixRegulier: null,
			rabais: null,
			lienAgent: r.url_circuit?.replace("/en/", "/fr/").replace("distribution=yes&distribution=yes", "distribution=yes"),
			image: r.image_url,
			jours: r.jours,
			destinationCode: r.destination,
			destinationNom: ACV_DESTINATIONS[r.destination] ?? r.destination,
			destination: `${ACV_DESTINATIONS[r.destination] ?? r.destination} (${r.destination})`,
			villeDepart: ACV_VILLES[r.ville_depart] ?? r.ville_depart,
			villedepartCode: r.ville_depart,
			lieux: parseJSON(r.lieux_visites),
			region: "europe",
		})));
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
