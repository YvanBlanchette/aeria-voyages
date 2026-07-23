import { prisma } from "@/lib/prisma";

let portNomsPromise = null;
let usPortsPromise = null;

async function loadPortNoms() {
	const rows = await prisma.ports.findMany({ select: { code: true, nom: true } });
	return rows.reduce((acc, r) => {
		acc[r.code] = r.nom;
		return acc;
	}, {});
}

async function loadUsPorts() {
	const rows = await prisma.ports.findMany({ where: { est_usa: 1 }, select: { code: true } });
	return new Set(rows.map((r) => r.code));
}

export function getPortNoms() {
	if (!portNomsPromise) portNomsPromise = loadPortNoms();
	return portNomsPromise;
}

export function getUsPorts() {
	if (!usPortsPromise) usPortsPromise = loadUsPorts();
	return usPortsPromise;
}

export function resoudrePortSync(code, portNoms) {
	if (!code || code === "N/A") return code;
	const s = code.trim();
	if (s.includes(" ") || s.includes(",")) return s;
	return portNoms[s] ?? s;
}

export function hasUsPortSync(portDepart, portsCsv, usPorts) {
	if (portDepart && usPorts.has(portDepart.trim())) return true;
	if (portsCsv) {
		for (const code of portsCsv.split(",")) {
			if (usPorts.has(code.trim())) return true;
		}
	}
	return false;
}
