import Link from "next/link";
import { notFound } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { SUPPLIERS, SUPPLIERS_BY_SLUG } from "@/lib/constants/suppliers";

export async function generateStaticParams() {
	return SUPPLIERS.map((supplier) => ({ slug: supplier.slug }));
}

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const supplier = SUPPLIERS_BY_SLUG[slug];

	if (!supplier) {
		return {
			title: "Fournisseur introuvable | ÆRIA Voyages",
		};
	}

	return {
		title: `${supplier.name} | Fournisseur partenaire | ÆRIA Voyages`,
		description: supplier.description,
		openGraph: {
			title: `${supplier.name} | ÆRIA Voyages`,
			description: supplier.description,
		},
	};
}

export default async function SupplierPage({ params }) {
	const { locale, slug } = await params;
	const supplier = SUPPLIERS_BY_SLUG[slug];

	if (!supplier) {
		notFound();
	}

	return (
		<MainLayout>
			<section className="relative overflow-hidden bg-[#f9f6f0] py-16 px-4">
				<div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
				<div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-stone-300/30 blur-3xl" />

				<div className="relative max-w-5xl mx-auto">
					{/* TOP NAV */}
					<Link
						href={`/${locale}`}
						className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors"
					>
						<span aria-hidden="true">←</span>
						Retour a l'accueil
					</Link>

					{/* SUPPLIER HERO */}
					<div className="mt-6 rounded-3xl border border-stone-200/80 bg-white/90 backdrop-blur-sm shadow-[0_16px_55px_rgba(35,35,35,0.08)] p-8 lg:p-12">
						<div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-8 lg:gap-12 items-center">
							<div
								className={`rounded-2xl border p-8 flex items-center justify-center min-h-45 ${supplier.isLightLogo ? "bg-[#141414] border-stone-700" : "bg-[#fcfcfb] border-stone-200"}`}
							>
								<img
									src={supplier.logoSrc}
									alt={`Logo ${supplier.name}`}
									className="max-h-16 w-auto object-contain"
								/>
							</div>

							<div>
								<p className="text-xs font-semibold tracking-[0.3em] uppercase text-gold mb-3">Fournisseur partenaire</p>
								<h1 className="font-serif text-4xl lg:text-5xl text-stone-900 leading-tight">{supplier.name}</h1>
								<p className="mt-3 text-lg text-stone-600 italic">{supplier.tagline}</p>
							</div>
						</div>
					</div>

					{/* DETAILS */}
					<div className="mt-8 rounded-3xl border border-stone-200 bg-white p-8 lg:p-10 shadow-[0_8px_30px_rgba(35,35,35,0.06)]">
						<h2 className="font-serif text-2xl text-stone-900 mb-4">A propos</h2>
						<p className="text-stone-700 leading-relaxed">{supplier.description}</p>

						<h3 className="font-serif text-xl text-stone-900 mt-8 mb-4">Points forts</h3>
						<ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
							{supplier.highlights.map((highlight) => (
								<li
									key={highlight}
									className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700"
								>
									{highlight}
								</li>
							))}
						</ul>

						<a
							href={supplier.website}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-8 inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-charcoal transition-colors"
						>
							Visiter le site officiel
						</a>
					</div>
				</div>
			</section>
		</MainLayout>
	);
}
