import { prisma } from "@/lib/prisma";

// ─── Données statiques ───────────────────────────────────────────────────────

export const DESTINATIONS = [
	{ value: "tout-le-sud",            label: "Tout le Sud",            parent: null },
	{ value: "antigua",                label: "Antigua",                parent: null },
	{ value: "aruba",                  label: "Aruba",                  parent: null },
	{ value: "bahamas",                label: "Bahamas",                parent: null },
	{ value: "freeport",               label: "Freeport",               parent: "bahamas" },
	{ value: "nassau",                 label: "Nassau",                 parent: "bahamas" },
	{ value: "barbade",                label: "Barbade",                parent: null },
	{ value: "colombie",               label: "Colombie",               parent: null },
	{ value: "carthagene",             label: "Carthagène",             parent: "colombie" },
	{ value: "san-andres",             label: "San Andres",             parent: "colombie" },
	{ value: "costa-rica",             label: "Costa Rica",             parent: null },
	{ value: "puntarenas",             label: "Puntarenas",             parent: "costa-rica" },
	{ value: "guanacaste",             label: "Guanacaste",             parent: "costa-rica" },
	{ value: "san-jose",               label: "San José",               parent: "costa-rica" },
	{ value: "cuba",                   label: "Cuba",                   parent: null },
	{ value: "cayo-coco",              label: "Cayo Coco",              parent: "cuba" },
	{ value: "cayo-cruz",              label: "Cayo Cruz",              parent: "cuba" },
	{ value: "cayo-largo",             label: "Cayo Largo",             parent: "cuba" },
	{ value: "cayo-santa-maria",       label: "Cayo Santa Maria",       parent: "cuba" },
	{ value: "cienfuegos",             label: "Cienfuegos",             parent: "cuba" },
	{ value: "holguin",                label: "Holguin",                parent: "cuba" },
	{ value: "la-havane",              label: "La Havane",              parent: "cuba" },
	{ value: "trinidad",               label: "Trinidad",               parent: "cuba" },
	{ value: "varadero",               label: "Varadero",               parent: "cuba" },
	{ value: "curacao",                label: "Curaçao",                parent: null },
	{ value: "guadeloupe",             label: "Guadeloupe",             parent: null },
	{ value: "jamaique",               label: "Jamaïque",               parent: null },
	{ value: "montego-bay",            label: "Montego Bay",            parent: "jamaique" },
	{ value: "negril",                 label: "Negril",                 parent: "jamaique" },
	{ value: "ocho-rios",              label: "Ocho Rios",              parent: "jamaique" },
	{ value: "runaway-bay",            label: "Runaway Bay",            parent: "jamaique" },
	{ value: "whitehouse",             label: "Whitehouse",             parent: "jamaique" },
	{ value: "martinique",             label: "Martinique",             parent: null },
	{ value: "mexique",                label: "Mexique",                parent: null },
	{ value: "cancun",                 label: "Cancun",                 parent: "mexique" },
	{ value: "cozumel",                label: "Cozumel",                parent: "mexique" },
	{ value: "ixtapa",                 label: "Ixtapa",                 parent: "mexique" },
	{ value: "los-cabos",              label: "Los Cabos",              parent: "mexique" },
	{ value: "mazatlan",               label: "Mazatlan",               parent: "mexique" },
	{ value: "puerto-vallarta",        label: "Puerto Vallarta",        parent: "mexique" },
	{ value: "riviera-maya",           label: "Riviera Maya",           parent: "mexique" },
	{ value: "panama",                 label: "Panama",                 parent: null },
	{ value: "puerto-rico",            label: "Puerto Rico",            parent: null },
	{ value: "republique-dominicaine", label: "République Dominicaine", parent: null },
	{ value: "puerto-plata",           label: "Puerto Plata",           parent: "republique-dominicaine" },
	{ value: "la-romana",              label: "La Romana",              parent: "republique-dominicaine" },
	{ value: "punta-cana",             label: "Punta Cana",             parent: "republique-dominicaine" },
	{ value: "samana",                 label: "Samaná",                 parent: "republique-dominicaine" },
	{ value: "santo-domingo",          label: "Santo Domingo",          parent: "republique-dominicaine" },
	{ value: "st_martin",              label: "St Martin",              parent: null },
	{ value: "turks-et-caicos",        label: "Turks et Caicos",        parent: null },
];

export const ORIGINES = [
	{ value: "bagotville", label: "Bagotville" },
	{ value: "calgary",    label: "Calgary" },
	{ value: "edmonton",   label: "Edmonton" },
	{ value: "halifax",    label: "Halifax" },
	{ value: "montreal",   label: "Montréal" },
	{ value: "ottawa",     label: "Ottawa" },
	{ value: "quebec",     label: "Québec" },
	{ value: "saskatoon",  label: "Saskatoon" },
	{ value: "toronto",    label: "Toronto" },
	{ value: "vancouver",  label: "Vancouver" },
	{ value: "winnipeg",   label: "Winnipeg" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const PROVIDER_BASE = "https://www.voyagesconstellation.com";
const CACHE_TTL_HOURS = 2;

export const HTTP_HEADERS = {
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
	Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
	"Accept-Language": "fr-CA,fr;q=0.9,en;q=0.8",
	"Cache-Control": "no-cache",
};

export async function fetchHtml(url) {
	const response = await fetch(url, { headers: HTTP_HEADERS });
	return response.text();
}

export function encodeToken(str) { return Buffer.from(str).toString("base64"); }
export function decodeToken(token) { return Buffer.from(token, "base64").toString("utf8"); }
export function proxyImg(absoluteUrl) {
	return `/api/all-inclusive/img?token=${encodeToken(absoluteUrl)}`;
}

function parseEtoiles(starsStr) {
	if (!starsStr) return null;
	if (starsStr.includes("<img") || starsStr.includes("grandluxe")) return "grandluxe";
	const full = (starsStr.match(/★/g) || []).length;
	const half = starsStr.includes("½") ? 0.5 : 0;
	return full + half;
}

// ─── Parsers ─────────────────────────────────────────────────────────────────

export function parseListePage(html, cheerio) {
	const $ = cheerio.load(html);
	const packages = [];

	$("a.hotel").each((_, el) => {
		const $el = $(el);
		const idAttr = $el.attr("id") || "";
		const id = parseInt(idAttr.replace("hot_", ""), 10);
		const href = $el.attr("href") || "";

		const style = $el.attr("style") || "";
		const imgMatch = style.match(/url\('([^']+)'\)/);
		const image = imgMatch ? proxyImg(`${PROVIDER_BASE}${imgMatch[1]}`) : null;

		const numero = parseInt($el.find(".number").text().trim(), 10);
		const etoiles = parseEtoiles($el.find(".stars").html() || $el.find(".stars").text());

		const $name = $el.find(".name");
		const region = $name.find("span").text().trim();
		$name.find("span").remove();
		const nom = $name.text().trim();

		const prixStr = $el.find(".prix").text().trim();
		const prix = parseInt(prixStr.replace(/[^0-9]/g, ""), 10) || null;

		const destMatch = href.match(/^\/([^/?]+)\//);
		const destination = destMatch ? destMatch[1] : null;

		if (nom && prix) {
			packages.push({ id, numero, nom, region, destination, etoiles, prix, image, token: encodeToken(href) });
		}
	});

	return packages;
}

export function parseDetailPage(html, cheerio) {
	const $ = cheerio.load(html);

	const nom = $(".name").first().clone().children().remove().end().text().trim();
	const region = $(".name span").first().text().trim();
	const etoiles = parseEtoiles($(".stars").first().html() || "");

	const bannerStyle = $(".banner").attr("style") || "";
	const bannerMatch = bannerStyle.match(/url\(([^)]+)\)/);
	const image = bannerMatch
		? proxyImg(`${PROVIDER_BASE}${bannerMatch[1].replace(/['"]/g, "")}`)
		: null;

	const images = [];
	$("img.thumbnail, img.largeimage").each((_, el) => {
		const src = $(el).attr("src");
		if (src) {
			const proxied = proxyImg(`${PROVIDER_BASE}${src}`);
			if (!images.includes(proxied)) images.push(proxied);
		}
	});

	const infos = {};
	$(".block").each((_, el) => {
		const titre = $(el).find("h3").text().trim();
		const items = [];
		$(el).find("li").each((_, li) => items.push($(li).text().trim()));
		if (titre && items.length) infos[titre] = items;
	});

	const typesChambres = [];

	$("h3.type").each((_, h3) => {
		const $h3 = $(h3);
		const titreComplet = $h3.find("a").text().trim();
		const nomChambre = titreComplet.replace(/\d+\s*options.*/, "").trim();
		const qtyMatch = titreComplet.match(/(\d+)\s*options/);
		const prixMatch = titreComplet.match(/(\d+[\d.,]*)\$/);
		const nbOptions = qtyMatch ? parseInt(qtyMatch[1]) : null;
		const prixDepart = prixMatch ? parseFloat(prixMatch[1].replace(",", ".")) : null;

		const options = [];
		$h3.next(".groupe.accordeons").find(".vol.groupe").each((_, volEl) => {
			const $vol = $(volEl);
			const optionId = $vol.attr("id")?.replace("option_", "") || null;
			const prix = parseFloat($vol.find('input[id^="price_"]').val()) || null;
			const jourDep = $vol.find(".title").text().trim().split(/\s*-\s*/)[0].trim();
			const typeIncl = $vol.find(".title").text().includes("Tout Inclus") ? "Tout Inclus" : null;
			const lienDetails = $vol.find("a.information").attr("url") || null;

			const vols = [];
			$vol.find("table.date tr").not(":first").each((_, tr) => {
				const cells = $(tr).find("td").map((_, td) => $(td).text().trim()).get();
				if (cells.length >= 6) {
					vols.push({ date: cells[0], vol: cells[1], origine: cells[2], depart: cells[3], destination: cells[4], arrivee: cells[5] });
				}
			});

			let compagnie = null;
			if (vols.length > 0) {
				if      (vols[0].vol.includes("WestJet"))    compagnie = "WestJet";
				else if (vols[0].vol.includes("Transat"))    compagnie = "Air Transat";
				else if (vols[0].vol.includes("Sunwing"))    compagnie = "Sunwing";
				else if (vols[0].vol.includes("Air Canada")) compagnie = "Air Canada";
				else compagnie = vols[0].vol.split("-")[0].trim();
			}

			if (optionId && vols.length === 2) {
				options.push({ id: optionId, jour_depart: jourDep, compagnie, type_inclus: typeIncl, prix, lien_details: lienDetails, vol_aller: vols[0], vol_retour: vols[1] });
			}
		});

		options.sort((a, b) => (a.prix || 0) - (b.prix || 0));
		typesChambres.push({ nom: nomChambre, nb_options: nbOptions, prix_depart: prixDepart, options });
	});

	return {
		nom, region, etoiles, image, images, infos,
		types_chambres: typesChambres,
		prix_min: typesChambres.length
			? Math.min(...typesChambres.flatMap((t) => t.options.map((o) => o.prix)).filter(Boolean))
			: null,
	};
}

// ─── Cache (ai_search_cache table, via Prisma) ───────────────────────────────

export async function cacheGet(cacheKey) {
	const cutoff = new Date(Date.now() - CACHE_TTL_HOURS * 3600 * 1000);
	const row = await prisma.ai_search_cache.findFirst({
		where: { cache_key: cacheKey, created_at: { gt: cutoff.toISOString() } },
	});
	return row ? row.data : null;
}

export async function cacheSet(cacheKey, data) {
	const createdAt = new Date().toISOString();
	await prisma.ai_search_cache.upsert({
		where: { cache_key: cacheKey },
		create: { cache_key: cacheKey, data, created_at: createdAt },
		update: { data, created_at: createdAt },
	});
	if (Math.random() < 0.05) await cacheClean();
}

export async function cacheClean() {
	const cutoff = new Date(Date.now() - 24 * 3600 * 1000);
	await prisma.ai_search_cache.deleteMany({ where: { created_at: { lt: cutoff.toISOString() } } });
}
