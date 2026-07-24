const BASE_URL = "https://aeriavoyages.com";

export default function robots() {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: "/api/",
		},
		sitemap: `${BASE_URL}/sitemap.xml`,
	};
}
