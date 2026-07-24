"use client";

import { motion } from "framer-motion";

export default function SectionHeader({ eyebrow, title, description, dark = false }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-80px" }}
			transition={{ duration: 0.7, ease: "easeOut" }}
			className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6"
		>
			<div className="max-w-2xl">
				<p className="text-xs font-semibold tracking-[0.35em] uppercase text-gold mb-3">{eyebrow}</p>
				<h2 className={`font-serif text-4xl lg:text-5xl font-semibold leading-[1.1] ${dark ? "text-white" : "text-stone-900"}`}>{title}</h2>
			</div>
			{description && <p className="text-stone-400 text-xs leading-relaxed max-w-xs lg:text-right">{description}</p>}
		</motion.div>
	);
}
