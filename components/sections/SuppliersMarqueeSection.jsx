"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { SUPPLIERS } from "@/lib/constants/suppliers";

const primaryTrack = [...SUPPLIERS, ...SUPPLIERS];
const secondarySeed = [...SUPPLIERS.slice(7), ...SUPPLIERS.slice(0, 7)];
const secondaryTrack = [...secondarySeed, ...secondarySeed];

function SupplierTrack({ suppliers, hrefBase, reverse = false, compact = false }) {
	return (
		<div className={`supplier-marquee-wrapper ${compact ? "is-compact" : ""}`}>
			<div className={`supplier-marquee-track ${reverse ? "is-reverse" : ""}`}>
				{suppliers.map((supplier, index) => (
					<Link
						key={`${supplier.slug}-${reverse ? "r" : "l"}-${index}`}
						href={`${hrefBase}/supplier/${supplier.slug}`}
						className="supplier-logo-link"
						aria-label={`Voir la page de ${supplier.name}`}
					>
						<img
							src={supplier.logoSrc}
							alt={`Logo ${supplier.name}`}
							loading="lazy"
							className={`supplier-logo-image ${supplier.isLightLogo ? "is-light-logo" : ""}`}
						/>
					</Link>
				))}
			</div>
		</div>
	);
}

export default function SuppliersMarqueeSection() {
	const params = useParams();
	const locale = Array.isArray(params?.locale) ? params.locale[0] : params?.locale;
	const basePath = locale ? `/${locale}` : "";

	return (
		<section className="hidden lg:block supplier-premium-section relative py-18 lg:py-24 overflow-hidden">
			{/* BACKGROUND SHAPES */}
			<div className="supplier-premium-bg supplier-premium-bg-1" />
			<div className="supplier-premium-bg supplier-premium-bg-2" />

			{/* SECTION HEADER */}
			<div className="relative max-w-7xl mx-auto px-4 lg:px-0 mb-11 lg:mb-14">
				<p className="absolute -top-16 -left-16 font-black text-[20rem] z-0 opacity-2">PARTERNAIRES</p>
				<p className="text-[11px] font-semibold tracking-[0.42em] uppercase text-gold/85 mb-4">Réseau d&apos;Exception</p>
				<div className="grid grid-cols-1 lg:grid-cols-[1.15fr,0.85fr] gap-6 lg:gap-10 items-end">
					<h2 className="font-serif text-4xl sm:text-5xl lg:text-8xl font-semibold leading-[1.01] text-stone-100 text-balance">
						Maisons Partenaires
						<span className="block text-gold mt-1.5 text-right">Triées sur le Volet</span>
					</h2>
					<p className="text-stone-300 text-sm lg:text-base leading-relaxed max-w-xl lg:justify-self-end text-right -mt-3">
						Une sélection raffinée de fournisseurs internationaux. Chaque signature vous mène vers une fiche dédiée pour mieux explorer son univers.
					</p>
				</div>
			</div>

			{/* MARQUEE LINES */}
			<div className="relative space-y-4 lg:space-y-5">
				<SupplierTrack
					suppliers={primaryTrack}
					hrefBase={basePath}
				/>
				<SupplierTrack
					suppliers={secondaryTrack}
					hrefBase={basePath}
					reverse
					compact
				/>
			</div>
		</section>
	);
}
