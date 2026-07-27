// lib/ghost.js
// Client Ghost Content API — une instance par langue.

const GHOST = {
	fr: { url: process.env.GHOST_FR_URL, key: process.env.GHOST_FR_KEY },
	en: { url: process.env.GHOST_EN_URL, key: process.env.GHOST_EN_KEY },
};

// 15 min : le VPS n'est rappelé qu'une fois par quart d'heure, peu importe le trafic.
const REVALIDATE = 900;

const LIST_FIELDS = ["id", "title", "slug", "excerpt", "custom_excerpt", "feature_image", "feature_image_alt", "published_at", "reading_time"].join(",");

/** Normalise n'importe quelle valeur de locale vers "fr" ou "en". */
export function toLang(locale) {
	return locale === "en" ? "en" : "fr";
}

async function ghostFetch(lang, resource, params) {
	const cfg = GHOST[lang];
	if (!cfg?.url || !cfg?.key) {
		console.error(`Ghost ${lang} : URL ou clé manquante dans .env`);
		return null;
	}

	const qs = new URLSearchParams({ key: cfg.key, ...params });

	try {
		const res = await fetch(`${cfg.url}/ghost/api/content/${resource}?${qs}`, {
			next: { revalidate: REVALIDATE },
		});
		if (!res.ok) {
			console.error(`Ghost ${lang} ${resource} : ${res.status}`);
			return null;
		}
		return await res.json();
	} catch (err) {
		console.error(`Ghost ${lang} injoignable`, err);
		return null;
	}
}

/** Liste paginée. Retourne toujours un objet — jamais d'exception qui casse la page. */
export async function getPosts(lang, { page = 1, limit = 9, tag } = {}) {
	const params = {
		limit: String(limit),
		page: String(page),
		fields: LIST_FIELDS,
		include: "tags,authors",
		order: "published_at desc",
	};
	if (tag) params.filter = `tag:${tag}`;

	const data = await ghostFetch(lang, "posts/", params);

	return {
		posts: data?.posts ?? [],
		pagination: data?.meta?.pagination ?? { page: 1, pages: 1, total: 0 },
	};
}

/** Un article complet, avec son HTML. */
export async function getPost(lang, slug) {
	const data = await ghostFetch(lang, `posts/slug/${slug}/`, {
		include: "tags,authors",
	});
	return data?.posts?.[0] ?? null;
}

/** Tous les slugs — pour generateStaticParams. */
export async function getAllSlugs(lang) {
	const data = await ghostFetch(lang, "posts/", {
		limit: "all",
		fields: "slug",
	});
	return data?.posts?.map((p) => p.slug) ?? [];
}

/** Tags publics ayant au moins un article — pour la barre de filtres. */
export async function getTags(lang) {
	const data = await ghostFetch(lang, "tags/", {
		limit: "all",
		include: "count.posts",
		filter: "visibility:public",
	});
	return (data?.tags ?? []).filter((t) => (t.count?.posts ?? 0) > 0);
}

/** Articles récents hors article courant — bloc « à lire ensuite ». */
export async function getRelated(lang, slug, limit = 3) {
	const data = await ghostFetch(lang, "posts/", {
		limit: String(limit),
		fields: LIST_FIELDS,
		include: "tags",
		filter: `slug:-${slug}`,
		order: "published_at desc",
	});
	return data?.posts ?? [];
}

export function formatDate(iso, lang) {
	return new Date(iso).toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

export function summarize(post, max = 160) {
	const raw = post.custom_excerpt || post.excerpt || "";
	const clean = raw.replace(/\s+/g, " ").trim();
	return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}
