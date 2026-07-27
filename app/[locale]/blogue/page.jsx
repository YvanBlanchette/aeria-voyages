// app/[locale]/blogue/page.jsx
import Link from "next/link";
import { getPosts, getTags, toLang } from "@/lib/ghost";
import PostCard from "@/components/blog/PostCard";
import "./blogue.css";

export const revalidate = 900;

const PER_PAGE = 9;

const t = {
	fr: {
		eyebrow: "Carnet de route",
		title: "Le Blogue",
		lede: "Récits d'escales, conseils de conseiller et coulisses de la préparation d'un voyage. Ce que je retiens du terrain, pour que vos départs soient plus faciles.",
		all: "Tous les sujets",
		empty: "Aucun article pour le moment. Revenez bientôt.",
		prev: "Précédent",
		next: "Suivant",
		page: "Page",
		of: "sur",
	},
	en: {
		eyebrow: "Field notes",
		title: "The Blog",
		lede: "Port stories, advisor tips, and what goes on behind a well-planned trip. Lessons from the road, so your departures are easier.",
		all: "All topics",
		empty: "No posts yet. Check back soon.",
		prev: "Previous",
		next: "Next",
		page: "Page",
		of: "of",
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

	const [{ posts, pagination }, tags] = await Promise.all([getPosts(lang, { page, limit: PER_PAGE, tag }), getTags(lang)]);

	const buildHref = (next) => {
		const qs = new URLSearchParams();
		const nextTag = next.tag ?? tag;
		if (nextTag) qs.set("tag", nextTag);
		if (next.page && next.page > 1) qs.set("page", String(next.page));
		const q = qs.toString();
		return `/${lang}/blogue${q ? `?${q}` : ""}`;
	};

	return (
		<main className="aeria-blogue min-h-screen">
			{/* ---------- En-tête ---------- */}
			<header className="mx-auto max-w-6xl px-6 pb-14 pt-24 md:pt-32">
				<p className="aeria-eyebrow">{copy.eyebrow}</p>
				<h1 className="aeria-display mt-4 text-5xl md:text-7xl">{copy.title}</h1>
				<p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-[var(--muted)]">{copy.lede}</p>
			</header>

			{/* ---------- Filtres par sujet ---------- */}
			{tags.length > 0 && (
				<nav
					aria-label={copy.all}
					className="mx-auto max-w-6xl overflow-x-auto border-y border-[var(--line)] px-6"
				>
					<ul className="flex min-w-max gap-6 py-4">
						<li>
							<Link
								href={buildHref({ page: 1, tag: "" })}
								aria-current={!tag ? "page" : undefined}
								className={`text-[0.75rem] uppercase tracking-[0.16em] transition-colors ${
									!tag ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--text)]"
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
									className={`text-[0.75rem] uppercase tracking-[0.16em] transition-colors ${
										tag === item.slug ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--text)]"
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
			<section className="mx-auto max-w-6xl px-6 py-16">
				{posts.length === 0 ? (
					<p className="py-24 text-center text-[var(--muted)]">{copy.empty}</p>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{posts.map((post, i) => (
							<PostCard
								key={post.id}
								post={post}
								lang={lang}
								featured={i === 0 && page === 1 && !tag}
								priority={i === 0}
							/>
						))}
					</div>
				)}

				{/* ---------- Pagination ---------- */}
				{pagination.pages > 1 && (
					<nav
						aria-label="Pagination"
						className="mt-16 flex items-center justify-center gap-8 border-t border-[var(--line)] pt-8"
					>
						{page > 1 ? (
							<Link
								href={buildHref({ page: page - 1 })}
								rel="prev"
								className="text-[0.75rem] uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
							>
								← {copy.prev}
							</Link>
						) : (
							<span className="text-[0.75rem] uppercase tracking-[0.16em] text-[var(--line)]">← {copy.prev}</span>
						)}

						<span className="text-[0.75rem] uppercase tracking-[0.16em] text-[var(--muted)]">
							{copy.page} {pagination.page} {copy.of} {pagination.pages}
						</span>

						{page < pagination.pages ? (
							<Link
								href={buildHref({ page: page + 1 })}
								rel="next"
								className="text-[0.75rem] uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
							>
								{copy.next} →
							</Link>
						) : (
							<span className="text-[0.75rem] uppercase tracking-[0.16em] text-[var(--line)]">{copy.next} →</span>
						)}
					</nav>
				)}
			</section>
		</main>
	);
}
