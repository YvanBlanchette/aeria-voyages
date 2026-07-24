import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";

export default function NotFound() {
	return (
		<MainLayout>
			<section className="min-h-[70vh] flex items-center justify-center px-6 py-24 text-center">
				<div className="max-w-lg">
					<p className="text-xs font-semibold tracking-[0.35em] uppercase text-gold mb-4">Erreur 404</p>
					<h1 className="font-serif text-4xl lg:text-5xl font-semibold text-stone-900 mb-6">Cette page n'existe pas</h1>
					<p className="text-stone-500 mb-10">
						La page que vous cherchez a peut-être été déplacée ou n'existe plus. Retournez à l'accueil pour découvrir nos croisières, circuits et forfaits.
					</p>
					<Link
						href="/"
						className="inline-flex items-center justify-center bg-charcoal hover:bg-gold text-white text-sm tracking-[0.15em] uppercase font-semibold px-8 py-3.5 transition-colors"
					>
						Retour à l'accueil
					</Link>
				</div>
			</section>
		</MainLayout>
	);
}
