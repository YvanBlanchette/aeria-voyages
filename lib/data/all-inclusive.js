import * as cheerio from "cheerio";
import { PROVIDER_BASE, DESTINATIONS, ORIGINES, fetchHtml, parseListePage, cacheGet, cacheSet } from "@/lib/all-inclusive";

function defaultDepParam() {
	const d = new Date();
	d.setDate(d.getDate() + 30);
	const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
	return `${d.getDate()}${months[d.getMonth()]}${d.getFullYear()}`;
}

/**
 * Shared by app/api/all-inclusive/search/route.js (client-side refetches)
 * and app/[locale]/page.js (server-rendered initial search — orig=montreal,
 * dest=tout-le-sud, the same defaults the search panel starts with).
 */
export async function searchAllInclusive({
	orig = "montreal",
	dest = "tout-le-sud",
	dep,
	flex = "3",
	n = "7",
	toutinclus = "1",
} = {}) {
	const depParam = dep || defaultDepParam();
	const cacheKey = `${orig}|${dest}|${depParam}|${flex}|${n}`;

	try {
		const cached = await cacheGet(cacheKey);
		if (cached) {
			return { success: true, cached: true, ...JSON.parse(cached) };
		}
	} catch (err) {
		console.warn("[all-inclusive] cache read error:", err.message);
	}

	const qs = new URLSearchParams({ orig, dep: depParam, flex, n });
	if (toutinclus === "1") qs.append("toutinclus", "");
	const fetchUrl = `${PROVIDER_BASE}/${dest}/tous-les-hotels?${qs.toString()}`;

	const packages = parseListePage(await fetchHtml(fetchUrl), cheerio);

	const payload = {
		total: packages.length,
		params: { orig, dest, dep: depParam, flex, n, toutinclus },
		data: packages,
	};

	try {
		await cacheSet(cacheKey, JSON.stringify(payload));
	} catch (err) {
		console.warn("[all-inclusive] cache write error:", err.message);
	}

	return { success: true, cached: false, ...payload };
}

export function getStaticData() {
	return { destinations: DESTINATIONS, origines: ORIGINES };
}
