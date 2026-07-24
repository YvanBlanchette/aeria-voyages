import { NextResponse } from "next/server";
import { getExoticcaCircuits } from "@/lib/data/circuits";
import { cachedJson } from "@/lib/api-utils";

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const region = searchParams.get("region");
		const circuits = await getExoticcaCircuits(region);
		return cachedJson(circuits);
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
