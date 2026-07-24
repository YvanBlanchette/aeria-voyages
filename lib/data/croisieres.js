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

function buildQuery(params) {
	const { section, croisieriste, navire, mois, annee, duree_min, duree_max, tri, destination } = params;

	let query = "SELECT * FROM mes_croisieres WHERE 1=1";
	const sqlParams = [];

	query += " AND croisieriste != 'Carnival Cruise Line'";

	if (section) {
		query += " AND section = ?";
		sqlParams.push(section);
	}
	if (destination) {
		const liste = destination.split(",");
		query += ` AND destination IN (${liste.map(() => "?").join(",")})`;
		sqlParams.push(...liste);
	}
	if (croisieriste) {
		const liste = croisieriste.split(",");
		query += ` AND croisieriste IN (${liste.map(() => "?").join(",")})`;
		sqlParams.push(...liste);
	}
	if (navire) {
		const liste = navire.split(",");
		query += ` AND navire IN (${liste.map(() => "?").join(",")})`;
		sqlParams.push(...liste);
	}
	if (mois) {
		query += " AND CAST(strftime('%m', date_depart) AS INTEGER) = ?";
		sqlParams.push(parseInt(mois));
	}
	if (annee) {
		query += " AND strftime('%Y', date_depart) = ?";
		sqlParams.push(annee);
	}
	if (duree_min) {
		query += " AND nuits >= ?";
		sqlParams.push(parseInt(duree_min));
	}
	if (duree_max) {
		query += " AND nuits <= ?";
		sqlParams.push(parseInt(duree_max));
	}
	if (tri && tri.startsWith("prix")) {
		query += " AND (prix_int > 0 OR prix_ext > 0 OR prix_balcon > 0)";
	}

	query += ` ORDER BY ${TRIS[tri] || "date_depart ASC"}`;

	return { query, params: sqlParams };
}

/**
 * Shared by app/api/croisieres/route.js (client-side refetches) and
 * app/[locale]/page.js (server-rendered initial view) so both paths run
 * identical query/filter/mapping logic.
 */
export async function getCroisieresPage(params = {}) {
	const excludeUsa = params.exclude_usa === "true" || params.exclude_usa === true;
	const limit = Math.min(parseInt(params.limit) || 24, 100);
	const offset = parseInt(params.offset) || 0;

	const { query, params: sqlParams } = buildQuery(params);

	const [portNoms, usPorts] = await Promise.all([getPortNoms(), getUsPorts()]);

	let total;
	let rows;

	if (excludeUsa) {
		const allRows = await prisma.$queryRawUnsafe(query, ...sqlParams);
		const filtered = allRows.filter((r) => !hasUsPortSync(r.port_depart, r.ports, usPorts));
		total = filtered.length;
		rows = filtered.slice(offset, offset + limit);
	} else {
		const countQuery = query.replace(/^SELECT \*/, "SELECT COUNT(*) as total");
		const countResult = await prisma.$queryRawUnsafe(countQuery, ...sqlParams);
		total = Number(countResult[0].total);

		const pagedQuery = `${query} LIMIT ? OFFSET ?`;
		rows = await prisma.$queryRawUnsafe(pagedQuery, ...sqlParams, limit, offset);
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

	return { total, limit, offset, data: rows.map(mapper) };
}

export async function getCroisieresMeta() {
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

	return {
		compagnies: compagniesRows.map((r) => r.croisieriste),
		mois: moisRows.map((r) => Number(r.mois)),
		annees: anneesRows.map((r) => r.annee),
		sections: sectionsRows.map((r) => r.section),
	};
}
