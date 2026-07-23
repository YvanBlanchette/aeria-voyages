import { NextResponse } from "next/server";
import { ORIGINES } from "@/lib/all-inclusive";

export async function GET() {
	return NextResponse.json(ORIGINES);
}
