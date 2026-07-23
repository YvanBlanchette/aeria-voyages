import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ACV_DESTINATIONS, ACV_VILLES } from "@/lib/acv";

export async function GET() {
	try {
		const [destinations, villes, mois, durees] = await Promise.all([
			prisma.circuits_acv.findMany({ distinct: ["destination"], select: { destination: true }, orderBy: { destination: "asc" } }),
			prisma.circuits_acv.findMany({ distinct: ["ville_depart"], select: { ville_depart: true }, orderBy: { ville_depart: "asc" } }),
			prisma.circuits_acv.findMany({ distinct: ["mois"], select: { mois: true }, orderBy: { mois: "asc" } }),
			prisma.circuits_acv.findMany({ distinct: ["categorie_duree"], select: { categorie_duree: true }, orderBy: { categorie_duree: "asc" } }),
		]);

		return NextResponse.json({
			destinations: destinations.map((r) => ({
				code: r.destination,
				nom: ACV_DESTINATIONS[r.destination] ?? r.destination,
				label: `${ACV_DESTINATIONS[r.destination] ?? r.destination} (${r.destination})`,
			})),
			villes: villes.map((r) => ({
				code: r.ville_depart,
				nom: ACV_VILLES[r.ville_depart] ?? r.ville_depart,
			})),
			mois: mois.map((r) => r.mois),
			durees: durees.map((r) => r.categorie_duree),
		});
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
