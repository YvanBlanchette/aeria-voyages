import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const [compagniesRows, moisRows, anneesRows, sectionsRows] = await Promise.all([
			prisma.mes_croisieres.findMany({
				where: { croisieriste: { not: "Carnival Cruise Line" } },
				distinct: ["croisieriste"],
				select: { croisieriste: true },
				orderBy: { croisieriste: "asc" },
			}),
			prisma.$queryRawUnsafe(
				"SELECT DISTINCT CAST(strftime('%m', date_depart) AS INTEGER) as mois FROM mes_croisieres ORDER BY mois",
			),
			prisma.$queryRawUnsafe(
				"SELECT DISTINCT strftime('%Y', date_depart) as annee FROM mes_croisieres ORDER BY annee",
			),
			prisma.mes_croisieres.findMany({
				distinct: ["section"],
				select: { section: true },
			}),
		]);

		return NextResponse.json({
			compagnies: compagniesRows.map((r) => r.croisieriste),
			mois: moisRows.map((r) => Number(r.mois)),
			annees: anneesRows.map((r) => r.annee),
			sections: sectionsRows.map((r) => r.section),
		});
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
