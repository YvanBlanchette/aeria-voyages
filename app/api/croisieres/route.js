import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPortNoms, getUsPorts, resoudrePortSync, hasUsPortSync } from "@/lib/ports";

const TRIS = {
	"date-asc":   "date_depart ASC",
	"date-desc":  "date_depart DESC",
	"prix-asc":   "COALESCE(NULLIF(prix_int,0), NULLIF(prix_ext,0), NULLIF(prix_balcon,0)) ASC",
	"prix-desc":  "COALESCE(NULLIF(prix_int,0), NULLIF(prix_ext,0), NULLIF(prix_balcon,0)) DESC",
	"duree-asc":  "nuits ASC",
	"duree-desc": "nuits DESC",
};

function buildQuery(searchParams) {
	const section = searchParams.get("section");
	const croisieriste = searchParams.get("croisieriste");
	const navire = searchParams.get("navire");
	const mois = searchParams.get("mois");
	const annee = searchParams.get("annee");
	const duree_min = searchParams.get("duree_min");
	const duree_max = searchParams.get("duree_max");
	const tri = searchParams.get("tri");
	const destination = searchParams.get("destination");

	let query = "SELECT * FROM mes_croisieres WHERE 1=1";
	const params = [];

	query += " AND croisieriste != 'Carnival Cruise Line'";

	if (section) {
		query += " AND section = ?";
		params.push(section);
	}
	if (destination) {
		const liste = destination.split(",");
		query += ` AND destination IN (${liste.map(() => "?").join(",")})`;
		params.push(...liste);
	}
	if (croisieriste) {
		const liste = croisieriste.split(",");
		query += ` AND croisieriste IN (${liste.map(() => "?").join(",")})`;
		params.push(...liste);
	}
	if (navire) {
		const liste = navire.split(",");
		query += ` AND navire IN (${liste.map(() => "?").join(",")})`;
		params.push(...liste);
	}
	if (mois) {
		query += " AND CAST(strftime('%m', date_depart) AS INTEGER) = ?";
		params.push(parseInt(mois));
	}
	if (annee) {
		query += " AND strftime('%Y', date_depart) = ?";
		params.push(annee);
	}
	if (duree_min) {
		query += " AND nuits >= ?";
		params.push(parseInt(duree_min));
	}
	if (duree_max) {
		query += " AND nuits <= ?";
		params.push(parseInt(duree_max));
	}
	if (tri && tri.startsWith("prix")) {
		query += " AND (prix_int > 0 OR prix_ext > 0 OR prix_balcon > 0)";
	}

	query += ` ORDER BY ${TRIS[tri] || "date_depart ASC"}`;

	return { query, params };
}

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const excludeUsa = searchParams.get("exclude_usa") === "true";
		const limit = Math.min(parseInt(searchParams.get("limit")) || 24, 100);
		const offset = parseInt(searchParams.get("offset")) || 0;

		const { query, params } = buildQuery(searchParams);

		const [portNoms, usPorts] = await Promise.all([getPortNoms(), getUsPorts()]);

		let total;
		let rows;

		if (excludeUsa) {
			const allRows = await prisma.$queryRawUnsafe(query, ...params);
			const filtered = allRows.filter((r) => !hasUsPortSync(r.port_depart, r.ports, usPorts));
			total = filtered.length;
			rows = filtered.slice(offset, offset + limit);
		} else {
			const countQuery = query.replace(/^SELECT \*/, "SELECT COUNT(*) as total");
			const countResult = await prisma.$queryRawUnsafe(countQuery, ...params);
			total = Number(countResult[0].total);

			const pagedQuery = `${query} LIMIT ? OFFSET ?`;
			rows = await prisma.$queryRawUnsafe(pagedQuery, ...params, limit, offset);
		}

		const mapper = (r) => ({
			LienSEG:               r.lien_seg,
			...r,
			"Croisiériste":        r.croisieriste,
			Navire:                r.navire,
			"Date Départ":         r.date_depart,
			"Date Retour":         r.date_retour,
			Nuits:                 r.nuits,
			"Itinéraire":          r.itineraire,
			"Port Départ":         resoudrePortSync(r.port_depart, portNoms),
			Ports:                 r.ports ? r.ports.split(",").filter(Boolean).map((c) => resoudrePortSync(c, portNoms)) : [],
			"Prix Int.":           r.prix_int,
			"Prix Ext.":           r.prix_ext,
			"Prix Balcon":         r.prix_balcon,
			"Prix Vol MTL Int.":   r.prix_vol_int,
			"Prix Vol MTL Ext.":   r.prix_vol_ext,
			"Prix Vol MTL Balcon": r.prix_vol_balcon,
			Boissons:              r.boissons,
			Pourboires:            r.pourboires,
			WiFi:                  r.wifi,
			"Image Itinéraire":    r.image_itineraire,
			"Image Navire":        r.image_navire,
			Lien:                  r.lien_constellation,
			destination:           r.destination,
		});

		return NextResponse.json({ total, limit, offset, data: rows.map(mapper) });
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
