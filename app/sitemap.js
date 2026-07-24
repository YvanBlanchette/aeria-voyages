import { routing } from "@/i18n/routing";

const BASE_URL = "https://aeriavoyages.com";
const ROUTES = [
	{ path: "", changeFrequency: "daily", priority: 1 },
	{ path: "/submission", changeFrequency: "monthly", priority: 0.7 },
	{ path: "/blogue", changeFrequency: "weekly", priority: 0.6 },
];

export default function sitemap() {
	const now = new Date();

	return routing.locales.flatMap((locale) =>
		ROUTES.map(({ path, changeFrequency, priority }) => ({
			url: `${BASE_URL}/${locale}${path}`,
			lastModified: now,
			changeFrequency,
			priority,
		})),
	);
}
