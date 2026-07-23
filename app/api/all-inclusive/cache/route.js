import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
	try {
		const { count } = await prisma.ai_search_cache.deleteMany();
		return NextResponse.json({ success: true, deleted: count });
	} catch (err) {
		return NextResponse.json({ success: false, message: err.message }, { status: 500 });
	}
}
