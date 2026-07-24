"use client";

import { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";

export default function Error({ error, unstable_retry }) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<MainLayout>
			<section className="min-h-[70vh] flex items-center justify-center px-6 py-24 text-center">
				<div className="max-w-lg">
					<p className="text-xs font-semibold tracking-[0.35em] uppercase text-gold mb-4">Une erreur est survenue</p>
					<h1 className="font-serif text-4xl lg:text-5xl font-semibold text-stone-900 mb-6">Quelque chose s'est mal passé</h1>
					<p className="text-stone-500 mb-10">
						Nos équipes ont été informées. Vous pouvez réessayer, ou revenir plus tard.
					</p>
					<button
						onClick={() => unstable_retry()}
						className="inline-flex items-center justify-center bg-charcoal hover:bg-gold text-white text-sm tracking-[0.15em] uppercase font-semibold px-8 py-3.5 transition-colors cursor-pointer"
					>
						Réessayer
					</button>
				</div>
			</section>
		</MainLayout>
	);
}
