import { fileURLToPath } from "node:url";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
	turbopack: {
		root: projectRoot,
	},
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "aeriavoyages.com" },
			{ protocol: "https", hostname: "blog.aeriavoyages.com" },
			{ protocol: "https", hostname: "blogue.aeriavoyages.com" },
			{ protocol: "https", hostname: "res-1.cloudinary.com" },
			{ protocol: "https", hostname: "res-2.cloudinary.com" },
			{ protocol: "https", hostname: "res-3.cloudinary.com" },
			{ protocol: "https", hostname: "res-4.cloudinary.com" },
			{ protocol: "https", hostname: "static-ca.exoticca.com" },
			{ protocol: "https", hostname: "vacations.aircanada.com" },
			{ protocol: "https", hostname: "www.tripoppo.com" },
		],
		// Le token est une chaîne base64 dynamique — pas de valeur "search" fixe
		// possible. La route elle-même valide déjà que le token décodé pointe
		// vers PROVIDER_BASE avant de proxifier (voir app/api/all-inclusive/img).
		localPatterns: [{ pathname: "/api/all-inclusive/img" }],
	},
	async headers() {
		return [
			{
				// SAMEORIGIN (not DENY) to match what app/api/circuits/acv/page/route.js
				// already sets on its own response — it deliberately serves ACV's page
				// content for same-origin framing.
				source: "/(.*)",
				headers: [
					{ key: "X-Frame-Options", value: "SAMEORIGIN" },
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
				],
			},
		];
	},
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
