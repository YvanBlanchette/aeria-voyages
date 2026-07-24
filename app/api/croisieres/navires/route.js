import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cachedJson } from "@/lib/api-utils";

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const croisieriste = searchParams.get("croisieriste");

		const where = {
			navire: { not: null },
			croisieriste: { not: "Carnival Cruise Line" },
		};
		if (croisieriste) {
			where.croisieriste.in = croisieriste.split(",");
		}

		const rows = await prisma.mes_croisieres.findMany({
			where,
			distinct: ["navire"],
			select: { navire: true },
			orderBy: { navire: "asc" },
		});

		return cachedJson(rows.map((r) => r.navire));
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
