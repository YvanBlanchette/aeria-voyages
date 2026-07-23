import { PROVIDER_BASE, HTTP_HEADERS, decodeToken } from "@/lib/all-inclusive";

export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const token = searchParams.get("token");
	if (!token) return new Response(null, { status: 400 });

	let imgUrl;
	try {
		imgUrl = decodeToken(token);
	} catch {
		return new Response(null, { status: 400 });
	}
	if (!imgUrl.startsWith(PROVIDER_BASE)) return new Response(null, { status: 403 });

	try {
		const response = await fetch(imgUrl, { headers: HTTP_HEADERS });
		if (!response.ok) return new Response(null, { status: 404 });
		const buffer = await response.arrayBuffer();
		return new Response(buffer, {
			headers: {
				"Content-Type": response.headers.get("content-type") || "image/jpeg",
				"Cache-Control": "public, max-age=86400",
			},
		});
	} catch {
		return new Response(null, { status: 404 });
	}
}
