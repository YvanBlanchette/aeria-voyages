import { NextResponse } from "next/server";

export function parseJSON(val) {
	try {
		return JSON.parse(val);
	} catch {
		return val;
	}
}

/**
 * JSON response for data that changes at scraper cadence, not per-request —
 * cruises/circuits/destinations listings. `s-maxage` lets a reverse proxy/CDN
 * serve cached copies for an hour, `stale-while-revalidate` lets it keep
 * serving a stale copy for a day while refreshing in the background.
 */
export function cachedJson(data, init) {
	const response = NextResponse.json(data, init);
	response.headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
	return response;
}
