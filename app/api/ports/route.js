import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const rows = await prisma.ports.findMany({ select: { code: true, nom: true } });
		const dict = {};
		for (const r of rows) dict[r.code] = r.nom;
		return NextResponse.json(dict);
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
