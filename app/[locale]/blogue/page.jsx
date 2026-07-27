// app/[locale]/blogue/page.jsx
import Link from "next/link";
import { getPosts, getTags, toLang } from "@/lib/ghost";
import PostCard from "@/components/blog/PostCard";
import MainLayout from "@/components/layout/MainLayout";
import "./blogue.css";

export const revalidate = 900;

const PER_PAGE = 9;

const t = {
	fr: {
		eyebrow: "Carnet de route",
		title: "Le Blogue",
		lede: "Récits d'escales, conseils de conseiller et coulisses de la préparation d'un voyage. Ce que je retiens du terrain, pour que vos départs soient plus faciles.",
		highlight: "A la une",
		latest: "Derniers articles",
		all: "Tous les sujets",
		filters: "Filtres par sujet",
		skip: "Aller au contenu",
		empty: "Aucun article pour le moment. Revenez bientôt.",
		prev: "Précédent",
		next: "Suivant",
		page: "Page",
		of: "sur",
		goToPage: "Aller a la page",
	},
	en: {
		eyebrow: "Field notes",
		title: "The Blog",
		lede: "Port stories, advisor tips, and what goes on behind a well-planned trip. Lessons from the road, so your departures are easier.",
		highlight: "Spotlight",
		latest: "Latest stories",
		all: "All topics",
		filters: "Topic filters",
		skip: "Skip to content",
		empty: "No posts yet. Check back soon.",
		prev: "Previous",
		next: "Next",
		page: "Page",
		of: "of",
		goToPage: "Go to page",
	},
};

export async function generateMetadata({ params }) {
	const { locale } = await params;
	const copy = t[toLang(locale)];
	return {
		title: `${copy.title} | ÆRIA Voyages`,
		description: copy.lede,
		alternates: { canonical: `/${locale}/blogue` },
	};
}

export default async function BloguePage({ params, searchParams }) {
	const { locale } = await params;
	const { page: rawPage, tag } = await searchParams;

	const lang = toLang(locale);
	const copy = t[lang];
	const page = Math.max(1, Number(rawPage) || 1);
	const isFiltered = Boolean(tag);

	const [{ posts, pagination }, tags] = await Promise.all([getPosts(lang, { page, limit: PER_PAGE, tag }), getTags(lang)]);

	const buildHref = (next) => {
		const qs = new URLSearchParams();
		const nextTag = next.tag ?? tag;
		if (nextTag) qs.set("tag", nextTag);
		if (next.page && next.page > 1) qs.set("page", String(next.page));
		const q = qs.toString();
		return `/${lang}/blogue${q ? `?${q}` : ""}`;
	};

	const featuredPost = page === 1 && !isFiltered && posts.length > 0 ? posts[0] : null;
	const gridPosts = featuredPost ? posts.slice(1) : posts;

	const buildPageWindow = (current, total) => {
		if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

		const windowStart = Math.max(2, current - 1);
		const windowEnd = Math.min(total - 1, current + 1);
		const pages = [1];

		if (windowStart > 2) pages.push("ellipsis-left");
		for (let p = windowStart; p <= windowEnd; p += 1) pages.push(p);
		if (windowEnd < total - 1) pages.push("ellipsis-right");
		pages.push(total);

		return pages;
	};

	const pageWindow = buildPageWindow(page, pagination.pages);

	return (
		<MainLayout navbarVariant="white">
			<main className="aeria-blogue min-h-screen pt-18">
				<a
					href="#blogue-content"
					className="aeria-skip-link"
				>
					{copy.skip}
				</a>

				{/* ---------- En-tête ---------- */}
				<header className="mx-auto max-w-6xl px-6 pb-14 pt-16 md:pt-22">
					<p className="aeria-eyebrow">{copy.eyebrow}</p>
					<h1 className="aeria-display mt-4 text-5xl md:text-7xl">{copy.title}</h1>
					<p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-[var(--muted)]">{copy.lede}</p>

					{featuredPost && (
						<section className="aeria-featured-panel mt-10">
							<p className="aeria-eyebrow">{copy.highlight}</p>
							<div className="mt-4">
								<PostCard
									post={featuredPost}
									lang={lang}
									featured
									priority
								/>
							</div>
						</section>
					)}
				</header>

				{/* ---------- Filtres par sujet ---------- */}
				{tags.length > 0 && (
					<nav
						aria-label={copy.filters}
						className="aeria-filter-nav mx-auto max-w-6xl overflow-x-auto px-6"
					>
						<ul className="flex min-w-max gap-3 py-4">
							<li>
								<Link
									href={buildHref({ page: 1, tag: "" })}
									aria-current={!tag ? "page" : undefined}
									className={`aeria-filter-chip ${
										!tag ? "aeria-filter-chip-active" : "aeria-filter-chip-idle"
									}`}
								>
									{copy.all}
								</Link>
							</li>
							{tags.map((item) => (
								<li key={item.id}>
									<Link
										href={buildHref({ page: 1, tag: item.slug })}
										aria-current={tag === item.slug ? "page" : undefined}
										className={`aeria-filter-chip ${
											tag === item.slug ? "aeria-filter-chip-active" : "aeria-filter-chip-idle"
										}`}
									>
										{item.name}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				)}

				{/* ---------- Grille ---------- */}
				<section
					id="blogue-content"
					className="mx-auto max-w-6xl px-6 py-16"
				>
					<p className="aeria-eyebrow mb-6">{copy.latest}</p>

					{posts.length === 0 ? (
						<p className="py-24 text-center text-[var(--muted)]">{copy.empty}</p>
					) : (
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{gridPosts.map((post, i) => (
								<PostCard
									key={post.id}
									post={post}
									lang={lang}
									priority={!featuredPost && i === 0}
								/>
							))}
						</div>
					)}

					{/* ---------- Pagination ---------- */}
					{pagination.pages > 1 && (
						<nav
							aria-label="Pagination"
							className="mt-16 flex flex-wrap items-center justify-center gap-3 border-t border-[var(--line)] pt-8"
						>
							{page > 1 ? (
								<Link
									href={buildHref({ page: page - 1 })}
									rel="prev"
									className="aeria-pagination-link"
								>
									← {copy.prev}
								</Link>
							) : (
								<span className="aeria-pagination-link aeria-pagination-link-disabled">← {copy.prev}</span>
							)}

							<div className="flex items-center gap-2">
								{pageWindow.map((item, idx) => {
									if (typeof item !== "number") {
										return (
											<span
												key={`${item}-${idx}`}
												className="aeria-pagination-ellipsis"
											>
												...
											</span>
										);
									}

									const isCurrent = item === page;

									return (
										<Link
											key={item}
											href={buildHref({ page: item })}
											aria-current={isCurrent ? "page" : undefined}
											aria-label={`${copy.goToPage} ${item}`}
											className={`aeria-pagination-number ${isCurrent ? "aeria-pagination-number-active" : ""}`}
										>
											{item}
										</Link>
									);
								})}
							</div>

							{page < pagination.pages ? (
								<Link
									href={buildHref({ page: page + 1 })}
									rel="next"
									className="aeria-pagination-link"
								>
									{copy.next} →
								</Link>
							) : (
								<span className="aeria-pagination-link aeria-pagination-link-disabled">{copy.next} →</span>
							)}
						</nav>
					)}
				</section>
			</main>
		</MainLayout>
	);
}
