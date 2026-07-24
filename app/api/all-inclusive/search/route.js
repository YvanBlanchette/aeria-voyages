import { NextResponse } from "next/server";
import { searchAllInclusive } from "@/lib/data/all-inclusive";

export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const orig = searchParams.get("orig") || "montreal";
	const dest = searchParams.get("dest") || "tout-le-sud";
	const dep = searchParams.get("dep");
	const flex = searchParams.get("flex") || "3";
	const n = searchParams.get("n") || "7";
	const toutinclus = searchParams.get("toutinclus") || "1";

	try {
		const result = await searchAllInclusive({ orig, dest, dep, flex, n, toutinclus });
		return NextResponse.json(result);
	} catch (err) {
		console.error("[all-inclusive] search error:", err.message);
		return NextResponse.json({ success: false, message: err.message }, { status: 500 });
	}
}
