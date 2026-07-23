import * as cheerio from "cheerio";
import { ACV_BASE, ACV_HEADERS, AERIA_CSS, rewriteUrl } from "@/lib/acv";

export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const url = searchParams.get("url");
	if (!url || !url.startsWith(ACV_BASE)) {
		return Response.json({ error: "URL non autorisée" }, { status: 403 });
	}

	try {
		const response = await fetch(url, { headers: ACV_HEADERS });
		if (!response.ok) return new Response("Erreur ACV", { status: response.status });
		const html = await response.text();
		const $ = cheerio.load(html);

		$("[href]").each((_, el)     => { const v = $(el).attr("href");     if (v) $(el).attr("href", rewriteUrl(v)); });
		$("[src]").each((_, el)      => { const v = $(el).attr("src");      if (v) $(el).attr("src", rewriteUrl(v)); });
		$("[action]").each((_, el)   => { const v = $(el).attr("action");   if (v) $(el).attr("action", rewriteUrl(v)); });
		$("[data-src]").each((_, el) => { const v = $(el).attr("data-src"); if (v) $(el).attr("data-src", rewriteUrl(v)); });

		$('meta[http-equiv="Content-Security-Policy"]').remove();
		$('meta[http-equiv="X-Frame-Options"]').remove();
		$("head").append(AERIA_CSS);

		return new Response($.html(), {
			headers: {
				"Content-Type": "text/html; charset=utf-8",
				"X-Frame-Options": "SAMEORIGIN",
			},
		});
	} catch (err) {
		return Response.json({ error: err.message }, { status: 500 });
	}
}
