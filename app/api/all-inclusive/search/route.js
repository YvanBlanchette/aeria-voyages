import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import { PROVIDER_BASE, fetchHtml, parseListePage, cacheGet, cacheSet } from "@/lib/all-inclusive";

export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const orig = searchParams.get("orig") || "montreal";
	const dest = searchParams.get("dest") || "tout-le-sud";
	const dep = searchParams.get("dep");
	const flex = searchParams.get("flex") || "3";
	const n = searchParams.get("n") || "7";
	const toutinclus = searchParams.get("toutinclus") || "1";

	const depParam = dep || (() => {
		const d = new Date();
		d.setDate(d.getDate() + 30);
		const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
		return `${d.getDate()}${months[d.getMonth()]}${d.getFullYear()}`;
	})();

	const cacheKey = `${orig}|${dest}|${depParam}|${flex}|${n}`;

	try {
		const cached = await cacheGet(cacheKey);
		if (cached) {
			return NextResponse.json({ success: true, cached: true, ...JSON.parse(cached) });
		}
	} catch (err) {
		console.warn("[all-inclusive] cache read error:", err.message);
	}

	const qs = new URLSearchParams({ orig, dep: depParam, flex, n });
	if (toutinclus === "1") qs.append("toutinclus", "");
	const fetchUrl = `${PROVIDER_BASE}/${dest}/tous-les-hotels?${qs.toString()}`;

	try {
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

		return NextResponse.json({ success: true, cached: false, ...payload });
	} catch (err) {
		console.error("[all-inclusive] search error:", err.message);
		return NextResponse.json({ success: false, message: err.message }, { status: 500 });
	}
}
