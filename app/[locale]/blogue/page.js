import Parser from "rss-parser";
import MainLayout from "@/components/layout/MainLayout";

export function generateMetadata() {
	return {
		title: "Blogue | ÆRIA Voyages",
		description: "Récits de voyage, conseils et inspirations pour votre prochaine croisière, circuit ou escapade tout compris avec ÆRIA Voyages.",
		openGraph: {
			title: "Blogue | ÆRIA Voyages",
			description: "Récits de voyage, conseils et inspirations pour votre prochaine croisière, circuit ou escapade tout compris.",
		},
	};
}

async function getPosts() {
	try {
		const parser = new Parser();
		const feed = await parser.parseURL("https://blog.aeriavoyages.com/feed");
		return feed.items.slice(0, 3);
	} catch {
		return [];
	}
}

export default async function BlogPage() {
	const posts = await getPosts();

	return (
		<MainLayout>
			<section className="bg-slate-50 py-16 px-4">
				<div className="max-w-6xl mx-auto">
					<h2 className="text-3xl font-serif text-center text-slate-800 mb-12">Récits & Inspirations d'Exception</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{posts.map((post, idx) => (
							<article key={idx} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100">
								<div className="aspect-video overflow-hidden">
									<img
										src={post.enclosure?.url}
										alt={post.title}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
									/>
								</div>

								<div className="p-6">
									<span className="text-xs font-semibold tracking-widest text-amber-600 uppercase">
										{new Date(post.pubDate).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
									</span>
									<h3 className="mt-2 text-xl font-bold text-slate-900 leading-snug group-hover:text-amber-700 transition-colors">{post.title}</h3>
									<p className="mt-3 text-slate-600 line-clamp-2 text-sm leading-relaxed">{post.contentSnippet}</p>
									<a
										href={post.link}
										target="_blank"
										rel="noopener noreferrer"
										className="mt-6 inline-flex items-center text-sm font-bold text-slate-900 border-b-2 border-amber-200 hover:border-amber-500 transition-all pb-1"
									>
										Lire l'escale
										<svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
										</svg>
									</a>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>
		</MainLayout>
	);
}
