// components/blog/PostCard.jsx
import Image from "next/image";
import Link from "next/link";
import { formatDate, summarize } from "@/lib/ghost";

/**
 * @param {object} props
 * @param {object} props.post      Article renvoyé par la Content API
 * @param {"fr"|"en"} props.lang
 * @param {boolean} [props.featured]  Format large sur desktop
 * @param {boolean} [props.priority]  Charge l'image sans lazy-loading
 */
export default function PostCard({ post, lang, featured = false, priority = false }) {
	const href = `/${lang}/blogue/${post.slug}`;
	const tag = post.primary_tag ?? post.tags?.[0];
	const minutes = post.reading_time || 1;
	const textLength = featured ? 220 : 145;

	return (
		<article className={`aeria-card group flex overflow-hidden rounded-2xl ${featured ? "flex-col md:col-span-2 md:flex-row" : "flex-col"}`}>
			<div className={`relative overflow-hidden bg-[var(--ink)] ${featured ? "aspect-[16/10] md:aspect-auto md:w-1/2" : "aspect-[16/10]"}`}>
				{post.feature_image ? (
					<Image
						src={post.feature_image}
						alt={post.feature_image_alt || ""}
						fill
						sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
						className="object-cover"
						priority={priority}
					/>
				) : (
					<div className="absolute inset-0 grid place-items-center">
						<span className="aeria-display text-5xl text-[var(--line)]">Æ</span>
					</div>
				)}

				{tag && (
					<span className="absolute left-4 top-4 border border-white/20 bg-[var(--ink)]/82 px-2.5 py-1 text-[0.6875rem] uppercase tracking-[0.16em] text-white backdrop-blur">
						{tag.name}
					</span>
				)}
			</div>

			<div className={`flex flex-1 flex-col p-6 ${featured ? "md:justify-center md:p-9" : ""}`}>
				<div className="flex items-center gap-2 text-[0.75rem] text-[var(--muted)]">
					<time dateTime={post.published_at}>{formatDate(post.published_at, lang)}</time>
					<span
						aria-hidden
						className="text-[var(--line)]"
					>
						/
					</span>
					<span>
						{minutes} min {lang === "fr" ? "de lecture" : "read"}
					</span>
				</div>

				<h3 className={`aeria-display mt-3 text-[var(--text)] ${featured ? "text-3xl md:text-[2.5rem]" : "text-2xl"}`}>
					<Link
						href={href}
						className="after:absolute after:inset-0 after:content-[''] focus-visible:rounded-sm"
					>
						{post.title}
					</Link>
				</h3>

				<p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--muted)]">{summarize(post, textLength)}</p>

				<span className="mt-5 inline-flex items-center gap-2 text-[0.8125rem] uppercase tracking-[0.16em] text-[var(--accent)]">
					{lang === "fr" ? "Lire" : "Read"}
					<span
						aria-hidden
						className="transition-transform duration-300 group-hover:translate-x-1"
					>
						→
					</span>
				</span>
			</div>
		</article>
	);
}
