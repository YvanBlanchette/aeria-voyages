import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import { PROVIDER_BASE, fetchHtml, parseDetailPage, decodeToken } from "@/lib/all-inclusive";

export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const token = searchParams.get("token");
	if (!token) return NextResponse.json({ success: false, message: "Token manquant." }, { status: 400 });

	let fetchUrl;
	try {
		const href = decodeToken(token);
		fetchUrl = `${PROVIDER_BASE}${href}`;
	} catch {
		return NextResponse.json({ success: false, message: "Token invalide." }, { status: 400 });
	}
	if (!fetchUrl.startsWith(PROVIDER_BASE)) {
		return NextResponse.json({ success: false, message: "Accès non autorisé." }, { status: 400 });
	}

	try {
		const detail = parseDetailPage(await fetchHtml(fetchUrl), cheerio);
		return NextResponse.json({ success: true, data: detail });
	} catch (err) {
		console.error("[all-inclusive] detail error:", err.message);
		return NextResponse.json({ success: false, message: err.message }, { status: 500 });
	}
}
