import fs from "node:fs/promises";

const WD_SEARCH = "https://www.wikidata.org/w/api.php";
const WD_SPARQL = "https://query.wikidata.org/sparql";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function createSpinner(text = "Loading") {
	const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
	let i = 0;
	let timer;

	return {
		start() {
			process.stdout.write("\n");
			timer = setInterval(() => {
				process.stdout.write(`\r${frames[i++ % frames.length]} ${text}`);
			}, 80);
		},
		stop(msg = "Done") {
			clearInterval(timer);
			process.stdout.write(`\r✔ ${msg}\n`);
		},
		update(newText) {
			text = newText;
		},
	};
}

async function wikidataSearchEntityId(name) {
	const url = new URL(WD_SEARCH);
	url.searchParams.set("action", "wbsearchentities");
	url.searchParams.set("format", "json");
	url.searchParams.set("language", "en");
	url.searchParams.set("limit", "1");
	url.searchParams.set("search", name);
	url.searchParams.set("origin", "*");

	const res = await fetch(url, { headers: { "User-Agent": "AERIA-ports-bot/1.0" } });
	if (!res.ok) throw new Error(`Wikidata search failed for "${name}" (${res.status})`);
	const data = await res.json();
	const hit = data?.search?.[0];
	return hit?.id || null; // ex: "Q130309"
}

function buildShipsByOperatorQuery(operatorQid) {
	// Heuristique simple et efficace:
	// - navire avec opérateur (P137) = compagnie
	// - et un IMO (P458) pour éviter de ramasser n’importe quoi
	// - on sort le label
	return `
SELECT ?ship ?shipLabel WHERE {
  ?ship wdt:P137 wd:${operatorQid} .
  ?ship wdt:P458 ?imo .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr". }
}
ORDER BY ?shipLabel
`;
}

async function sparql(query) {
	const res = await fetch(`${WD_SPARQL}?format=json&query=${encodeURIComponent(query)}`, {
		headers: {
			Accept: "application/sparql-results+json",
			"User-Agent": "AERIA-ports-bot/1.0",
		},
	});
	if (!res.ok) throw new Error(`SPARQL failed (${res.status})`);
	return res.json();
}

function uniqSorted(arr) {
	return [...new Set(arr)].sort((a, b) => a.localeCompare(b, "en"));
}

async function main() {
	const configPath = process.argv[2] || "cruise-lines.config.json";
	const outPath = process.argv[3] || "cruiseShipsByLine.json";

	const raw = await fs.readFile(configPath, "utf8");
	const config = JSON.parse(raw);

	const resultsByLine = {};
	const meta = {
		generatedAt: new Date().toISOString(),
		source: "Wikidata Query Service",
		linesNotFound: [],
		linesNoShipsReturned: [],
	};

	// Aplatit les compagnies uniques (une compagnie peut être dans 2 segments si tu veux)
	const allLines = uniqSorted(Object.values(config).flat().filter(Boolean));

	for (const lineName of allLines) {
		// 1) trouve QID
		const qid = await wikidataSearchEntityId(lineName);
		if (!qid) {
			meta.linesNotFound.push(lineName);
			continue;
		}

		// petite pause gentille, sinon tu te fais throttle si tu en as 200
		await sleep(150);

		// 2) query navires
		const query = buildShipsByOperatorQuery(qid);
		let data;
		try {
			data = await sparql(query);
		} catch (e) {
			// Si SPARQL rate, on skip sans tuer tout le run
			meta.linesNoShipsReturned.push(`${lineName} (SPARQL error)`);
			continue;
		}

		const ships = (data?.results?.bindings || []).map((b) => b?.shipLabel?.value).filter(Boolean);

		const cleanShips = uniqSorted(ships);

		if (cleanShips.length === 0) {
			meta.linesNoShipsReturned.push(lineName);
		} else {
			resultsByLine[lineName] = cleanShips;
		}

		await sleep(150);
	}

	const out = {
		meta,
		segments: config,
		shipsByLine: resultsByLine,
	};

	await fs.writeFile(outPath, JSON.stringify(out, null, 2), "utf8");

	console.log(`Done. Wrote ${outPath}`);
	console.log(`Lines with ships: ${Object.keys(resultsByLine).length}/${allLines.length}`);
	if (meta.linesNotFound.length) console.log("Not found:", meta.linesNotFound);
	if (meta.linesNoShipsReturned.length) console.log("No ships returned:", meta.linesNoShipsReturned);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
