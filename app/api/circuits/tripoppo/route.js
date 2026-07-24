import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJSON, cachedJson } from "@/lib/api-utils";

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const region = searchParams.get("region");

		const rows = await prisma.circuits_tripoppo.findMany({
			where: region ? { region } : undefined,
			orderBy: [{ region: "asc" }, { titre: "asc" }],
		});

		return cachedJson(rows.map((r) => ({
			...r,
			source: "tripoppo",
			prixPromo: parseFloat(r.prix_promo) || 0,
			prixRegulier: parseFloat(r.prix_regulier) || null,
			lienAgent: r.lien_agent ?? r.url_circuit,
			image: r.image_url,
			infos_rapides: parseJSON(r.infos_rapides),
			images_carousel: parseJSON(r.images_carousel),
			inclus: parseJSON(r.inclus),
			non_inclus: parseJSON(r.non_inclus),
		})));
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
