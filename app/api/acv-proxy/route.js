import { ACV_BASE, ACV_HEADERS, mimeFromPath } from "@/lib/acv";

export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const url = searchParams.get("url");
	if (!url || !url.startsWith(ACV_BASE)) {
		return new Response(null, { status: 403 });
	}

	try {
		const response = await fetch(url, { headers: ACV_HEADERS });
		if (!response.ok) return new Response(null, { status: response.status });

		const forcedMime = mimeFromPath(url.split("?")[0]);
		const contentType = forcedMime ?? response.headers.get("content-type") ?? "application/octet-stream";

		const headers = {
			"Content-Type": contentType,
			"Cache-Control": "public, max-age=3600",
		};

		if (contentType.includes("text/css")) {
			let css = await response.text();
			css = css.replace(/url\(["']?(\/[^)"'\s]+)["']?\)/g, (_, p) => {
				return 'url("/api/acv-proxy?url=' + encodeURIComponent(ACV_BASE + p) + '")';
			});
			return new Response(css, { headers });
		}

		const buffer = await response.arrayBuffer();
		return new Response(buffer, { headers });
	} catch (err) {
		return new Response(null, { status: 500 });
	}
}
