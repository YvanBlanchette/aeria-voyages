import { NextResponse } from "next/server";
import { DESTINATIONS } from "@/lib/all-inclusive";

export async function GET() {
	return NextResponse.json(DESTINATIONS);
}
