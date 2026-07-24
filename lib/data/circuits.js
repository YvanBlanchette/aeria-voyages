import { prisma } from "@/lib/prisma";

/**
 * Shared by app/api/circuits/exoticca/route.js (client-side refetches) and
 * app/[locale]/page.js (server-rendered initial view for the default
 * "exoticca" tab in the Circuits section).
 */
export async function getExoticcaCircuits(region) {
	const rows = await prisma.circuits_exoticca.findMany({
		where: region ? { region } : undefined,
		orderBy: { prix_promo: "asc" },
	});

	return rows.map((r) => ({
		...r,
		source: "exoticca",
		prixPromo: r.prix_promo,
		prixRegulier: r.prix_regulier,
		rabais: r.rabais_pct,
		lienAgent: r.lien_agent,
		image: r.image_url,
		destination: r.destination,
		jours: r.jours,
	}));
}
