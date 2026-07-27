// app/[locale]/blogue/[slug]/page.jsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getAllSlugs, getPost, getRelated, summarize, toLang } from "@/lib/ghost";
import PostCard from "@/components/blog/PostCard";
import MainLayout from "@/components/layout/MainLayout";
import "../blogue.css";

export const revalidate = 900;
// Un slug inconnu est rendu à la demande puis mis en cache.
export const dynamicParams = true;

const t = {
	fr: {
		back: "Retour au blogue",
		by: "Par",
		read: "min de lecture",
		next: "À lire ensuite",
		ctaEyebrow: "Envie de partir ?",
		ctaTitle: "Transformons cette lecture en départ",
		ctaBody: "Dites-moi ce qui vous fait rêver. Je m'occupe des itinéraires, des tarifs et des détails que personne n'aime gérer.",
		ctaButton: "Planifier un voyage",
	},
	en: {
		back: "Back to the blog",
		by: "By",
		read: "min read",
		next: "Read next",
		ctaEyebrow: "Ready to go?",
		ctaTitle: "Let's turn this into a departure",
		ctaBody: "Tell me what you have in mind. I'll handle the itineraries, the pricing, and the details nobody enjoys sorting out.",
		ctaButton: "Plan a trip",
	},
};

export async function generateStaticParams() {
	const [fr, en] = await Promise.all([getAllSlugs("fr"), getAllSlugs("en")]);
	return [...fr.map((slug) => ({ locale: "fr", slug })), ...en.map((slug) => ({ locale: "en", slug }))];
}

export async function generateMetadata({ params }) {
	const { locale, slug } = await params;
	const lang = toLang(locale);
	const post = await getPost(lang, slug);
	if (!post) return { title: "ÆRIA Voyages" };

	const description = summarize(post, 160);

	return {
		title: `${post.title} | ÆRIA Voyages`,
		description,
		alternates: { canonical: `/${lang}/blogue/${post.slug}` },
		openGraph: {
			type: "article",
			title: post.title,
			description,
			publishedTime: post.published_at,
			images: post.feature_image ? [post.feature_image] : undefined,
		},
	};
}

export default async function ArticlePage({ params }) {
	const { locale, slug } = await params;
	const lang = toLang(locale);
	const copy = t[lang];

	const post = await getPost(lang, slug);
	if (!post) notFound();

	const related = await getRelated(lang, slug, 3);
	const author = post.authors?.[0];
	const tag = post.primary_tag ?? post.tags?.[0];

	return (
		<MainLayout navbarVariant="white">
			<main className="aeria-blogue min-h-screen pt-18">
				<article>
					{/* ---------- En-tête ---------- */}
					<header className="mx-auto max-w-3xl px-6 pb-12 pt-16 md:pt-22">
						<Link
							href={`/${lang}/blogue`}
							className="inline-flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
						>
							← {copy.back}
						</Link>

						{tag && <p className="aeria-eyebrow mt-10">{tag.name}</p>}

						<h1 className="aeria-display mt-4 text-4xl md:text-6xl">{post.title}</h1>

						<div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--line)] pt-6 text-[0.8125rem] text-[var(--muted)]">
							{author && (
								<>
									<span>
										{copy.by} {author.name}
									</span>
									<span
										aria-hidden
										className="text-[var(--line)]"
									>
										/
									</span>
								</>
							)}
							<time dateTime={post.published_at}>{formatDate(post.published_at, lang)}</time>
							<span
								aria-hidden
								className="text-[var(--line)]"
							>
								/
							</span>
							<span>
								{post.reading_time || 1} {copy.read}
							</span>
						</div>
					</header>

					{/* ---------- Image de couverture ---------- */}
					{post.feature_image && (
						<figure className="mx-auto max-w-5xl px-6">
							<div className="relative aspect-[16/9] overflow-hidden">
								<Image
									src={post.feature_image}
									alt={post.feature_image_alt || post.title}
									fill
									sizes="(max-width: 1024px) 100vw, 64rem"
									className="object-cover"
									priority
								/>
							</div>
						</figure>
					)}

					{/* ---------- Corps ---------- */}
					<div
						className="aeria-prose mx-auto max-w-[42rem] px-6 py-16"
						dangerouslySetInnerHTML={{ __html: post.html ?? "" }}
					/>

					{/* ---------- Tags ---------- */}
					{post.tags?.length > 0 && (
						<div className="mx-auto flex max-w-[42rem] flex-wrap gap-3 px-6 pb-16">
							{post.tags.map((item) => (
								<Link
									key={item.id}
									href={`/${lang}/blogue?tag=${item.slug}`}
									className="border border-[var(--line)] px-3 py-1.5 text-[0.6875rem] uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
								>
									{item.name}
								</Link>
							))}
						</div>
					)}
				</article>

				{/* ---------- Appel à l'action ---------- */}
				<aside className="mx-auto max-w-[42rem] px-6 pb-20">
					<div className="border border-[var(--line)] bg-[var(--surface)] p-9 text-center">
						<p className="aeria-eyebrow">{copy.ctaEyebrow}</p>
						<h2 className="aeria-display mt-3 text-3xl">{copy.ctaTitle}</h2>
						<p className="mx-auto mt-4 max-w-md text-[0.9375rem] leading-relaxed text-[var(--muted)]">{copy.ctaBody}</p>
						<Link
							href="/submission"
							className="mt-7 inline-block border border-[var(--accent)] px-7 py-3 text-[0.75rem] uppercase tracking-[0.18em] text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--ink)]"
						>
							{copy.ctaButton}
						</Link>
					</div>
				</aside>

				{/* ---------- À lire ensuite ---------- */}
				{related.length > 0 && (
					<section className="mx-auto max-w-6xl border-t border-[var(--line)] px-6 py-16">
						<h2 className="aeria-eyebrow">{copy.next}</h2>
						<div className="mt-8 grid gap-6 md:grid-cols-3">
							{related.map((item) => (
								<PostCard
									key={item.id}
									post={item}
									lang={lang}
								/>
							))}
						</div>
					</section>
				)}
			</main>
		</MainLayout>
	);
}
