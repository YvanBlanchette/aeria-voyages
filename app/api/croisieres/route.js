import { NextResponse } from "next/server";
import { getCroisieresPage } from "@/lib/data/croisieres";
import { cachedJson } from "@/lib/api-utils";

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const params = Object.fromEntries(searchParams.entries());
		const result = await getCroisieresPage(params);
		return cachedJson(result);
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
