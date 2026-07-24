import { NextResponse } from "next/server";
import { getCroisieresMeta } from "@/lib/data/croisieres";
import { cachedJson } from "@/lib/api-utils";

export async function GET() {
	try {
		const meta = await getCroisieresMeta();
		return cachedJson(meta);
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
