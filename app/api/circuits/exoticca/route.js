import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const region = searchParams.get("region");

		const rows = await prisma.circuits_exoticca.findMany({
			where: region ? { region } : undefined,
			orderBy: { prix_promo: "asc" },
		});

		return NextResponse.json(rows.map((r) => ({
			...r,
			source: "exoticca",
			prixPromo: r.prix_promo,
			prixRegulier: r.prix_regulier,
			rabais: r.rabais_pct,
			lienAgent: r.lien_agent,
			image: r.image_url,
			destination: r.destination,
			jours: r.jours,
		})));
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
